// app/admin/components/AdminDashboard.tsx
"use client";

import { useState, useOptimistic, startTransition } from "react";
import type { Guest, InviteToken } from "@/lib/types";
import { useLanguage } from "@/app/providers";
import { StatsCards } from "./StatsCards";
import { TokenTable } from "./TokenTable";
import { GuestTable } from "./GuestTable";
import { TokenCreateForm } from "./TokenCreateForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminDashboardProps {
  initialTokens: InviteToken[];
  initialGuests: Guest[];
}

/** 受け取りうる型を限定して any を排除 */
type BirthdateInput = string | number | Date | null | undefined;

/** birthDate を持っているかの type guard（any 不使用） */
type HasBirthDate = { birthDate?: BirthdateInput };
const hasBirthDate = (v: unknown): v is HasBirthDate =>
  typeof v === "object" && v !== null && "birthDate" in v;

const formatBirthdate = (bd: BirthdateInput): string => {
  if (!bd) return "";
  if (typeof bd === "string") {
    const m = bd.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[1]}/${m[2]}/${m[3]}` : new Date(bd).toLocaleDateString("ja-JP");
  }
  if (typeof bd === "number") {
    return new Date(bd).toLocaleDateString("ja-JP");
  }
  if (bd instanceof Date) {
    return bd.toLocaleDateString("ja-JP");
  }
  return "";
};

export function AdminDashboard({
  initialTokens,
  initialGuests,
}: AdminDashboardProps) {
  const { t } = useLanguage();
  const [tokens, setTokens] = useState(initialTokens);
  const [guests] = useState(initialGuests);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [optimisticTokens, addOptimisticToken] = useOptimistic(
    tokens,
    (state, action: { type: "add" | "delete"; token?: InviteToken; tokenId?: number }) => {
      if (action.type === "add" && action.token) {
        return [
          { ...action.token, id: state.length > 0 ? Math.max(...state.map((t) => t.id)) + 1 : 1 },
          ...state,
        ];
      } else if (action.type === "delete" && action.tokenId !== undefined) {
        return state.filter((t) => t.id !== action.tokenId);
      }
      return state;
    }
  );

  const handleSuccess = (newToken: InviteToken) => {
    // 作成は成功時に本物を追加（= 楽観更新はしない）
    setTokens((prev) => [newToken, ...prev]);
  };

  const handleTokenDeleted = (tokenId: number) => {
    // useOptimistic の setter は Transition 内で呼ぶ
    startTransition(() => addOptimisticToken({ type: "delete", tokenId }));
    setTokens((prev) => prev.filter((t) => t.id !== tokenId));
  };

const exportToExcel = async () => {
  if (typeof window === "undefined") return;
  const XLSX = await import("xlsx");

  const toDate = (d: string | Date | null | undefined) =>
    d ? (typeof d === "string" ? d.slice(0, 10) : d.toISOString().slice(0, 10)) : "";

  const jpAttendance = (a: string | null | undefined) =>
    a === "ATTEND" ? "出席" : a === "DECLINE" ? "欠席" : "";

  const jpBool = (b: boolean) => (b ? "あり" : "");

  const attendanceRank = (a: string | null | undefined) =>
    a === "ATTEND" ? 0 : a === "DECLINE" ? 1 : 2;

  const birthEpoch = (d: string | Date | null | undefined) => {
    if (!d) return Number.POSITIVE_INFINITY; // 生年月日未設定は最後
    const date = typeof d === "string" ? new Date(d) : d;
    const t = date?.getTime();
    return Number.isFinite(t) ? (t as number) : Number.POSITIVE_INFINITY;
  };

  // --- Canvas でテキスト幅（px）を測る ---
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  // Excelで日本語が多い前提。お好みで調整可（Excel既定は 11pt Calibri）
  ctx.font = '14px "Yu Gothic", "Meiryo", "Noto Sans JP", "Segoe UI", "Calibri", sans-serif';

  const measurePx = (val: unknown) => {
    if (val === null || val === undefined) return 0;
    // 改行が含まれていたら各行の最長を採用
    const lines = String(val).split(/\r?\n/);
    let max = 0;
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      if (w > max) max = w;
    }
    return max;
  };

  // データ＋ヘッダから wpx を算出
  const fitColsWpx = (rows: Record<string, unknown>[], headers: string[]) =>
    headers.map(h => {
      const maxPx = Math.max(measurePx(h), ...rows.map(r => measurePx(r[h])));
      return { wpx: Math.ceil(maxPx) + 8 };
    });

  // ----- 並び替えたゲスト配列（出欠 → 姓 → 生年月日(年上) → 名） -----
  const sortedGuests = [...guests].sort((a, b) => {
    const ar = attendanceRank(a.attendance) - attendanceRank(b.attendance);
    if (ar !== 0) return ar;
    const ln = (a.lastName ?? "").localeCompare(b.lastName ?? "", "ja");
    if (ln !== 0) return ln;
    const be = birthEpoch(a.birthDate) - birthEpoch(b.birthDate); // 年上順
    if (be !== 0) return be;
    const fn = (a.firstName ?? "").localeCompare(b.firstName ?? "", "ja");
    if (fn !== 0) return fn;
    return (a.id ?? 0) - (b.id ?? 0);
  });

  // ----- ゲスト一覧 -----
  const guestsRows = sortedGuests.map(g => {
    const allergenItems = g.allergies ?? [];
    const hasDog = allergenItems.some(a => a.allergen.category === "DOG");
    const foodOnly = allergenItems
      .filter(a => a.allergen.category === "FOOD")
      .map(a => a.allergen.name);

    return {
      "姓": g.lastName,
      "名": g.firstName,
      "生年月日": toDate(g.birthDate),
      "出欠": jpAttendance(g.attendance),
      "メールアドレス": g.email ?? "",
      "電話番号": g.phone ?? "",
      "犬アレルギー": jpBool(hasDog),
      "食品アレルギー": foodOnly.join("、"),
    };
  });

  const guestsHeaders = [
    "姓","名","生年月日","出欠","メールアドレス","電話番号","犬アレルギー","食品アレルギー",
  ];
  const guestsSheet = XLSX.utils.json_to_sheet(guestsRows, { header: guestsHeaders });
  guestsSheet["!cols"] = fitColsWpx(guestsRows, guestsHeaders); // ← pxベースでしっかり広げる

  // ----- アレルギー（アレルゲン=行名、該当者は「、」区切り、行は“該当者の名前順”）-----
  const allergenMap = new Map<string, Set<string>>();
  for (const g of guests) {
    const full = `${g.lastName}${g.firstName}`; // 姓名連結（スペースなし）
    for (const a of (g.allergies ?? [])) {
      const label = a.allergen.category === "DOG" ? "犬" : a.allergen.name;
      if (!allergenMap.has(label)) allergenMap.set(label, new Set());
      allergenMap.get(label)!.add(full);
    }
  }

  const allergenEntries = Array.from(allergenMap.entries())
    .map(([label, set]) => {
      const namesArr = Array.from(set).sort((x, y) => x.localeCompare(y, "ja"));
      return { label, namesArr, namesStr: namesArr.join("、") };
    })
    .sort((x, y) => (x.namesArr[0] ?? "").localeCompare(y.namesArr[0] ?? "", "ja"));

  const allergyRows = allergenEntries.map(row => ({
    "アレルゲン": row.label,
    "該当者": row.namesStr,
  }));

  const allergyHeaders = ["アレルゲン", "該当者"];
  const allergySheet = XLSX.utils.json_to_sheet(allergyRows, { header: allergyHeaders });
  allergySheet["!cols"] = fitColsWpx(allergyRows, allergyHeaders);

  // ----- ブック作成・ダウンロード -----
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, guestsSheet, "ゲスト一覧");
  XLSX.utils.book_append_sheet(wb, allergySheet, "アレルギー");

  const ab = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const blob = new Blob([ab], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rsvp_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};


  return (
    <>
      <StatsCards tokens={tokens} guests={guests} />

      <Tabs defaultValue="tokens" className="space-y-6 mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tokens">{t("admin.tabs.tokens")}</TabsTrigger>
          <TabsTrigger value="guests">{t("admin.tabs.guests")}</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens">
          <TokenTable
            tokens={optimisticTokens}
            onNewClick={() => setIsCreateDialogOpen(true)}
            onTokenDeleted={handleTokenDeleted}
          />
        </TabsContent>

        <TabsContent value="guests">
          <GuestTable guests={guests} onExportClick={exportToExcel} />
        </TabsContent>
      </Tabs>

      {isCreateDialogOpen && (
        <TokenCreateForm
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

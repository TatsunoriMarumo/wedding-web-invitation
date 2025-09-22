// app/admin/components/AdminDashboard.tsx
"use client";

import { useState, useOptimistic } from "react";
import { Guest, InviteToken } from "@/lib/types";
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

const formatBirthdate = (bd: unknown) => {
  if (!bd) return "";
  if (typeof bd === "string") {
    const m = bd.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[1]}/${m[2]}/${m[3]}` : new Date(bd).toLocaleDateString("ja-JP");
  }
  if (bd instanceof Date) return bd.toLocaleDateString("ja-JP");
  try {
    return new Date(bd as any).toLocaleDateString("ja-JP");
  } catch {
    return "";
  }
};

export function AdminDashboard({
  initialTokens,
  initialGuests,
}: AdminDashboardProps) {
  const { t } = useLanguage();
  const [tokens, setTokens] = useState(initialTokens);
  const [guests, setGuests] = useState(initialGuests);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [optimisticTokens, addOptimisticToken] = useOptimistic(
    tokens,
    (state, action: { type: "add" | "delete"; token?: InviteToken; tokenId?: number }) => {
      if (action.type === "add" && action.token) {
        return [
          { ...action.token, id: state.length > 0 ? Math.max(...state.map(t => t.id)) + 1 : 1 },
          ...state
        ];
      } else if (action.type === "delete" && action.tokenId !== undefined) {
        return state.filter(t => t.id !== action.tokenId);
      }
      return state;
    }
  );

  const handleSuccess = (newToken: InviteToken) => {
    setTokens((prev) => [newToken, ...prev]);
  };

  const handleTokenDeleted = (tokenId: number) => {
    addOptimisticToken({ type: "delete", tokenId });
    setTokens((prev) => prev.filter(t => t.id !== tokenId));
  };

  const exportToExcel = () => {
    // ★ CSVに生年月日列を追加
    const csvContent = [
      ["姓", "名", "メールアドレス", "電話番号", "出欠", "アレルギー", "生年月日", "登録日時"],
      ...guests.map((guest) => [
        guest.lastName,
        guest.firstName,
        guest.email || "",
        guest.phone || "",
        guest.attendance === "ATTEND" ? "出席" : "欠席",
        guest.allergies.map((a) => a.allergen.name).join(", "),
        formatBirthdate((guest as any).birthDate),
        new Date(guest.createdAt).toLocaleString("ja-JP"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `参加者一覧_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <GuestTable
            guests={guests}
            onExportClick={exportToExcel}
          />
        </TabsContent>
      </Tabs>

      {isCreateDialogOpen && (
        <TokenCreateForm
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={handleSuccess}
          addOptimisticToken={(token: InviteToken) => addOptimisticToken({ type: "add", token })}
        />
      )}
    </>
  );
}

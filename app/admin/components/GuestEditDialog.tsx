// app/admin/components/GuestEditDialog.tsx
"use client";

import { useMemo, useState, useActionState, startTransition, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { updateGuestAction } from "@/app/admin/actions"; // ← あなたの配置に合わせて
import type { Guest } from "@/lib/types";
import { useLanguage } from "@/app/providers";

/* ===========================
 * Birthdate (JP) - RsvpForm風
 * =========================== */

type YMD = { y: number | ""; m: number | ""; d: number | "" };

function BirthdateJP({
  label,
  value,
  onChange,
  required,
  error,
}: {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (iso: string) => void;
  required?: boolean;
  error?: string;
}) {
  const today = useMemo(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
  }, []);
  const START_YEAR = 1900;

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const ymdToISO = (y: number, m: number, d: number) => `${y}-${pad2(m)}-${pad2(d)}`;
  const isValidYMD = (y?: number, m?: number, d?: number) => {
    if (!y || !m || !d) return false;
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() + 1 === m && dt.getUTCDate() === d;
  };

  const parseISO = (iso?: string): YMD => {
    const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return { y: "", m: "", d: "" };
    return { y: parseInt(m[1], 10), m: parseInt(m[2], 10), d: parseInt(m[3], 10) };
  };

  const [local, setLocal] = useState<YMD>(() => parseISO(value));

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = today.y; y >= START_YEAR; y--) arr.push(y);
    return arr;
  }, [today.y]);

  const months = useMemo(() => {
    if (local.y === "") return [];
    const maxM = local.y === today.y ? today.m : 12;
    return Array.from({ length: maxM }, (_, i) => i + 1);
  }, [local.y, today.y, today.m]);

  const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const days = useMemo(() => {
    if (local.y === "" || local.m === "") return [];
    const y = local.y as number;
    const m = local.m as number;
    const maxDAll = daysInMonth(y, m);
    const isThisMonth = y === today.y && m === today.m;
    const maxD = isThisMonth ? Math.min(maxDAll, today.d) : maxDAll;
    return Array.from({ length: maxD }, (_, i) => i + 1);
  }, [local.y, local.m, today.y, today.m, today.d]);

  const emitIfComplete = (next: YMD) => {
    if (typeof next.y === "number" && typeof next.m === "number" && typeof next.d === "number") {
      if (isValidYMD(next.y, next.m, next.d)) {
        onChange(ymdToISO(next.y, next.m, next.d));
        return;
      }
    }
    onChange(""); // 未完成/不正は空
  };

  const onYearChange = (val: string) => {
    const y: number | "" = val ? parseInt(val, 10) : "";
    let m: number | "" = local.m;
    let d: number | "" = local.d;

    if (typeof y === "number") {
      const maxM = y === today.y ? today.m : 12;
      if (typeof m === "number" && m > maxM) {
        m = "";
        d = "";
      }
      if (typeof m === "number") {
        const maxDAll = daysInMonth(y, m);
        const isThisMonth = y === today.y && m === today.m;
        const maxD = isThisMonth ? Math.min(maxDAll, today.d) : maxDAll;
        if (typeof d === "number" && d > maxD) d = "";
      }
    } else {
      m = "";
      d = "";
    }

    const next: YMD = { y, m, d };
    setLocal(next);
    emitIfComplete(next);
  };

  const onMonthChange = (val: string) => {
    const m: number | "" = val ? parseInt(val, 10) : "";
    let d: number | "" = local.d;

    if (typeof m === "number" && typeof local.y === "number") {
      const y = local.y;
      const maxDAll = daysInMonth(y, m);
      const isThisMonth = y === today.y && m === today.m;
      const maxD = isThisMonth ? Math.min(maxDAll, today.d) : maxDAll;
      if (typeof d === "number" && d > maxD) d = "";
    } else {
      d = "";
    }

    const next: YMD = { y: local.y, m, d };
    setLocal(next);
    emitIfComplete(next);
  };

  const onDayChange = (val: string) => {
    const d: number | "" = val ? parseInt(val, 10) : "";
    const next: YMD = { y: local.y, m: local.m, d };
    setLocal(next);
    emitIfComplete(next);
  };

  const selCls = (hasErr: boolean) =>
    `px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
      hasErr ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required ? "*" : ""}
      </label>
      <div className="flex gap-2">
        <select
          required={required}
          value={local.y === "" ? "" : local.y}
          onChange={(e) => onYearChange(e.target.value)}
          className={`w-28 ${selCls(!!error)}`}
        >
          <option value="">年</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}年
            </option>
          ))}
        </select>

        <select
          required={required}
          value={local.m === "" ? "" : local.m}
          onChange={(e) => onMonthChange(e.target.value)}
          className={`w-24 ${selCls(!!error)}`}
          disabled={local.y === ""}
        >
          <option value="">月</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}月
            </option>
          ))}
        </select>

        <select
          required={required}
          value={local.d === "" ? "" : local.d}
          onChange={(e) => onDayChange(e.target.value)}
          className={`w-24 ${selCls(!!error)}`}
          disabled={local.y === "" || local.m === ""}
        >
          <option value="">日</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}日
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2 text-xs text-gray-500">形式：YYYY/MM/DD（例：1990/06/15）</p>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function FieldErrorLine({ message }: { message?: string | null }) {
  return (
    <p
      aria-live="polite"
      aria-hidden={!message}
      className={`mt-1 text-sm h-5 leading-5 ${
        message ? "text-red-600" : "text-transparent"
      }`}
    >
      {message || "." /* 高さを安定させるダミー */}
    </p>
  );
}

/* ===========================
 * 編集ダイアログ（RsvpForm寄せ）
 * =========================== */

type SubmitState = { ok: boolean; error?: string; updated?: Guest };

const COMMON_ALLERGENS = ["卵", "乳製品", "小麦", "そば", "落花生", "えび", "かに", "大豆", "ナッツ類", "魚介類"];

const normStr = (s?: string | null) => (s ?? "").trim();

type BirthValue = Guest["birthDate"] | null | undefined;

const toISO10 = (d: BirthValue): string => {
  if (!d) return "";
  try {
    if (typeof d === "string") {
      // すでにYYYY-MM-DDならそのまま10桁
      if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
      // 文字列日時ならparseしてYYYY-MM-DD化
      const t = Date.parse(d);
      if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
      return "";
    }
    if (d instanceof Date) {
      return d.toISOString().slice(0, 10);
    }
    return "";
  } catch {
    return "";
  }
};

const uniqSort = (arr: string[]) => Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean))).sort();
const arrEq = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

export default function GuestEditDialog({
  guest,
  open,
  onClose,
  onUpdated,
}: {
  guest: Guest;
  open: boolean;
  onClose: () => void;
  onUpdated: (g: Guest) => void;
}) {
  const { t } = useLanguage();

  // --- 初期値 ---
  const initFoods = useMemo(
    () => (guest.allergies ?? []).filter((a) => a.allergen.category === "FOOD").map((a) => a.allergen.name),
    [guest.allergies]
  );
  const initial = useMemo(() => {
    const birthISO = toISO10(guest.birthDate);
    const dog = guest.allergies?.some((a) => a.allergen.category === "DOG") ?? false;
    return {
      lastName: normStr(guest.lastName),
      firstName: normStr(guest.firstName),
      birthDate: birthISO,
      email: normStr(guest.email),
      phone: normStr(guest.phone),
      attendance: guest.attendance as "ATTEND" | "DECLINE",
      dogAllergy: dog,
      foods: uniqSort(initFoods),
    };
  }, [guest, initFoods]);

  const [lastName, setLastName] = useState(initial.lastName);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [birthDate, setBirthDate] = useState(initial.birthDate);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [attendance, setAttendance] = useState<"ATTEND" | "DECLINE">(initial.attendance);
  const [dogAllergy, setDogAllergy] = useState<boolean>(initial.dogAllergy);
  const [foods, setFoods] = useState<string[]>(initial.foods);
  const [showAllergenSelect, setShowAllergenSelect] = useState(false);
  const [customAllergen, setCustomAllergen] = useState("");

  // ▼ 姓・名のバリデーション（赤字エラー表示）
  const [lnErr, setLnErr] = useState<string | null>(null);
  const [fnErr, setFnErr] = useState<string | null>(null);

  const validateNames = () => {
    const ln = normStr(lastName);
    const fn = normStr(firstName);
    const lnE = ln ? null : t("rsvp.form.validation.requiredLastName");
    const fnE = fn ? null : t("rsvp.form.validation.requiredFirstName");
    setLnErr(lnE);
    setFnErr(fnE);
    return !lnE && !fnE;
  };

  // ▲ ここまで

  const [state, dispatch, pending] = useActionState<SubmitState, FormData>(
    async (_prev, fd) => {
      const res = await updateGuestAction(fd);
      if (res.ok) return { ok: true, updated: res.updated as Guest };
      return { ok: false, error: res.error };
    },
    { ok: false }
  );

  // ✅ 成功時の親更新・クローズは useEffect で
  useEffect(() => {
    if (state.ok && state.updated) {
      onUpdated(state.updated);
      onClose();
    }
  }, [state.ok, state.updated, onUpdated, onClose]);

  // 変更有無（全フィールドが元と完全一致なら false）
  const isDirty = useMemo(() => {
    const curr = {
      lastName: normStr(lastName),
      firstName: normStr(firstName),
      birthDate,
      email: normStr(email),
      phone: normStr(phone),
      attendance,
      dogAllergy,
      foods: uniqSort(foods),
    };
    return !(
      curr.lastName === initial.lastName &&
      curr.firstName === initial.firstName &&
      curr.birthDate === initial.birthDate &&
      curr.email === initial.email &&
      curr.phone === initial.phone &&
      curr.attendance === initial.attendance &&
      curr.dogAllergy === initial.dogAllergy &&
      arrEq(curr.foods, initial.foods)
    );
  }, [lastName, firstName, birthDate, email, phone, attendance, dogAllergy, foods, initial]);

  const addFoodAllergy = (nameRaw: string) => {
    const name = nameRaw.trim();
    if (!name) return;
    setFoods((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setCustomAllergen("");
  };
  const removeFoodAllergy = (name: string) => setFoods((prev) => prev.filter((x) => x !== name));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ▼ 姓名の必須チェック（未入力なら赤字表示して送信しない）
    if (!validateNames()) return;

    const payload = {
      id: guest.id,
      lastName: normStr(lastName),
      firstName: normStr(firstName),
      birthDate, // YYYY-MM-DD
      email: normStr(email) || null,
      phone: normStr(phone) || null,
      attendance,
      dogAllergy,
      foodAllergies: uniqSort(foods),
    };
    const fd = new FormData();
    fd.set("payload", JSON.stringify(payload));

    startTransition(() => {
      dispatch(fd);
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden">
        <form noValidate onInvalid={(e) => e.preventDefault()} onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-2xl font-semibold text-gray-800">
              {t("admin.guests.editDialog.title")}
            </DialogTitle>
          </DialogHeader>

          {/* エラーバナー */}
          {state.error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{state.error}</div>
          )}

          <div className="space-y-6">
            {/* 氏名 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("rsvp.form.lastname")} *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (lnErr) setLnErr(null); // 入力でエラー消去
                  }}
                  onBlur={() => {
                    if (!normStr(lastName)) setLnErr(t("rsvp.form.validation.requiredLastName"));
                  }}
                  aria-invalid={!!lnErr}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                    lnErr ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <FieldErrorLine message={lnErr} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("rsvp.form.firstname")} *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (fnErr) setFnErr(null);
                  }}
                  onBlur={() => {
                    if (!normStr(firstName)) setFnErr(t("rsvp.form.validation.requiredFirstName"));
                  }}
                  aria-invalid={!!fnErr}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                    fnErr ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <FieldErrorLine message={fnErr} />
              </div>
            </div>

            {/* 生年月日（日本式セレクト） */}
            <BirthdateJP
              label={t("rsvp.form.birthdate")}
              value={birthDate}
              onChange={(iso) => setBirthDate(iso)}
              required
            />

            {/* 連絡先 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("rsvp.form.email")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("rsvp.form.phone")}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all border-gray-300"
                />
              </div>
            </div>

            {/* 出欠（2択ボタン / RsvpForm風） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t("rsvp.form.attendance")}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAttendance("ATTEND")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    attendance === "ATTEND"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  {t("rsvp.form.attend")}
                </button>

                <button
                  type="button"
                  onClick={() => setAttendance("DECLINE")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    attendance === "DECLINE"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  {t("rsvp.form.decline")}
                </button>
              </div>
            </div>

            {/* アレルギー（犬 Yes/No + 食品チップ & よくあるアレルゲン） */}
            <div className="space-y-4">
              {/* 犬アレルギー */}
              <div>
                <p className="text-sm text-gray-700 mb-2">{t("rsvp.form.health.dogAllergy")}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDogAllergy(false)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      !dogAllergy ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    {t("rsvp.form.health.no")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDogAllergy(true)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      dogAllergy ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    {t("rsvp.form.health.yes")}
                  </button>
                </div>
              </div>

              {/* 食品アレルギー */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-700">{t("rsvp.form.health.foodAllergy")}</p>
                  <button
                    type="button"
                    className="text-pink-600 text-sm"
                    onClick={() => setShowAllergenSelect((v) => !v)}
                  >
                    {showAllergenSelect ? t("rsvp.form.health.close") : t("rsvp.form.health.add")}
                  </button>
                </div>

                {foods.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {foods.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                      >
                        {name}
                        <button
                          type="button"
                          onClick={() => removeFoodAllergy(name)}
                          className="ml-2 hover:text-orange-600"
                          aria-label="remove"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {showAllergenSelect && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">{t("rsvp.form.health.commonAllergens")}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                      {COMMON_ALLERGENS.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => addFoodAllergy(name)}
                          className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
                        >
                          {name}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customAllergen}
                        onChange={(e) => setCustomAllergen(e.target.value)}
                        placeholder={t("rsvp.form.health.foodAllergyPlaceholder")}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addFoodAllergy(customAllergen);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => addFoodAllergy(customAllergen)}
                        className="px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                      >
                        {t("rsvp.form.health.add")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {t("admin.guests.editDialog.cancel")}
            </button>
            <button
              type="submit"
              disabled={pending || !isDirty /* ← 変更がなければ無効化 */}
              className="ml-auto px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:bg-gray-300 transition-colors"
            >
              {pending ? t("rsvp.form.submitting") : t("admin.guests.editDialog.save")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

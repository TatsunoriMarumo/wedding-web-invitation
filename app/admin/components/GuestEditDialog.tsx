// app/admin/components/GuestEditDialog.tsx
"use client";

import { useMemo, useState, useActionState, startTransition, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { updateGuestAction } from "@/app/admin/actions";
import type { Guest } from "@/lib/types";
import { useLanguage } from "@/app/providers";

/* ===========================
 * 共通：エラーテキスト行（高さ安定）
 * =========================== */
function FieldErrorLine({ message }: { message?: string | null }) {
  return (
    <p
      aria-live="polite"
      aria-hidden={!message}
      className={`mt-1 text-sm h-5 leading-5 ${message ? "text-red-600" : "text-transparent"}`}
    >
      {message || "." /* 高さ安定用のダミー */}
    </p>
  );
}

/* ===========================
 * 生年月日（RsvpForm と同じ数値入力UI）
 * =========================== */

const pad2 = (n: number) => String(n).padStart(2, "0");
const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
const isoToDate = (iso?: string) => {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

type YMD = { y: string; m: string; d: string };

function BirthdateInputsJP({
  label,
  value,
  onChange,
  required,
  error,
}: {
  label: string;
  value: string; // YYYY-MM-DD or "INVALID" or ""
  onChange: (isoOrInvalid: string) => void;
  required?: boolean;
  error?: string;
}) {
  const today = useMemo(() => new Date(), []);
  const fromYear = 1900;

  const parseISO = (iso?: string): YMD => {
    const d = isoToDate(iso);
    if (!d) return { y: "", m: "", d: "" };
    return { y: String(d.getFullYear()), m: String(d.getMonth() + 1), d: String(d.getDate()) };
  };

  const [local, setLocal] = useState<YMD>(() => parseISO(value));
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!value || value === "INVALID") {
      setLocalError(value === "INVALID" ? "無効な日付です" : null);
      if (!value) setLocal(parseISO(value));
    } else {
      setLocal(parseISO(value));
      setLocalError(null);
    }
  }, [value]);

  const onlyDigits = (s: string) => s.replace(/\D/g, "");

  const emit = (next: YMD) => {
    const y = Number(next.y), m = Number(next.m), d = Number(next.d);

    // 未完成はエラーなし・空値
    if (!y || !m || !d) {
      setLocalError(null);
      onChange("");
      return;
    }

    if (y < fromYear || m < 1 || m > 12 || d < 1 || d > 31) {
      setLocalError("無効な日付です");
      onChange("INVALID");
      return;
    }

    const maxD = daysInMonth(y, m);
    if (d > maxD) {
      setLocalError("無効な日付です");
      onChange("INVALID");
      return;
    }

    const dt = new Date(y, m - 1, d);
    if (dt > today) {
      setLocalError("無効な日付です");
      onChange("INVALID");
      return;
    }

    setLocalError(null);
    onChange(`${y}-${pad2(m)}-${pad2(d)}`);
  };

  const setYear = (raw: string) => {
    const y = onlyDigits(raw).slice(0, 4);
    const next = { ...local, y };
    setLocal(next);
    emit(next);
  };

  const setMonth = (raw: string) => {
    let mm = onlyDigits(raw).slice(0, 2);
    if (mm) mm = String(Math.min(parseInt(mm, 10), 12));
    const next = { ...local, m: mm };
    setLocal(next);
    emit(next);
  };

  const setDay = (raw: string) => {
    let dd = onlyDigits(raw).slice(0, 2);
    if (dd) dd = String(Math.min(parseInt(dd, 10), 31));
    const next = { ...local, d: dd };
    setLocal(next);
    emit(next);
  };

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const normalizeMonth = () => {
    if (!local.m) return;
    const fixed = String(clamp(Number(local.m), 1, 12));
    if (fixed !== local.m) {
      const next = { ...local, m: fixed };
      setLocal(next);
      emit(next);
    }
  };
  const normalizeDay = () => {
    if (!local.y || !local.m || !local.d) return;
    const maxD = daysInMonth(Number(local.y), Number(local.m));
    const fixed = String(clamp(Number(local.d), 1, maxD));
    if (fixed !== local.d) {
      const next = { ...local, d: fixed };
      setLocal(next);
      emit(next);
    }
  };

  const baseCls = (hasErr: boolean) =>
    `px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent
     ${hasErr ? "border-red-500" : "border-gray-300"}`;

  const mergedError = localError || error;

  return (
    <div className="scroll-mt-24">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required ? "*" : ""}
      </label>

      <div className="grid grid-cols-3 gap-2">
        {/* 年 */}
        <div className="flex items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="YYYY"
            value={local.y}
            onChange={(e) => setYear(e.target.value)}
            className={`w-full min-w-0 ${baseCls(!!mergedError)}`}
            aria-invalid={!!mergedError}
          />
          <span className="text-sm text-gray-600">年</span>
        </div>

        {/* 月 */}
        <div className="flex items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            placeholder="MM"
            value={local.m}
            onChange={(e) => setMonth(e.target.value)}
            onBlur={normalizeMonth}
            className={`w-full min-w-0 ${baseCls(!!mergedError)}`}
            aria-invalid={!!mergedError}
          />
          <span className="text-sm text-gray-600">月</span>
        </div>

        {/* 日 */}
        <div className="flex items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            placeholder="DD"
            value={local.d}
            onChange={(e) => setDay(e.target.value)}
            onBlur={normalizeDay}
            className={`w-full min-w-0 ${baseCls(!!mergedError)}`}
            aria-invalid={!!mergedError}
          />
          <span className="text-sm text-gray-600">日</span>
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">形式：YYYY/MM/DD（例：1990/06/15）</p>
      <FieldErrorLine message={mergedError} />
    </div>
  );
}

/* ===========================
 * 編集ダイアログ（モバイルファースト）
 * =========================== */

type SubmitState = { ok: boolean; error?: string; updated?: Guest };

const COMMON_ALLERGENS = ["卵", "乳製品", "小麦", "そば", "落花生", "えび", "かに", "大豆", "ナッツ類", "魚介類"];
const normStr = (s?: string | null) => (s ?? "").trim();
const uniqSort = (arr: string[]) => Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean))).sort();
const arrEq = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

const toISO10 = (d: Guest["birthDate"] | null | undefined): string => {
  if (!d) return "";
  try {
    if (typeof d === "string") {
      if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
      const t = Date.parse(d);
      if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
      return "";
    }
    if (d instanceof Date) return d.toISOString().slice(0, 10);
    return "";
  } catch {
    return "";
  }
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

  // ▼ 姓・名の必須エラー
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

  const [state, dispatch, pending] = useActionState<SubmitState, FormData>(
    async (_prev, fd) => {
      const res = await updateGuestAction(fd);
      if (res.ok) return { ok: true, updated: res.updated as Guest };
      return { ok: false, error: res.error };
    },
    { ok: false }
  );

  useEffect(() => {
    if (state.ok && state.updated) {
      onUpdated(state.updated);
      onClose();
    }
  }, [state.ok, state.updated, onUpdated, onClose]);

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
    if (!validateNames()) return;

    const payload = {
      id: guest.id,
      lastName: normStr(lastName),
      firstName: normStr(firstName),
      birthDate, // YYYY-MM-DD or ""
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

  // 「その他を追加」入力の有効/無効
  const canAddCustom = customAllergen.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* モバイル優先：幅は画面-16px、背の高い端末でも 90dvh 内に収めて縦スクロール */}
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl rounded-2xl p-0 max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto scrollbar-hide">
        <form
          noValidate
          onInvalid={(e) => e.preventDefault()}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-4 sm:p-8"
        >
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-800">
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
                    if (lnErr) setLnErr(null);
                  }}
                  onBlur={() => {
                    if (!normStr(lastName)) setLnErr(t("rsvp.form.validation.requiredLastName"));
                  }}
                  aria-invalid={!!lnErr}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${lnErr ? "border-red-500" : "border-gray-300"
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${fnErr ? "border-red-500" : "border-gray-300"
                    }`}
                />
                <FieldErrorLine message={fnErr} />
              </div>
            </div>

            {/* 生年月日（RsvpForm と同じ数値入力UI） */}
            <BirthdateInputsJP
              label={t("rsvp.form.birthdate")}
              value={birthDate}
              onChange={(isoOrInvalid) => setBirthDate(isoOrInvalid)}
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
                  className={`p-4 rounded-xl border-2 transition-all ${attendance === "ATTEND"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-green-300"
                    }`}
                >
                  {t("rsvp.form.attend")}
                </button>

                <button
                  type="button"
                  onClick={() => setAttendance("DECLINE")}
                  className={`p-4 rounded-xl border-2 transition-all ${attendance === "DECLINE"
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
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${!dogAllergy ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-green-300"
                      }`}
                  >
                    {t("rsvp.form.health.no")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDogAllergy(true)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${dogAllergy ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 hover:border-red-300"
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
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 max-w-full"
                      >
                        <span className="truncate">{name}</span>
                        <button
                          type="button"
                          onClick={() => removeFoodAllergy(name)}
                          className="ml-2 hover:text-orange-600 shrink-0"
                          aria-label="remove"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {showAllergenSelect && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 overflow-hidden">
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

                    {/* 入力＋追加（モバイルは縦積み、未入力はdisabled） */}
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full">
                      <input
                        type="text"
                        value={customAllergen}
                        onChange={(e) => setCustomAllergen(e.target.value)}
                        placeholder={t("rsvp.form.health.foodAllergyPlaceholder")}
                        className="flex-1 w-full min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (customAllergen.trim()) addFoodAllergy(customAllergen);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => addFoodAllergy(customAllergen)}
                        disabled={!canAddCustom}
                        className="px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm w-full sm:w-auto shrink-0 disabled:bg-gray-300"
                      >
                        {t("rsvp.form.health.add")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8">
            <div className="flex w-full items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t("admin.guests.editDialog.cancel")}
              </button>
              <button
                type="submit"
                disabled={pending || !isDirty}
                className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:bg-gray-300 transition-colors"
              >
                {pending ? t("rsvp.form.submitting") : t("admin.guests.editDialog.save")}
              </button>
            </div>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}

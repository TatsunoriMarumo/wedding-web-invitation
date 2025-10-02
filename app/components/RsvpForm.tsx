"use client";

import { useState, useMemo, useEffect, useActionState, startTransition, useRef } from "react";
import { useFormStatus } from "react-dom";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { submitRsvp, checkDuplicateAction, checkDuplicateDirect } from "@/app/rsvp/actions";
import { useLanguage } from "../providers";
import { z } from "zod";

/* ===========================
 * Types
 * =========================== */

interface AllergyItem {
  id: string;
  type: "dog" | "food";
  allergen: string;
}

interface Person {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  // ISO: YYYY-MM-DD or "INVALID" while editing
  birthDate: string;
  allergies: AllergyItem[];
}

interface RsvpFormState {
  mainGuest: Person;
  attendance: "attend" | "decline" | "";
  companions: Person[];
}

type Step = 1 | 2 | 3 | 4;

type DupResult = { ok: boolean; error?: string };
type SubmitState = { success: boolean; error?: string };

/* ===========================
 * Utilities
 * =========================== */

type SubmitApiResult = { success: boolean; error?: unknown };

function isSubmitApiResult(v: unknown): v is SubmitApiResult {
  return typeof v === "object" && v !== null && "success" in v && typeof (v as { success: unknown }).success === "boolean";
}

function FieldErrorLine({
  message,
  className = "",
}: {
  message?: string | null;
  className?: string;
}) {
  return (
    <p
      aria-live="polite"
      aria-hidden={!message}
      className={`text-sm h-5 leading-5 ${message ? "text-red-600" : "text-transparent"} ${className}`}
    >
      {message || "." /* 高さ確保のダミー */}
    </p>
  );
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const isoToSlash = (iso: string) => (iso ? iso.replaceAll("-", "/") : "");
const isoToDate = (iso?: string) => {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};
const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

// エラーを常に string に正規化
function normalizeError(e: unknown): string {
  if (e == null) return "不明なエラーが発生しました。";
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;
  if (Array.isArray(e)) {
    return e
      .flat(Infinity as 1)
      .filter((x): x is string => typeof x === "string")
      .join(" / ");
  }
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

/* ===========================
 * Birthdate (numeric inputs, JA)
 * =========================== */

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
    // 親からの変更（クリアなど）を同期
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

    // 範囲チェック（月は1-12、日は1-31）※入力中に超過させないが保険でチェック
    if (y < fromYear || m < 1 || m > 12 || d < 1 || d > 31) {
      setLocalError("無効な日付です");
      onChange("INVALID");
      return;
    }

    // 実在チェック（うるう年含む）
    const maxD = daysInMonth(y, m);
    if (d > maxD) {
      setLocalError("無効な日付です");
      onChange("INVALID");
      return;
    }

    // 未来日を不可
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
    // 入力中から13以上を許可しない（即時クランプ）
    if (mm) mm = String(Math.min(parseInt(mm, 10), 12));
    const next = { ...local, m: mm };
    setLocal(next);
    emit(next);
  };

  const setDay = (raw: string) => {
    let dd = onlyDigits(raw).slice(0, 2);
    // 入力中から32以上を許可しない（即時クランプ）
    if (dd) dd = String(Math.min(parseInt(dd, 10), 31));
    const next = { ...local, d: dd };
    setLocal(next);
    emit(next);
  };

  // 失焦時の保険：月1-12、日1-月末へ補正
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
 * UI helpers
 * =========================== */

const COMMON_ALLERGENS = [
  "卵",
  "乳製品",
  "小麦",
  "そば",
  "落花生",
  "えび",
  "かに",
  "大豆",
  "ナッツ類",
  "魚介類",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 rounded-xl bg-pink-500 text-white hover:bg-pink-600 disabled:bg-gray-300 transition-colors"
    >
      {pending ? t("rsvp.form.submitting") : t("rsvp.form.submit")}
    </button>
  );
}

/* ===========================
 * Allergy Input
 * =========================== */

function AllergyInput({
  person,
  onUpdate,
}: {
  person: Person;
  onUpdate: (allergies: AllergyItem[]) => void;
}) {
  const { t } = useLanguage();
  const [showAllergenSelect, setShowAllergenSelect] = useState(false);
  const [customAllergen, setCustomAllergen] = useState("");
  const customInputRef = useRef<HTMLInputElement | null>(null);

  const hasDogAllergy = person.allergies.some((a) => a.type === "dog");
  const foodAllergies = person.allergies.filter((a) => a.type === "food");

  const setDogAllergy = (value: boolean) => {
    const has = person.allergies.some((a) => a.type === "dog");
    if (value === has) return;
    if (value) {
      const newAllergy: AllergyItem = {
        id: crypto.randomUUID(),
        type: "dog",
        allergen: "犬",
      };
      onUpdate([...person.allergies, newAllergy]);
    } else {
      onUpdate(person.allergies.filter((a) => a.type !== "dog"));
    }
  };

  const addFoodAllergy = (allergen: string) => {
    const name = allergen.trim();
    if (!name) return;
    const exists = person.allergies.some((a) => a.type === "food" && a.allergen === name);
    if (!exists) {
      onUpdate([...person.allergies, { id: crypto.randomUUID(), type: "food", allergen: name }]);
    }
    setCustomAllergen("");
    // スクロール抑止：自動フォーカスしない
  };

  const removeAllergy = (id: string) => {
    onUpdate(person.allergies.filter((a) => a.id !== id));
  };

  const canAddCustom = customAllergen.trim().length > 0;

  return (
    <div className="space-y-4 scroll-mt-24">
      {/* 犬アレルギー */}
      <div>
        <p className="text-sm text-gray-700 mb-2">{t("rsvp.form.health.dogAllergy")}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDogAllergy(false)}
            aria-pressed={!hasDogAllergy}
            className={`p-3 rounded-lg border-2 transition-all text-sm ${!hasDogAllergy ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-green-300"
              }`}
          >
            {t("rsvp.form.health.no")}
          </button>
          <button
            type="button"
            onClick={() => setDogAllergy(true)}
            aria-pressed={hasDogAllergy}
            className={`p-3 rounded-lg border-2 transition-all text-sm ${hasDogAllergy ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 hover:border-red-300"
              }`}
          >
            {t("rsvp.form.health.yes")}
          </button>
        </div>
      </div>

      {/* 食物アレルギー */}
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

        {foodAllergies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {foodAllergies.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 max-w-full"
              >
                <span className="truncate">{a.allergen}</span>
                <button
                  type="button"
                  onClick={() => removeAllergy(a.id)}
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

            {/* 入力＋追加（モバイルは縦積み） */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full">
              <input
                ref={customInputRef}
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
  );
}

/* ===========================
 * Main Form
 * =========================== */

type FieldErrors = {
  mainGuest: {
    lastName?: string;
    firstName?: string;
    birthDate?: string;
    email?: string;
    phone?: string;
    attendance?: string;
  };
  companions: Record<
    string,
    {
      email?: string;
      phone?: string;
      lastName?: string;
      firstName?: string;
      birthDate?: string;
    }
  >;
};

export default function RsvpForm({ token }: { token: string }) {
  const { t } = useLanguage();

  // --- スクロール用 ---
  const rootRef = useRef<HTMLDivElement | null>(null);
  const formElRef = useRef<HTMLFormElement | null>(null);

  // --- 重複チェック（Step1 代表者） ---
  const [dupState, dupFormAction, dupPending] = useActionState<DupResult, FormData>(
    checkDuplicateAction,
    { ok: false }
  );
  const [dupError, setDupError] = useState<string | null>(null);

  // --- 送信（最終確認で submit） ---
  const [submitState, formAction] = useActionState<SubmitState, FormData>(
    async (_prev, fd) => {
      try {
        const resUnknown: unknown = await submitRsvp(fd);

        if (!isSubmitApiResult(resUnknown) || resUnknown.success !== true) {
          return {
            success: false,
            error: normalizeError(
              isSubmitApiResult(resUnknown) ? resUnknown.error : resUnknown
            ),
          };
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: normalizeError(err) };
      }
    },
    { success: false }
  );

  const [formData, setFormData] = useState<RsvpFormState>({
    mainGuest: {
      id: "main",
      lastName: "",
      firstName: "",
      email: "",
      phone: "",
      birthDate: "",
      allergies: [],
    },
    attendance: "",
    companions: [],
  });

  const [errors, setErrors] = useState<FieldErrors>({ mainGuest: {}, companions: {} });

  // バリデーションスキーマ
  const EmailSchema = useMemo(
    () => z.string().trim().email({ message: t("rsvp.form.validation.invalidEmail") }),
    [t]
  );
  const PhoneSchema = useMemo(
    () =>
      z
        .string()
        .trim()
        .refine((v) => /^\+?[0-9\s\-()]+$/.test(v), t("rsvp.form.validation.invalidPhone"))
        .refine((v) => {
          const digits = v.replace(/\D/g, "");
          return digits.length >= 8 && digits.length <= 15;
        }, t("rsvp.form.validation.invalidPhone")),
    [t]
  );

  const [step, setStep] = useState<Step>(1);
  const scrollToFormTop = () => {
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const nextStep = () =>
    setStep((s) => {
      const ns = s === 1 ? 2 : s === 2 ? 3 : s === 3 ? 4 : 4;
      // DOM更新後にスクロール（初回マウント時は呼ばれない）
      queueMicrotask(scrollToFormTop);
      return ns;
    });
  const prevStep = () =>
    setStep((s) => {
      const ns = s === 4 ? 3 : s === 3 ? 2 : s === 2 ? 1 : 1;
      queueMicrotask(scrollToFormTop);
      return ns;
    });

  const totalSteps = useMemo(() => (formData.attendance === "attend" ? 4 : 2), [formData.attendance]);

  const guests = useMemo<Person[]>(
    () => (formData.attendance === "attend" ? [formData.mainGuest, ...formData.companions] : [formData.mainGuest]),
    [formData]
  );

  const payload = useMemo(
    () => JSON.stringify({ token, attendance: formData.attendance, guests }),
    [token, formData, guests]
  );

  // --- Step1 重複チェック結果で遷移 or エラー ---
  useEffect(() => {
    if (dupState.ok) {
      setDupError(null);
      nextStep();
    } else if (dupState.error === "duplicate") {
      setDupError(t("rsvp.form.error.duplicateMain"));
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [dupState, t]);

  // 更新ユーティリティ
  const updateMainGuest = (updates: Partial<Person>) =>
    setFormData((p) => ({ ...p, mainGuest: { ...p.mainGuest, ...updates } }));

  // --- 同伴者追加時に新カードへスクロール ---
  const companionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lastAddedCompanionId, setLastAddedCompanionId] = useState<string | null>(null);

  const addCompanion = () => {
    const newId = crypto.randomUUID();
    setLastAddedCompanionId(newId);
    setFormData((p) => ({
      ...p,
      companions: [
        ...p.companions,
        { id: newId, lastName: "", firstName: "", email: "", phone: "", birthDate: "", allergies: [] },
      ],
    }));
  };

  useEffect(() => {
    if (!lastAddedCompanionId) return;
    const el = companionRefs.current[lastAddedCompanionId];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setLastAddedCompanionId(null);
  }, [lastAddedCompanionId]);

  const removeCompanion = (id: string) =>
    setFormData((p) => ({ ...p, companions: p.companions.filter((c) => c.id !== id) }));

  const updateCompanion = (id: string, updates: Partial<Person>) =>
    setFormData((p) => ({ ...p, companions: p.companions.map((c) => (c.id === id ? { ...c, ...updates } : c)) }));

  const currentStepNumber = step;

  // Step1: 必須 & 形式チェック（姓・名・生年月日・メール・電話・出欠）
  const validateStep1 = (): boolean => {
    const nextErrors: FieldErrors = { mainGuest: {}, companions: {} };

    if (!formData.mainGuest.lastName.trim()) {
      nextErrors.mainGuest.lastName = t("rsvp.form.validation.requiredLastName");
    }
    if (!formData.mainGuest.firstName.trim()) {
      nextErrors.mainGuest.firstName = t("rsvp.form.validation.requiredFirstName");
    }

    const bd = formData.mainGuest.birthDate;
    if (!bd) {
      nextErrors.mainGuest.birthDate = t("rsvp.form.validation.requiredBirthdate");
    } else if (bd === "INVALID" || !/^\d{4}-\d{2}-\d{2}$/.test(bd)) {
      nextErrors.mainGuest.birthDate = "無効な日付です";
    }

    if (!formData.attendance) {
      nextErrors.mainGuest.attendance = t("rsvp.form.validation.selectAttendance");
    }

    const e1 = EmailSchema.safeParse(formData.mainGuest.email.trim());
    if (!e1.success) nextErrors.mainGuest.email = e1.error.issues[0]?.message ?? t("rsvp.form.validation.invalidEmail");

    const p1 = PhoneSchema.safeParse(formData.mainGuest.phone.trim());
    if (!p1.success) nextErrors.mainGuest.phone = p1.error.issues[0]?.message ?? t("rsvp.form.validation.invalidPhone");

    setErrors(nextErrors);

    return (
      !nextErrors.mainGuest.lastName &&
      !nextErrors.mainGuest.firstName &&
      !nextErrors.mainGuest.birthDate &&
      !nextErrors.mainGuest.email &&
      !nextErrors.mainGuest.phone &&
      !nextErrors.mainGuest.attendance
    );
  };

  // Step3: 同伴者の形式チェック + 必須
  const validateStep3 = (): boolean => {
    const nextErrors: FieldErrors = { mainGuest: {}, companions: {} };

    formData.companions.forEach((c) => {
      const ce: {
        email?: string;
        phone?: string;
        lastName?: string;
        firstName?: string;
        birthDate?: string;
      } = {};

      if (!c.lastName?.trim()) ce.lastName = t("rsvp.form.validation.requiredLastName");
      if (!c.firstName?.trim()) ce.firstName = t("rsvp.form.validation.requiredFirstName");

      const bd = c.birthDate;
      if (!bd) ce.birthDate = t("rsvp.form.validation.requiredBirthdate");
      else if (bd === "INVALID" || !/^\d{4}-\d{2}-\d{2}$/.test(bd)) ce.birthDate = "無効な日付です";

      if (c.email?.trim()) {
        const r = EmailSchema.safeParse(c.email.trim());
        if (!r.success) ce.email = r.error.issues[0]?.message ?? t("rsvp.form.validation.invalidEmail");
      }
      if (c.phone?.trim()) {
        const r = PhoneSchema.safeParse(c.phone.trim());
        if (!r.success) ce.phone = r.error.issues[0]?.message ?? t("rsvp.form.validation.invalidPhone");
      }

      if (Object.keys(ce).length > 0) nextErrors.companions[c.id] = ce;
    });

    setErrors(nextErrors);

    const noFormatError = Object.values(nextErrors.companions).every((v) => !v.email && !v.phone);
    const noRequiredError = Object.values(nextErrors.companions).every(
      (v) => !v.lastName && !v.firstName && !v.birthDate
    );

    return noFormatError && noRequiredError;
  };

  // Next押下時だけエラーへスクロールするためのフラグ
  const [shouldFocusError, setShouldFocusError] = useState(false);

  // エラー発生時は（フラグがtrueの時だけ）最初のエラー入力へスクロール
  useEffect(() => {
    if (!shouldFocusError) return;
    if (!(step === 1 || step === 3)) return;
    const el = formElRef.current?.querySelector('[aria-invalid="true"]') as HTMLElement | null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    setShouldFocusError(false);
  }, [errors, step, shouldFocusError]);

  return (
    <div ref={rootRef} className="max-w-3xl mx-auto scroll-mt-24">
      {/* 進捗 */}
      <div className="flex items-center justify-center mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i + 1 <= currentStepNumber ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
            >
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`w-12 h-1 mx-2 ${i + 1 < currentStepNumber ? "bg-pink-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <form ref={formElRef} action={formAction} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 overflow-hidden">
        {/* サーバーへ渡す JSON */}
        <input type="hidden" name="payload" value={payload} readOnly />

        {/* エラーバナー（重複／送信） */}
        {dupError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{dupError}</div>
        )}
        {submitState.error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {submitState.error}
          </div>
        )}

        {/* Step 1: 代表者基本情報 */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">{t("rsvp.form.steps.basic")}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("rsvp.form.lastname")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.mainGuest.lastName}
                  onChange={(e) => updateMainGuest({ lastName: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${errors.mainGuest.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                  aria-invalid={!!errors.mainGuest.lastName}
                />
                <FieldErrorLine message={errors.mainGuest.lastName} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("rsvp.form.firstname")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.mainGuest.firstName}
                  onChange={(e) => updateMainGuest({ firstName: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${errors.mainGuest.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  aria-invalid={!!errors.mainGuest.firstName}
                />
                <FieldErrorLine message={errors.mainGuest.firstName} />
              </div>
            </div>

            {/* 生年月日（年/月/日 インプット） */}
            <BirthdateInputsJP
              label={t("rsvp.form.birthdate")}
              value={formData.mainGuest.birthDate}
              onChange={(isoOrInvalid) => updateMainGuest({ birthDate: isoOrInvalid })}
              required
              error={errors.mainGuest.birthDate}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("rsvp.form.email")} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.mainGuest.email}
                  onChange={(e) => updateMainGuest({ email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${errors.mainGuest.email ? "border-red-500" : "border-gray-300"
                    }`}
                  aria-invalid={!!errors.mainGuest.email}
                />
                <FieldErrorLine message={errors.mainGuest.email} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("rsvp.form.phone")} *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mainGuest.phone}
                  onChange={(e) => updateMainGuest({ phone: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${errors.mainGuest.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  aria-invalid={!!errors.mainGuest.phone}
                />
                <FieldErrorLine message={errors.mainGuest.phone} />
              </div>
            </div>

            {/* 出欠 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t("rsvp.form.attendance")} *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((p) => ({ ...p, attendance: "attend" }));
                    setErrors((e) => ({ ...e, mainGuest: { ...e.mainGuest, attendance: undefined } }));
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${formData.attendance === "attend"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-300"
                    }`}
                >
                  {t("rsvp.form.attend")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData((p) => ({ ...p, attendance: "decline" }));
                    setErrors((e) => ({ ...e, mainGuest: { ...e.mainGuest, attendance: undefined } }));
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${formData.attendance === "decline"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-red-300"
                    }`}
                >
                  {t("rsvp.form.decline")}
                </button>
              </div>
              <FieldErrorLine message={errors.mainGuest.attendance} />
            </div>
          </div>
        )}

        {/* Step 2: 本人アレルギー（出席時） */}
        {step === 2 && formData.attendance === "attend" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("rsvp.form.steps.health")} - {t("rsvp.form.confirmation.mainGuest")}
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                {formData.mainGuest.lastName} {formData.mainGuest.firstName} 様
              </p>
            </div>

            <AllergyInput person={formData.mainGuest} onUpdate={(allergies) => updateMainGuest({ allergies })} />
          </div>
        )}

        {/* Step 3: 同伴者（出席時） */}
        {step === 3 && formData.attendance === "attend" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">{t("rsvp.form.steps.attendance")}</h3>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={addCompanion}
                className="flex items-center gap-2 text-pink-500 hover:text-pink-600 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{t("rsvp.form.companions.add")}</span>
              </button>
            </div>

            {formData.companions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">{t("rsvp.form.companions.noCompanions")}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.companions.map((companion, index) => {
                  const ce = errors.companions[companion.id] || {};
                  return (
                    <div
                      key={companion.id}
                      ref={(el) => {
                        companionRefs.current[companion.id] = el;
                      }}
                      className="border border-gray-200 rounded-lg p-4 space-y-4 scroll-mt-24"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-700">
                          {t("rsvp.form.companions.companionNumber")} {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeCompanion(companion.id)}
                          className="p-2 text-red-500 hover:text-red-600 transition-colors"
                          aria-label="remove companion"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            required
                            placeholder={`${t("rsvp.form.companions.lastnamePlaceholder")} *`}
                            value={companion.lastName}
                            onChange={(e) => updateCompanion(companion.id, { lastName: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent min-w-0 ${ce.lastName ? "border-red-500" : "border-gray-300"
                              }`}
                            aria-invalid={!!ce.lastName}
                          />
                          <FieldErrorLine message={ce.lastName} />
                        </div>
                        <div>
                          <input
                            type="text"
                            required
                            placeholder={`${t("rsvp.form.companions.firstnamePlaceholder")} *`}
                            value={companion.firstName}
                            onChange={(e) => updateCompanion(companion.id, { firstName: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent min-w-0 ${ce.firstName ? "border-red-500" : "border-gray-300"
                              }`}
                            aria-invalid={!!ce.firstName}
                          />
                          <FieldErrorLine message={ce.firstName} />
                        </div>
                      </div>

                      {/* 生年月日（年/月/日 インプット） */}
                      <div className={ce.birthDate ? "border-red-500 rounded-lg" : ""}>
                        <BirthdateInputsJP
                          label={t("rsvp.form.birthdate")}
                          value={companion.birthDate}
                          onChange={(isoOrInvalid) => updateCompanion(companion.id, { birthDate: isoOrInvalid })}
                          required
                          error={ce.birthDate}
                        />
                      </div>

                      <div>
                        <input
                          type="email"
                          placeholder={t("rsvp.form.companions.emailPlaceholder")}
                          value={companion.email}
                          onChange={(e) => updateCompanion(companion.id, { email: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${ce.email ? "border-red-500" : "border-gray-300"
                            }`}
                          aria-invalid={!!ce.email}
                        />
                        <FieldErrorLine message={ce.email} />
                      </div>

                      <div>
                        <input
                          type="tel"
                          placeholder={t("rsvp.form.companions.phonePlaceholder")}
                          value={companion.phone}
                          onChange={(e) => updateCompanion(companion.id, { phone: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${ce.phone ? "border-red-500" : "border-gray-300"
                            }`}
                          aria-invalid={!!ce.phone}
                        />
                        <FieldErrorLine message={ce.phone} />
                      </div>

                      <div className="border-t pt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">{t("rsvp.form.steps.health")}</h5>
                        <AllergyInput
                          person={companion}
                          onUpdate={(allergies) => updateCompanion(companion.id, { allergies })}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 4: 確認 */}
        {step === totalSteps && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">{t("rsvp.form.steps.confirm")}</h3>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="divide-y divide-gray-200">
                {/* 代表者 */}
                <div className="py-4">
                  <h4 className="font-medium text-gray-700 mb-2">{t("rsvp.form.confirmation.mainGuest")}</h4>
                  <div className="space-y-2 text-sm text-gray-800">
                    <div>
                      <span className="font-medium w-24 inline-block">{t("rsvp.form.confirmation.name")}</span>
                      {formData.mainGuest.lastName} {formData.mainGuest.firstName}
                    </div>
                    <div>
                      <span className="font-medium w-24 inline-block">メール</span>
                      {formData.mainGuest.email}
                    </div>
                    <div>
                      <span className="font-medium w-24 inline-block">電話</span>
                      {formData.mainGuest.phone}
                    </div>
                    <div>
                      <span className="font-medium w-24 inline-block">{t("rsvp.form.birthdate")}</span>
                      {isoToSlash(formData.mainGuest.birthDate)}
                    </div>
                    <div>
                      <span className="font-medium w-24 inline-block">{t("rsvp.form.confirmation.attendance")}</span>
                      <span
                        className={
                          formData.attendance === "attend" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
                        }
                      >
                        {formData.attendance === "attend" ? t("rsvp.form.attend") : t("rsvp.form.decline")}
                      </span>
                    </div>
                    {formData.attendance === "attend" && formData.mainGuest.allergies.length > 0 && (
                      <div className="flex">
                        <span className="font-medium w-24 inline-block flex-shrink-0">
                          {t("rsvp.form.confirmation.allergy")}
                        </span>
                        <span className="break-words">
                          {formData.mainGuest.allergies.map((a) => a.allergen).join("、")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 同伴者 */}
                {formData.attendance === "attend" &&
                  formData.companions.map((c, i) => (
                    <div key={c.id} className="py-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        {t("rsvp.form.confirmation.companionGuest")} {i + 1}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-800">
                        <div>
                          <span className="font-medium w-24 inline-block">{t("rsvp.form.confirmation.name")}</span>
                          {c.lastName} {c.firstName}
                        </div>
                        {c.email && (
                          <div>
                            <span className="font-medium w-24 inline-block">メール</span>
                            {c.email}
                          </div>
                        )}
                        {c.phone && (
                          <div>
                            <span className="font-medium w-24 inline-block">電話</span>
                            {c.phone}
                          </div>
                        )}
                        <div>
                          <span className="font-medium w-24 inline-block">{t("rsvp.form.birthdate")}</span>
                          {isoToSlash(c.birthDate)}
                        </div>
                        {c.allergies.length > 0 && (
                          <div className="flex">
                            <span className="font-medium w-24 inline-block flex-shrink-0">
                              {t("rsvp.form.confirmation.allergy")}
                            </span>
                            <span className="break-words">{c.allergies.map((a) => a.allergen).join("、")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ナビゲーション */}
        <div className="mt-8 flex items-center">
          {/* 戻る */}
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {t("rsvp.form.navigation.back")}
            </button>
          )}

          {/* 次へ or 送信 */}
          {step < totalSteps ? (
            <button
              type="button"
              onClick={async () => {
                // Step1: 代表者の必須 & 形式チェック → OKなら重複チェック
                if (step === 1) {
                  setShouldFocusError(true);
                  if (!validateStep1()) return;

                  setDupError(null);
                  const fd = new FormData();
                  fd.set("lastName", formData.mainGuest.lastName.trim());
                  fd.set("firstName", formData.mainGuest.firstName.trim());
                  fd.set("birthDate", formData.mainGuest.birthDate);
                  startTransition(() => {
                    dupFormAction(fd);
                  });
                  return;
                }

                // Step3: 同伴者の形式チェック + 必須
                if (step === 3) {
                  setShouldFocusError(true);
                  if (!validateStep3()) return;

                  setDupError(null);
                  const results = await Promise.all(
                    formData.companions.map((c) =>
                      checkDuplicateDirect({
                        lastName: c.lastName.trim(),
                        firstName: c.firstName.trim(),
                        birthDate: c.birthDate,
                      })
                    )
                  );

                  const dups: string[] = results
                    .map((r, idx) =>
                      r?.ok === false
                        ? `${formData.companions[idx].lastName} ${formData.companions[idx].firstName}（${isoToSlash(
                          formData.companions[idx].birthDate
                        )}）`
                        : null
                    )
                    .filter((s): s is string => !!s);

                  if (dups.length) {
                    setDupError(t("rsvp.form.error.duplicateCompanions", { names: dups.join("、") }));
                    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    return;
                  }
                }

                nextStep();
              }}
              disabled={dupPending}
              className="ml-auto px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:bg-gray-300 transition-colors"
            >
              {dupPending ? t("rsvp.form.navigation.checking") : t("rsvp.form.navigation.next")}
            </button>
          ) : (
            <div className="ml-auto">
              <SubmitButton />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

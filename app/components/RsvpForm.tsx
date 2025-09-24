// app/(your-route)/RsvpForm.tsx
"use client";

import { useState, useMemo, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { submitRsvp } from "@/app/rsvp/actions";

// 多言語フック（あなたの実装に合わせて import パスを調整）
import { useLanguage } from "../providers";

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
  // ストアする値は ISO（YYYY-MM-DD）に統一
  birthDate: string;
  allergies: AllergyItem[];
}

interface RsvpFormState {
  mainGuest: Person;
  attendance: "attend" | "decline" | "";
  companions: Person[];
}

/* ===========================
 * Utilities
 * =========================== */

type SubmitState = { success: boolean | null; error?: string };
const initialSubmitState: SubmitState = { success: null };

/* ===========================
 * Birthdate (JP) Component - FIXED TYPINGS
 * =========================== */

type YMD = { y: number | ""; m: number | ""; d: number | "" };

const pad2 = (n: number) => String(n).padStart(2, "0");
const isValidYMD = (y?: number, m?: number, d?: number) => {
  if (!y || !m || !d) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() + 1 === m &&
    dt.getUTCDate() === d
  );
};
const ymdToISO = (y: number, m: number, d: number) => `${y}-${pad2(m)}-${pad2(d)}`;
const isoToSlash = (iso: string) => iso ? iso.replaceAll("-", "/") : "";

function BirthdateJP({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;               // YYYY-MM-DD (親に保持される最終値)
  onChange: (iso: string) => void;
  required?: boolean;
}) {
  const today = useMemo(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
  }, []);
  const START_YEAR = 1900;

  // 親の ISO → ローカル初期値
  const parseISO = (iso?: string): YMD => {
    const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return { y: "", m: "", d: "" };
    return { y: parseInt(m[1], 10), m: parseInt(m[2], 10), d: parseInt(m[3], 10) };
    //      ^^^^^^^^^^^^^^^^^^^^^^^ すべて number 型に
  };

  const [local, setLocal] = useState<YMD>(() => parseISO(value));

  useEffect(() => {
    setLocal(parseISO(value));
  }, [value]);

  // 年の候補（降順：今年→1900）
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = today.y; y >= START_YEAR; y--) arr.push(y);
    return arr;
  }, [today.y]);

  // 月の候補（当年は未来月を出さない）
  const months = useMemo(() => {
    if (local.y === "") return [];
    const maxM = local.y === today.y ? today.m : 12;
    return Array.from({ length: maxM }, (_, i) => i + 1);
  }, [local.y, today.y, today.m]);

  // 日の候補（当年月は未来日を出さない）
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
    onChange(""); // 未完成/不正は空で必須バリデーションを効かせる
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

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required ? "*" : ""}
      </label>
      <div className="flex gap-2">
        {/* 年 */}
        <select
          required={required}
          value={local.y === "" ? "" : local.y}
          onChange={(e) => onYearChange(e.target.value)}
          className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="">年</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>

        {/* 月 */}
        <select
          required={required}
          value={local.m === "" ? "" : local.m}
          onChange={(e) => onMonthChange(e.target.value)}
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          disabled={local.y === ""}
        >
          <option value="">月</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}月</option>
          ))}
        </select>

        {/* 日 */}
        <select
          required={required}
          value={local.d === "" ? "" : local.d}
          onChange={(e) => onDayChange(e.target.value)}
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          disabled={local.y === "" || local.m === ""}
        >
          <option value="">日</option>
          {days.map((d) => (
            <option key={d} value={d}>{d}日</option>
          ))}
        </select>
      </div>
      <p className="mt-2 text-xs text-gray-500">形式：YYYY/MM/DD（例：1990/06/15）</p>
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
 * Allergy Input Component
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
  };

  const removeAllergy = (id: string) => {
    onUpdate(person.allergies.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* 犬アレルギー */}
      <div>
        <p className="text-sm text-gray-700 mb-2">{t("rsvp.form.health.dogAllergy")}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDogAllergy(false)}
            aria-pressed={!hasDogAllergy}
            className={`p-3 rounded-lg border-2 transition-all text-sm ${!hasDogAllergy
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 hover:border-green-300"
              }`}
          >
            {t("rsvp.form.health.no")}
          </button>
          <button
            type="button"
            onClick={() => setDogAllergy(true)}
            aria-pressed={hasDogAllergy}
            className={`p-3 rounded-lg border-2 transition-all text-sm ${hasDogAllergy
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-200 hover:border-red-300"
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
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
              >
                {a.allergen}
                <button
                  type="button"
                  onClick={() => removeAllergy(a.id)}
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
  );
}

/* ===========================
 * Main Form
 * =========================== */

export default function RsvpForm({ token }: { token: string }) {
  const { t } = useLanguage();

  // Server Action（submitRsvp）が返す { success: boolean } を
  // useActionState 経由で "次の state" に変換する
  const [submitState, formAction] = useActionState(
    async (_prev: SubmitState, fd: FormData): Promise<SubmitState> => {
      try {
        const res = await submitRsvp(fd); // ← { success: boolean } を想定
        return { success: !!res?.success };
      } catch (e) {
        return {
          success: false,
          error: e instanceof Error ? e.message : "送信に失敗しました",
        };
      }
    },
    initialSubmitState
  );

  const [formData, setFormData] = useState<RsvpFormState>({
    mainGuest: {
      id: "main",
      lastName: "",
      firstName: "",
      email: "",
      phone: "",
      birthDate: "", // ★ 必須（ISO: YYYY-MM-DD）
      allergies: [],
    },
    attendance: "",
    companions: [],
  });

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const totalSteps = useMemo(() => (formData.attendance === "attend" ? 4 : 2), [formData.attendance]);

  const guests = useMemo<Person[]>(
    () =>
      formData.attendance === "attend"
        ? [formData.mainGuest, ...formData.companions]
        : [formData.mainGuest],
    [formData],
  );

  const payload = useMemo(
    () =>
      JSON.stringify({
        token,
        attendance: formData.attendance,
        guests,
      }),
    [token, formData, guests],
  );

  // 更新ユーティリティ
  const updateMainGuest = (updates: Partial<Person>) =>
    setFormData((p) => ({ ...p, mainGuest: { ...p.mainGuest, ...updates } }));

  const addCompanion = () =>
    setFormData((p) => ({
      ...p,
      companions: [
        ...p.companions,
        {
          id: crypto.randomUUID(),
          lastName: "",
          firstName: "",
          email: "",
          phone: "",
          birthDate: "", // ★ 必須（ISO）
          allergies: [],
        },
      ],
    }));

  const removeCompanion = (id: string) =>
    setFormData((p) => ({ ...p, companions: p.companions.filter((c) => c.id !== id) }));

  const updateCompanion = (id: string, updates: Partial<Person>) =>
    setFormData((p) => ({
      ...p,
      companions: p.companions.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));

  // バリデーション（Next ボタン活性制御）
  const canGoNextStep1 =
    !!formData.mainGuest.lastName &&
    !!formData.mainGuest.firstName &&
    !!formData.mainGuest.email &&
    !!formData.mainGuest.phone &&
    !!formData.mainGuest.birthDate &&
    !!formData.attendance;

  const companionsOk =
    formData.companions.every(
      (c) => !!c.lastName && !!c.firstName && !!c.birthDate, // email/phoneは任意
    );

  const currentStepNumber = step;

  return (
    <div className="max-w-3xl mx-auto">
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

      <form action={formAction} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* サーバーへ渡す JSON */}
        <input type="hidden" name="payload" value={payload} readOnly />

        {/* Step 1: 代表者の基本情報 */}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* ★ 生年月日（日本式：年/月/日） */}
            <BirthdateJP
              label={t("rsvp.form.birthdate")}
              value={formData.mainGuest.birthDate}
              onChange={(iso) => updateMainGuest({ birthDate: iso })}
              required
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
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
                  onClick={() => setFormData((p) => ({ ...p, attendance: "attend" }))}
                  className={`p-4 rounded-xl border-2 transition-all ${formData.attendance === "attend"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-green-300"
                    }`}
                >
                  ✅ {t("rsvp.form.attend")}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, attendance: "decline" }))}
                  className={`p-4 rounded-xl border-2 transition-all ${formData.attendance === "decline"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-red-300"
                    }`}
                >
                  ❌ {t("rsvp.form.decline")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 本人アレルギー（出席のみ） */}
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

            <AllergyInput
              person={formData.mainGuest}
              onUpdate={(allergies) => updateMainGuest({ allergies })}
            />
          </div>
        )}

        {/* Step 3: 同伴者（出席のみ） */}
        {step === 3 && formData.attendance === "attend" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("rsvp.form.steps.attendance")}
            </h3>

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
                {formData.companions.map((companion, index) => (
                  <div key={companion.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
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
                      <input
                        type="text"
                        required
                        placeholder={`${t("rsvp.form.companions.lastnamePlaceholder")} *`}
                        value={companion.lastName}
                        onChange={(e) => updateCompanion(companion.id, { lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent min-w-0"
                      />
                      <input
                        type="text"
                        required
                        placeholder={`${t("rsvp.form.companions.firstnamePlaceholder")} *`}
                        value={companion.firstName}
                        onChange={(e) => updateCompanion(companion.id, { firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent min-w-0"
                      />
                    </div>

                    {/* ★ 生年月日（日本式） */}
                    <BirthdateJP
                      label={t("rsvp.form.birthdate")}
                      value={companion.birthDate}
                      onChange={(iso) => updateCompanion(companion.id, { birthDate: iso })}
                      required
                    />

                    <input
                      type="email"
                      placeholder={t("rsvp.form.companions.emailPlaceholder")}
                      value={companion.email}
                      onChange={(e) => updateCompanion(companion.id, { email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />

                    <input
                      type="tel"
                      placeholder={t("rsvp.form.companions.phonePlaceholder")}
                      value={companion.phone}
                      onChange={(e) => updateCompanion(companion.id, { phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />

                    <div className="border-t pt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">
                        {t("rsvp.form.steps.health")}
                      </h5>
                      <AllergyInput
                        person={companion}
                        onUpdate={(allergies) => updateCompanion(companion.id, { allergies })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: 確認 */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("rsvp.form.steps.confirm")}
            </h3>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="divide-y divide-gray-200">
                {/* 代表者 */}
                <div className="py-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {t("rsvp.form.confirmation.mainGuest")}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-800">
                    <div>
                      <span className="font-medium w-24 inline-block">
                        {t("rsvp.form.confirmation.name")}
                      </span>
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
                      <span className="font-medium w-24 inline-block">
                        {t("rsvp.form.birthdate")}
                      </span>
                      {isoToSlash(formData.mainGuest.birthDate)}
                    </div>
                    <div>
                      <span className="font-medium w-24 inline-block">
                        {t("rsvp.form.confirmation.attendance")}
                      </span>
                      <span
                        className={
                          formData.attendance === "attend"
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {formData.attendance === "attend"
                          ? t("rsvp.form.attend")
                          : t("rsvp.form.decline")}
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
                          <span className="font-medium w-24 inline-block">
                            {t("rsvp.form.confirmation.name")}
                          </span>
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
                          <span className="font-medium w-24 inline-block">
                            {t("rsvp.form.birthdate")}
                          </span>
                          {isoToSlash(c.birthDate)}
                        </div>
                        {c.allergies.length > 0 && (
                          <div className="flex">
                            <span className="font-medium w-24 inline-block flex-shrink-0">
                              {t("rsvp.form.confirmation.allergy")}
                            </span>
                            <span className="break-words">
                              {c.allergies.map((a) => a.allergen).join("、")}
                            </span>
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
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as typeof s) : s))}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {t("rsvp.form.navigation.back")}
            </button>
          )}

          {/* 次へ or 送信 */}
          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !canGoNextStep1) {
                  alert(t("rsvp.form.validation.selectAttendance"));
                  return;
                }
                if (step === 3 && !companionsOk) {
                  alert(t("rsvp.form.validation.fillCompanions"));
                  return;
                }
                setStep((s) => ((s + 1) as typeof s));
              }}
              disabled={(step === 1 && !canGoNextStep1) || (step === 3 && !companionsOk)}
              className="ml-auto px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:bg-gray-300 transition-colors"
            >
              {t("rsvp.form.navigation.next")}
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

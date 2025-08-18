"use client";

import { useState } from "react";
import { useLanguage } from "../providers";
import { useFormStatus } from "react-dom";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface AllergyItem {
  id: string;
  type: "dog" | "food";
  allergen: string;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  allergies: AllergyItem[];
}

interface FormData {
  mainGuest: Person;
  attendance: "attend" | "decline" | "";
  companions: Person[];
}

// 一般的な食物アレルゲンのプリセット
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
      className="w-full bg-orange-400 hover:bg-orange-500 disabled:bg-gray-300 text-white py-4 px-6 rounded-xl font-medium text-lg transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
    >
      {pending ? t("rsvp.form.submitting") : t("rsvp.form.submit")}
    </button>
  );
}

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
    if (value === has) return; // すでに同じ状態なら何もしない

    if (value) {
      const newAllergy: AllergyItem = {
        id: Date.now().toString(),
        type: "dog",
        allergen: "犬",
      };
      onUpdate([...person.allergies, newAllergy]);
    } else {
      onUpdate(person.allergies.filter((a) => a.type !== "dog"));
    }
  };
  const addFoodAllergy = (allergen: string) => {
    if (!allergen.trim()) return;

    // 既に同じアレルゲンが登録されているかチェック
    const exists = person.allergies.some(
      (a) => a.type === "food" && a.allergen === allergen
    );

    if (!exists) {
      const newAllergy: AllergyItem = {
        id: Date.now().toString(),
        type: "food",
        allergen: allergen.trim(),
      };
      onUpdate([...person.allergies, newAllergy]);
    }

    setCustomAllergen("");
    setShowAllergenSelect(false);
  };

  const removeAllergy = (id: string) => {
    onUpdate(person.allergies.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* 犬アレルギー */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("rsvp.form.health.dogAllergy")}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDogAllergy(false)} // ← いいえ固定
            aria-pressed={!hasDogAllergy}
            className={`p-3 rounded-lg border-2 transition-all text-sm ${
              !hasDogAllergy
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 hover:border-green-300"
            }`}
          >
            {t("rsvp.form.health.no")}
          </button>
          <button
            type="button"
            onClick={() => setDogAllergy(true)} // ← はい固定
            aria-pressed={hasDogAllergy}
            className={`p-3 rounded-lg border-2 transition-all text-sm ${
              hasDogAllergy
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
          <label className="block text-sm font-medium text-gray-700">
            {t("rsvp.form.health.foodAllergy")}
          </label>
          <button
            type="button"
            onClick={() => setShowAllergenSelect(true)}
            className="flex items-center space-x-1 text-pink-500 hover:text-pink-600 transition-colors text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            <span>追加</span>
          </button>
        </div>

        {/* アレルギー一覧 */}
        {foodAllergies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {foodAllergies.map((allergy) => (
              <span
                key={allergy.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
              >
                {allergy.allergen}
                <button
                  type="button"
                  onClick={() => removeAllergy(allergy.id)}
                  className="ml-2 hover:text-orange-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* アレルゲン選択モーダル */}
        {showAllergenSelect && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">一般的なアレルゲン：</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMMON_ALLERGENS.map((allergen) => (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => addFoodAllergy(allergen)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-pink-50 hover:border-pink-300 transition-colors"
                  >
                    {allergen}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={customAllergen}
                onChange={(e) => setCustomAllergen(e.target.value)}
                placeholder="その他のアレルギー"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent min-w-[100px]"
                onKeyPress={(e) => {
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
                追加
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAllergenSelect(false);
                  setCustomAllergen("");
                }}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RsvpForm({ token }: { token: string }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    mainGuest: {
      id: "main",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      allergies: [],
    },
    attendance: "",
    companions: [],
  });

  const addCompanion = () => {
    const newCompanion: Person = {
      id: Date.now().toString(),
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      allergies: [],
    };
    setFormData((prev) => ({
      ...prev,
      companions: [...prev.companions, newCompanion],
    }));
  };

  const removeCompanion = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      companions: prev.companions.filter((c) => c.id !== id),
    }));
  };

  const updateCompanion = (id: string, updates: Partial<Person>) => {
    setFormData((prev) => ({
      ...prev,
      companions: prev.companions.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  };

  const updateMainGuest = (updates: Partial<Person>) => {
    setFormData((prev) => ({
      ...prev,
      mainGuest: { ...prev.mainGuest, ...updates },
    }));
  };

  const handleSubmit = async (formDataObj: FormData) => {
    // データベース保存用のフォーマットに変換
    const submitData = {
      token,
      attendance: formData.attendance,
      guests: [
        {
          ...formData.mainGuest,
          isMainGuest: true,
        },
        ...formData.companions.map((c) => ({
          ...c,
          isMainGuest: false,
        })),
      ],
    };

    console.log("Submitting normalized data:", submitData);
    // サーバーアクションを呼び出し
  };

  // 欠席の場合は2ステップ、出席の場合は4ステップ
  const totalSteps = formData.attendance === "decline" ? 2 : 4;
  const currentStepNumber = step > totalSteps ? totalSteps : step;

  return (
    <div className="max-w-3xl mx-auto">
      {/* 進捗インジケーター */}
      <div className="flex items-center justify-center mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i + 1 <= currentStepNumber
                  ? "bg-pink-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  i + 1 < currentStepNumber ? "bg-pink-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form
        action={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
      >
        {/* Step 1: 基本情報と出欠 */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("rsvp.form.steps.basic")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("rsvp.form.lastname")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.mainGuest.lastName}
                  onChange={(e) =>
                    updateMainGuest({ lastName: e.target.value })
                  }
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
                  onChange={(e) =>
                    updateMainGuest({ firstName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

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
                placeholder="090-1234-5678"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t("rsvp.form.attendance")} *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, attendance: "attend" }))
                  }
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.attendance === "attend"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  ✅ {t("rsvp.form.attend")}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, attendance: "decline" }))
                  }
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.attendance === "decline"
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

        {/* Step 2: 招待者本人のアレルギー情報（出席時のみ） */}
        {step === 2 && formData.attendance === "attend" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("rsvp.form.steps.health")} - ご本人様
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                {formData.mainGuest.lastName} {formData.mainGuest.firstName}{" "}
                様のアレルギー情報
              </p>
            </div>

            <AllergyInput
              person={formData.mainGuest}
              onUpdate={(allergies) => updateMainGuest({ allergies })}
            />
          </div>
        )}

        {/* Step 3: 同伴者情報（出席時のみ） */}
        {step === 3 && formData.attendance === "attend" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("rsvp.form.steps.attendance")} - 同伴者
            </h3>

            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t("rsvp.form.companions.label")}
              </label>
              <button
                type="button"
                onClick={addCompanion}
                className="flex items-center space-x-2 text-pink-500 hover:text-pink-600 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{t("rsvp.form.companions.add")}</span>
              </button>
            </div>

            {formData.companions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  同伴者がいない場合は「次へ」をクリックしてください
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.companions.map((companion, index) => (
                  <div
                    key={companion.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-4 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-700">
                        同伴者 {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeCompanion(companion.id)}
                        className="p-2 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                      <input
                        type="text"
                        required
                        placeholder={`${t(
                          "rsvp.form.companions.lastnamePlaceholder"
                        )} *`}
                        value={companion.lastName}
                        onChange={(e) =>
                          updateCompanion(companion.id, {
                            lastName: e.target.value,
                          })
                        }
                        className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        required
                        placeholder={`${t(
                          "rsvp.form.companions.firstnamePlaceholder"
                        )} *`}
                        value={companion.firstName}
                        onChange={(e) =>
                          updateCompanion(companion.id, {
                            firstName: e.target.value,
                          })
                        }
                        className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>

                    <input
                      type="email"
                      placeholder="メールアドレス"
                      value={companion.email}
                      onChange={(e) =>
                        updateCompanion(companion.id, { email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />

                    <input
                      type="tel"
                      placeholder="電話番号"
                      value={companion.phone}
                      onChange={(e) =>
                        updateCompanion(companion.id, { phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />

                    <div className="border-t pt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">
                        アレルギー情報
                      </h5>
                      <AllergyInput
                        person={companion}
                        onUpdate={(allergies) =>
                          updateCompanion(companion.id, { allergies })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4 (出席) or Step 2 (欠席): 確認画面 */}
        {((step === 4 && formData.attendance === "attend") ||
          (step === 2 && formData.attendance === "decline")) && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("rsvp.form.steps.confirm")}
            </h3>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="divide-y divide-gray-200">
                {/* ご本人様 */}
                <div className="py-4 first:pt-0 last:pb-0">
                  <h4 className="font-medium text-gray-700 mb-2">ご本人様</h4>
                  <div className="space-y-2 text-sm text-gray-800">
                    <div>
                      <span className="font-medium w-20 inline-block">
                        お名前:
                      </span>
                      {formData.mainGuest.lastName}{" "}
                      {formData.mainGuest.firstName}
                    </div>
                    <div>
                      <span className="font-medium w-20 inline-block">
                        メール:
                      </span>
                      {formData.mainGuest.email}
                    </div>
                    <div>
                      <span className="font-medium w-20 inline-block">
                        電話:
                      </span>
                      {formData.mainGuest.phone}
                    </div>
                    <div>
                      <span className="font-medium w-20 inline-block">
                        出欠:
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
                    {formData.attendance === "attend" &&
                      formData.mainGuest.allergies.length > 0 && (
                        <div className="flex">
                          <span className="font-medium w-20 inline-block flex-shrink-0">
                            アレルギー:
                          </span>
                          <span className="break-words">
                            {formData.mainGuest.allergies
                              .map((a) => a.allergen)
                              .join("、")}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* 同伴者 */}
                {formData.attendance === "attend" &&
                  formData.companions.map((companion, index) => (
                    <div
                      key={companion.id}
                      className="py-4 first:pt-0 last:pb-0"
                    >
                      <h4 className="font-medium text-gray-700 mb-2">
                        同伴者{index + 1}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-800">
                        <div>
                          <span className="font-medium w-20 inline-block">
                            お名前:
                          </span>
                          {companion.lastName} {companion.firstName}
                        </div>
                        {companion.email && (
                          <div>
                            <span className="font-medium w-20 inline-block">
                              メール:
                            </span>
                            {companion.email}
                          </div>
                        )}
                        {companion.phone && (
                          <div>
                            <span className="font-medium w-20 inline-block">
                              電話:
                            </span>
                            {companion.phone}
                          </div>
                        )}
                        {companion.allergies.length > 0 && (
                          <div className="flex">
                            <span className="font-medium w-20 inline-block flex-shrink-0">
                              アレルギー:
                            </span>
                            <span className="break-words">
                              {companion.allergies
                                .map((a) => a.allergen)
                                .join("、")}
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

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {t("rsvp.form.navigation.back")}
            </button>
          )}

          {currentStepNumber < totalSteps ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !formData.attendance) {
                  alert("出欠を選択してください");
                  return;
                }
                setStep(step + 1);
              }}
              disabled={
                (step === 1 &&
                  (!formData.mainGuest.firstName ||
                    !formData.mainGuest.lastName ||
                    !formData.mainGuest.email ||
                    !formData.mainGuest.phone ||
                    !formData.attendance)) ||
                (step === 3 &&
                  formData.companions.some((c) => !c.firstName || !c.lastName))
              }
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

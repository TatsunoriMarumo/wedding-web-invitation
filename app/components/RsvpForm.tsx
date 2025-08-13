"use client";

import { useState } from "react";
import { useLanguage } from "../providers";
import { useFormStatus } from "react-dom";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Companion {
  id: string;
  firstName: string;
  lastName: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  attendance: "attend" | "decline" | "";
  companions: Companion[];
  allergies: string;
  dogAllergy: boolean;
}

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

export default function RsvpForm({ token }: { token: string }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    attendance: "",
    companions: [],
    allergies: "",
    dogAllergy: false,
  });

  const addCompanion = () => {
    const newCompanion: Companion = {
      id: Date.now().toString(),
      firstName: "",
      lastName: "",
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

  const updateCompanion = (
    id: string,
    field: keyof Companion,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      companions: prev.companions.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  const handleSubmit = async (formDataObj: FormData) => {
    // React 19のActions APIを使用した楽観的UI更新
    console.log("Form submitted:", formData);
    // 実際の実装では、サーバーアクションを呼び出し
  };

  const totalSteps = 4;

  return (
    <div className="max-w-2xl mx-auto">
      {/* 進捗インジケーター */}
      <div className="flex items-center justify-center mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i + 1 <= step
                  ? "bg-pink-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  i + 1 < step ? "bg-pink-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form
        action={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("rsvp.form.steps.basic")}
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("rsvp.form.lastname")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
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
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
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
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
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
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="090-1234-5678"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("rsvp.form.steps.attendance")}
            </h3>

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

            {formData.attendance === "attend" && (
              <div>
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

                {formData.companions.map((companion) => (
                  <div
                    key={companion.id}
                    className="flex items-center space-x-2 mb-3"
                  >
                    <input
                      type="text"
                      placeholder={t(
                        "rsvp.form.companions.lastnamePlaceholder"
                      )}
                      value={companion.lastName}
                      onChange={(e) =>
                        updateCompanion(
                          companion.id,
                          "lastName",
                          e.target.value
                        )
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder={t(
                        "rsvp.form.companions.firstnamePlaceholder"
                      )}
                      value={companion.firstName}
                      onChange={(e) =>
                        updateCompanion(
                          companion.id,
                          "firstName",
                          e.target.value
                        )
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeCompanion(companion.id)}
                      className="p-2 text-red-500 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("rsvp.form.steps.health")}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t("rsvp.form.health.dogAllergy")}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, dogAllergy: false }))
                  }
                  className={`p-4 rounded-xl border-2 transition-all ${
                    !formData.dogAllergy
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  {t("rsvp.form.health.no")}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, dogAllergy: true }))
                  }
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.dogAllergy
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  {t("rsvp.form.health.yes")}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("rsvp.form.health.foodAllergy")}
              </label>
              <textarea
                value={formData.allergies}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    allergies: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                placeholder={t("rsvp.form.health.foodAllergyPlaceholder")}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("rsvp.form.steps.confirm")}
            </h3>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div>
                <span className="font-medium">
                  {t("rsvp.form.confirmation.name")}
                </span>
                {formData.lastName} {formData.firstName}
              </div>
              <div>
                <span className="font-medium">
                  {t("rsvp.form.confirmation.email")}
                </span>
                {formData.email}
              </div>
              <div>
                <span className="font-medium">
                  {t("rsvp.form.confirmation.phone")}
                </span>
                {formData.phone}
              </div>
              <div>
                <span className="font-medium">
                  {t("rsvp.form.confirmation.attendance")}
                </span>
                {formData.attendance === "attend"
                  ? t("rsvp.form.attend")
                  : t("rsvp.form.decline")}
              </div>
              {formData.companions.length > 0 && (
                <div>
                  <span className="font-medium">
                    {t("rsvp.form.confirmation.companions")}
                  </span>
                  {formData.companions
                    .map((c) => `${c.lastName} ${c.firstName}`)
                    .join(", ")}
                </div>
              )}
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

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="ml-auto px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
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

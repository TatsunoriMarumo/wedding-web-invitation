// app/admin/components/TokenCreateForm.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createInvitationToken } from "../actions";
import { useLanguage } from "@/app/providers";
import { InviteToken } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto px-6 py-2 bg-pink-600 text-white font-semibold rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 transition-colors"
    >
      {pending ? t("admin.tokens.creating") : t("admin.tokens.createButton")}
    </button>
  );
}

export function TokenCreateForm({
  onClose,
  onSuccess,
  addOptimisticToken,
}: {
  onClose: () => void;
  onSuccess: (newToken: InviteToken) => void;
  addOptimisticToken: (newToken: InviteToken) => void;
}) {
  const { t } = useLanguage();
  const [state, formAction] = useActionState(createInvitationToken, {
    message: null,
    token: null,
  });

  useEffect(() => {
    if (state?.message === "success" && state.token) {
        const form = document.getElementById("token-create-form-modal") as HTMLFormElement;
        const inviteeName = (form.elements.namedItem("inviteeName") as HTMLInputElement)?.value || "";
        const optimisticToken: InviteToken = {
            id: Math.random(),
            token: state.token,
            inviteeName,
            isUsed: false,
            createdAt: new Date().toISOString(),
        };
        addOptimisticToken(optimisticToken);
        onSuccess(optimisticToken);
        onClose();
    }
  }, [state, onSuccess, onClose, addOptimisticToken]);

  return (
    // 背景オーバーレイ
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* モーダル本体 */}
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <form id="token-create-form-modal" action={formAction}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {t("admin.tokens.createTitle")}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="inviteeName-modal"
              className="block text-sm font-medium text-gray-700"
            >
              {t("admin.tokens.inviteeName")}
            </label>
            <input
              type="text"
              id="inviteeName-modal"
              name="inviteeName"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder={t("admin.tokens.inviteeNamePlaceholder")}
            />
          </div>
          
          {state?.message && state.message !== "success" && (
             <p className="text-sm text-red-500 mt-2">{state.message}</p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end items-center gap-3 mt-6 pt-4">
             <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors"
            >
              {t("admin.common.cancel")}
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

// app/admin/components/AdminPageHeader.tsx
import { useLanguage } from "@/app/providers";
import { signOutToSignin } from "../actions";

export function AdminPageHeader() {
  const { t } = useLanguage();

  return (
    <div className="mb-12">
      {/* 右上にログアウト */}
      <div className="flex justify-end">
        <form
          action={signOutToSignin}
        >
          <button
            className="px-3 py-2 rounded-xl border shadow-sm text-sm hover:bg-gray-50"
            title={t("admin.common.signOut")}
          >
            {t("admin.common.signOut")}
          </button>
        </form>
      </div>

      {/* タイトル */}
      <div className="text-center mt-2">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight sm:text-5xl">
          {t("admin.title")}
        </h1>
        <p className="mt-4 text-lg text-gray-600">{t("admin.description")}</p>
        <div className="mt-6 w-24 h-1 bg-gradient-to-r from-pink-500 to-orange-400 mx-auto rounded-full" />
      </div>
    </div>
  );
}

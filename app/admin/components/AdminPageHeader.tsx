"use client";

// app/admin/components/AdminPageHeader.tsx
import { useLanguage } from "@/app/providers";

export function AdminPageHeader() {
  const { t } = useLanguage();

  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-800 tracking-tight sm:text-5xl">
        {t("admin.title")}
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        {t("admin.description")}
      </p>
      <div className="mt-6 w-24 h-1 bg-gradient-to-r from-pink-500 to-orange-400 mx-auto rounded-full" />
    </div>
  );
}
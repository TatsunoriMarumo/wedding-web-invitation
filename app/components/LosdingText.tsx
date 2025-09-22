// app/components/LoadingText.tsx
"use client";
import { useLanguage } from "../providers";
export default function LoadingText() {
  const { t } = useLanguage();
  return <div className="text-center">{t("common.loading")}</div>;
}

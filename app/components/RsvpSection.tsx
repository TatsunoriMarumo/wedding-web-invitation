"use client";

import { useSearchParams } from "next/navigation";
import { useLanguage } from "../providers";
import RsvpForm from "./RsvpForm";
import EmptyState from "./EmptyState";

export default function RsvpSection() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // トークン検証（実際の実装では、サーバーサイドで検証）
  const isValidToken = token;

  if (!isValidToken) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
            {t("rsvp.title")}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-orange-400 mx-auto rounded-full" />
        </div>

        <EmptyState
          title={t("rsvp.error.title")}
          description={t("rsvp.error.description")}
          action={{
            label: t("rsvp.error.contact"),
            href: "mailto:contact@example.com",
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
          {t("rsvp.title")}
        </h2>
        <p className="text-lg text-gray-600 mb-6">{t("rsvp.subtitle")}</p>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-orange-400 mx-auto rounded-full" />
      </div>

      <RsvpForm token={token} />
    </div>
  );
}

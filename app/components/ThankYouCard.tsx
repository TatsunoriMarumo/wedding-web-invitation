// app/components/ThankYouCard.tsx
"use client";

import { useLanguage } from "../providers";
import ThankYouImage from "./thank-you/ThankYouImage";
import ThankYouActions from "./thank-you/ThankYouActions";

export type Attendance = "ATTEND" | "DECLINE" | undefined;

export default function ThankYouCard({
  imageSrc = "/images/rsvp/thank-you.png",
  inviteeName,
  token,
  attendance,
  supportEmail = "contact@example.com",
}: {
  imageSrc?: string;
  inviteeName?: string;
  token?: string | null;
  attendance?: Attendance;
  supportEmail?: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
          {t("thankYou.title")}
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-orange-400 mx-auto rounded-full" />
      </div>

      <div className="relative max-w-3xl mx-auto overflow-hidden rounded-2xl shadow-xl">
        <ThankYouImage src={imageSrc} alt={t("thankYou.imageAlt")} />

        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* テキストとアクション */}
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <p className="text-sm opacity-90 mb-1">{t("thankYou.badge")}</p>
          <h3 className="text-2xl font-semibold">
            {inviteeName
              ? t("thankYou.titleNamed", { name: inviteeName })
              : t("thankYou.titleDefault")}
          </h3>

          <p className="mt-2 opacity-95">
            {attendance === "ATTEND"
              ? t("thankYou.descriptionAttend")
              : attendance === "DECLINE"
              ? t("thankYou.descriptionDecline")
              : t("thankYou.descriptionGeneric")}
          </p>

          <div className="mt-4">
            <ThankYouActions
              token={token ?? undefined}
              supportEmail={supportEmail}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

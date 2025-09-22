// app/components/RsvpSection.tsx
"use client";

import { useLanguage } from "../providers";
import RsvpForm from "./RsvpForm";

export default function RsvpSection({
  token,
  inviteeName,
}: {
  token: string;
  inviteeName?: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
          {t("rsvp.title")}
        </h2>
          <p className="text-lg text-gray-600 mb-6">
            {inviteeName
              ? t("rsvp.subtitle.named", { name: inviteeName })
              : t("rsvp.subtitle.default")}
          </p>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-orange-400 mx-auto rounded-full" />
      </div>

      <RsvpForm token={token} />
    </div>
  );
}

// app/components/RsvpInvalidCard.tsx
"use client";

import EmptyState from "./EmptyState";
import { useLanguage } from "../providers";

export default function RsvpInvalidCard({ variant }: { variant: "missing" | "notFound" }) {
  const { t } = useLanguage();
  const title =
    variant === "missing" ? t("rsvp.error.missingTitle") : t("rsvp.error.title");
  const description =
    variant === "missing" ? "" : t("rsvp.error.description");

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-3">
          {t("rsvp.title")}
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-orange-400 mx-auto rounded-full" />
      </div>

      <EmptyState
        title={title}
        description={description}
        action={{ label: t("rsvp.error.contact"), href: "mailto:contact@example.com" }}
      />
    </div>
  );
}

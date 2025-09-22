// app/components/thank-you/ThankYouActions.tsx
"use client";

import { useLanguage } from "../../providers";

export default function ThankYouActions({
  // 互換性のため残す（未使用）
  token,
  supportEmail,
}: {
  token?: string;
  supportEmail: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* 連絡ボタン（メール起動） */}
        <a
          href={`mailto:${supportEmail}`}
          className="inline-block px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white transition focus-ring"
        >
          {t("thankYou.actions.contact")}
        </a>
      </div>

      {/* 変更時の案内メッセージ */}
      <p className="text-sm text-white/90">{t("thankYou.changeNote")}</p>
    </div>
  );
}

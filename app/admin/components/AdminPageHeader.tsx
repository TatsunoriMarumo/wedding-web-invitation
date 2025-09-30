"use client";

import { useLanguage } from "@/app/providers";
import { signOutToSignin } from "../actions";

function IconLogout(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M15 17l5-5-5-5M20 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 4h7a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M13 16v2a2 2 0 0 1-2 2H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export default function AdminPageHeader() {
  const { t } = useLanguage();

  return (
    <header className="w-full mb-8 sm:mb-12">
      <div
        className="w-full rounded-2xl border bg-white/80 backdrop-blur shadow-sm
                   ring-1 ring-black/5 px-3 py-3 sm:px-5 sm:py-4"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* タイトル＆説明 */}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {t("admin.title")}
            </h1>
            <p className="hidden sm:block text-sm text-muted-foreground">
              {t("admin.description")}
            </p>
          </div>

          {/* サインアウト */}
          <form action={signOutToSignin}>
            <button
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium
                         text-white focus-ring bg-gradient-to-r from-pink-500 to-orange-400
                         shadow hover:opacity-95"
              title={t("admin.common.signOut")}
            >
              <IconLogout className="w-4 h-4 text-white" />
              {t("admin.common.signOut")}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

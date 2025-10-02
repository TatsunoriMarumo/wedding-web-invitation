// app/(適宜)/components/Greeting.tsx
"use client";

import { useLanguage } from "../providers";

export default function Greeting() {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="greeting" className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
      {/* アクセシブル見出し（画面には非表示） */}
      <h2 id="greeting" className="sr-only">Greeting</h2>

      <div className="relative mx-auto max-w-3xl">
        {/* 背景のやわらかい装飾（モバイルで重くならない程度） */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 blur-2xl"
        >
          <div className="mx-auto h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-gradient-to-br from-pink-200/60 via-rose-100/60 to-sky-200/60 dark:from-pink-400/10 dark:via-rose-400/10 dark:to-sky-400/10" />
        </div>

        {/* 本体カード */}
        <article className="rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-black/5 shadow-lg p-6 sm:p-8 animate-fade-in-up dark:bg-white/5">

          {/* テキスト */}
          <p className="whitespace-pre-line text-center text-[15px] leading-relaxed text-gray-700 sm:text-base md:text-lg dark:text-gray-100">
            {t("hero.greeting") as string}
          </p>

          {/* 下線アクセント */}
          <div className="mx-auto mt-6 h-[3px] w-20 rounded-full bg-gradient-to-r from-pink-300 to-sky-300 dark:from-pink-500/50 dark:to-sky-500/50" />
        </article>
      </div>
    </section>
  );
}

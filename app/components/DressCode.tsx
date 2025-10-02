"use client";

import { useLanguage } from "../providers";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export default function DressCode() {
  const { t } = useLanguage();

  const okMemos = (t("dresscode.ok.memos") as unknown as string[]) ?? [];
  const ngMemos = (t("dresscode.ng.memos") as unknown as string[]) ?? [];

  const okAlt = t("dresscode.ok.alt") as string;
  const ngAlt = t("dresscode.ng.alt") as string;

  const okImage = "/images/punta/suit-punta.png?height=400&width=300";
  const ngImage = "/images/punta/t-shirt-punta.png?height=400&width=300";

  return (
    <section
      aria-labelledby="dresscode-title"
      className="container mx-auto px-4"
    >
      {/* ===== ヘッダー：タイトル＆サブタイトル ===== */}
      <div className="relative mx-auto max-w-4xl text-center mb-12 sm:mb-14 md:mb-16">
        {/* 背景グロー（軽量・テーマ馴染み） */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
        >
          <div className="h-28 w-[85%] sm:h-36 sm:w-4/5 rounded-full blur-2xl bg-gradient-to-r from-pink-200/40 via-orange-200/30 to-sky-200/40 dark:from-pink-500/10 dark:via-orange-500/10 dark:to-sky-500/10" />
        </div>

        {/* タイトル */}
        <h2
          id="dresscode-title"
          className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-gray-800"
        >
            {t("dresscode.title")}
        </h2>

        {/* サブタイトル（読みやすさ優先の行間＆幅） */}
        <p className="mx-auto mt-4 sm:mt-5 max-w-2xl text-[15px] sm:text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-100 whitespace-pre-wrap">
          {t("dresscode.subtitle")}
        </p>

        {/* アクセントバー */}
        <div className="mx-auto mt-6 h-[3px] w-24 rounded-full bg-gradient-to-r from-pink-400 to-orange-400 dark:from-pink-500/60 dark:to-orange-500/60" />
      </div>

      {/* ===== 本文：推奨/NGカード（従来どおり） ===== */}
      <div className="space-y-12 max-w-6xl mx-auto">
        {/* 推奨スタイル */}
        <div className="bg-white/80 dark:bg-white/5 rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white">
            <div className="flex items-center justify-center space-x-3">
              <h3 className="text-2xl font-semibold">
                {t("dresscode.ok.title")}
              </h3>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              <div className="flex-shrink-0 w-full md:w-80">
                <div className="relative bg-green-50 dark:bg-emerald-900/10 rounded-xl overflow-hidden shadow-md">
                  <Image
                    src={okImage || "/placeholder.svg"}
                    alt={okAlt}
                    width={300}
                    height={400}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <CheckIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="w-full md:flex-1 md:min-w-0">
                <div className="bg-green-50 dark:bg-emerald-900/10 p-5 sm:p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-3 sm:mb-4">
                    {t("dresscode.point.ok")}
                  </h4>
                  <div className="space-y-3 whitespace-pre-line">
                    {okMemos.map((memo, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 rounded-full bg-green-500" />
                        <p className="text-gray-700 dark:text-gray-100 leading-relaxed">
                          {memo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NGスタイル */}
        <div className="bg-white/80 dark:bg-white/5 rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden">
          <div className="bg-gradient-to-r from-red-400 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-center space-x-3">
              <h3 className="text-2xl font-semibold">
                {t("dresscode.ng.title")}
              </h3>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              <div className="flex-shrink-0 w-full md:w-80">
                <div className="relative bg-red-50 dark:bg-rose-900/10 rounded-xl overflow-hidden shadow-md">
                  <Image
                    src={ngImage || "/placeholder.svg"}
                    alt={ngAlt}
                    width={300}
                    height={400}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg">
                    <XMarkIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="w-full md:flex-1 md:min-w-0">
                <div className="bg-red-50 dark:bg-rose-900/10 p-5 sm:p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-3 sm:mb-4">
                    {t("dresscode.point.ng")}
                  </h4>
                  <div className="space-y-3 whitespace-pre-line">
                    {ngMemos.map((memo, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 rounded-full bg-red-500" />
                        <p className="text-gray-700 dark:text-gray-100 leading-relaxed">
                          {memo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

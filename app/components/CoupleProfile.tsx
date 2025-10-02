"use client";

import { useLanguage } from "../providers";
import Image from "next/image";

export default function CoupleProfile() {
  const { t } = useLanguage();
  const groomAlt = t("profile.groom.alt") as string;
  const brideAlt = t("profile.bride.alt") as string;

  return (
    <section aria-labelledby="couple-profile" className="container mx-auto px-4 py-12 md:py-16">
      {/* 見出し */}
      <div className="text-center mb-10 md:mb-16 animate-fade-in-up">
        <h2 id="couple-profile" className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
          {t("profile.title")}
        </h2>
        <div className="mt-4 w-20 sm:w-24 h-1 bg-gradient-to-r from-accent-300 to-warn-300 mx-auto rounded-full" />
      </div>

      {/* プロフィール本体：モバイルは縦並び → md以上で2カラム */}
      <div className="grid gap-10 md:gap-16 md:grid-cols-2 max-w-6xl mx-auto">
        {/* 新郎 */}
        <article className="group relative rounded-2xl bg-white/70 backdrop-blur-sm p-6 shadow-lg ring-1 ring-black/5 md:p-8">
          <div className="flex flex-col items-center text-center">
            {/* 丸型写真（モバイル小さめ、mdで拡大） */}
            <div className="relative mb-5">
              <div className="p-1 rounded-full bg-gradient-to-br from-info-200 via-accent-200 to-warn-200">
                <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]">
                  <Image
                    src="/images/takuto/takuto_profile.JPG?height=400&width=400"
                    alt={groomAlt}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover object-[50%_5%]"
                    priority
                  />
                </div>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              {t("profile.groom.name")}
            </h3>

            <p className="prose prose-neutral max-w-prose text-gray-700 leading-relaxed">
              {t("profile.groom.message")}
            </p>
          </div>
        </article>

        {/* 新婦 */}
        <article className="group relative rounded-2xl bg-white/70 backdrop-blur-sm p-6 shadow-lg ring-1 ring-black/5 md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="p-1 rounded-full bg-gradient-to-br from-accent-200 via-warn-200 to-info-200">
                <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]">
                  <Image
                    src="/images/hina/hina_profile.JPG?height=400&width=400"
                    alt={brideAlt}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover object-[50%_3%]"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              {t("profile.bride.name")}
            </h3>

            <p className="prose prose-neutral max-w-prose text-gray-700 leading-relaxed">
              {t("profile.bride.message")}
            </p>
          </div>
        </article>
      </div>

      {/* 相手の第一印象：モバイル1カラム → mdで左右に配置 */}
      <div className="mt-12 md:mt-16">
        <div className="text-center mb-6 md:mb-8">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
            {t("profile.firstImpression.title")}
          </h3>
          <div className="mt-3 w-16 sm:w-20 h-[3px] bg-gradient-to-r from-accent-300 to-info-300 mx-auto rounded-full" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
          {/* 新郎 → 新婦の第一印象 */}
          <figure className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 p-5 shadow-md ring-1 ring-black/5">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <Image
                  src="/images/takuto/takuto_profile.JPG?height=120&width=120"
                  alt={groomAlt}
                  width={64}
                  height={64}
                  className="w-12 h-12 rounded-full object-cover object-[50%_5%]"
                />
              </div>
              <blockquote className="text-gray-800 leading-relaxed pt-1.5">
                <p>{t("profile.groom.firstImpression")}</p>
              </blockquote>
            </div>
          </figure>

          {/* 新婦 → 新郎の第一印象 */}
          <figure className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 p-5 shadow-md ring-1 ring-black/5">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <Image
                  src="/images/hina/hina_profile.JPG?height=120&width=120"
                  alt={brideAlt}
                  width={64}
                  height={64}
                  className="w-12 h-12 rounded-full object-cover object-[50%_3%]"
                />
              </div>
              <blockquote className="text-gray-800 leading-relaxed pt-1.5">
                <p>{t("profile.bride.firstImpression")}</p>
              </blockquote>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}

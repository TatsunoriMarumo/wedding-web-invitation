"use client";

import { useLanguage } from "../providers";
import Image from "next/image";

export default function CoupleProfile() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
          プロフィール
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-orange-400 mx-auto rounded-full" />
      </div>

      <div className="grid md:grid-cols-2 gap-12 md:gap-16 max-w-6xl mx-auto">
        {/* 新郎 */}
        <div className="text-center group">
          <div className="relative mb-6 inline-block">
            <div className="w-64 h-64 mx-auto rounded-full overflow-hidden shadow-2xl group-hover:shadow-3xl transition-shadow duration-300">
              <Image
                src="/images/takuto_profile.JPG?height=400&width=400"
                alt="新郎の写真"
                width={400}
                height={400}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">👨</span>
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            {t("profile.groom.name")}
          </h3>

          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 shadow-lg">
            <p className="text-gray-700 leading-relaxed">
              {t("profile.groom.message")}
            </p>
          </div>
        </div>

        {/* 新婦 */}
        <div className="text-center group">
          <div className="relative mb-6 inline-block">
            <div className="w-64 h-64 mx-auto rounded-full overflow-hidden shadow-2xl group-hover:shadow-3xl transition-shadow duration-300">
              <Image
                src="/images/hina_profile.JPG?height=400&width=400"
                alt="新婦の写真"
                width={400}
                height={400}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">👰</span>
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            {t("profile.bride.name")}
          </h3>

          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 shadow-lg">
            <p className="text-gray-700 leading-relaxed">
              {t("profile.bride.message")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

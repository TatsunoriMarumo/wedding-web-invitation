"use client";

import { useLanguage } from "../providers";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export default function DressCode() {
  const { t } = useLanguage();

  const okExample = {
    image: "/images/suit-punta.png?height=400&width=300",
    memos: [
      "ダークカラーのスーツ（ネイビー、チャコール等）",
      "膝丈以上の上品なワンピース",
      "きちんと感のあるジャケットスタイル",
      "3-5cmヒールの上品な靴",
      "アクセサリーは控えめに",
      "清潔感のある髪型・メイク",
    ],
  };

  const ngExample = {
    image: "/images/t-shirt-punta.png?height=400&width=300",
    memos: [
      "ジーンズ、Tシャツ、スニーカーなど",
      "白い服装（新婦と被る色）",
      "肩や胸元が大きく開いた服",
      "つま先の見える靴、ビーチサンダル",
      "派手すぎるアクセサリー",
      "カジュアル過ぎる髪型",
    ],
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
          {t("dresscode.title")}
        </h2>
        <p className="text-lg text-gray-600 mb-6">{t("dresscode.subtitle")}</p>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-orange-400 mx-auto rounded-full" />
      </div>

      <div className="space-y-12 max-w-6xl mx-auto">
        {/* 推奨スタイル */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white">
            <div className="flex items-center justify-center space-x-3">
              <CheckIcon className="w-8 h-8" />
              <h3 className="text-2xl font-semibold">
                {t("dresscode.ok.title")}
              </h3>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-full md:w-80">
                <div className="relative bg-green-50 rounded-xl overflow-hidden shadow-md">
                  <Image
                    src={okExample.image || "/placeholder.svg"}
                    alt="推奨ドレスコード例"
                    width={300}
                    height={400}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <CheckIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="bg-green-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-800 text-lg mb-4">
                    推奨スタイルのポイント
                  </h4>
                  <div className="space-y-3">
                    {okExample.memos.map((memo, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <p className="text-gray-700 leading-relaxed">{memo}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NGスタイル */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-400 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-center space-x-3">
              <XMarkIcon className="w-8 h-8" />
              <h3 className="text-2xl font-semibold">
                {t("dresscode.ng.title")}
              </h3>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-full md:w-80">
                <div className="relative bg-red-50 rounded-xl overflow-hidden shadow-md">
                  <Image
                    src={ngExample.image || "/placeholder.svg"}
                    alt="NGドレスコード例"
                    width={300}
                    height={400}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg">
                    <XMarkIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="bg-red-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-800 text-lg mb-4">
                    避けていただきたいスタイル
                  </h4>
                  <div className="space-y-3">
                    {ngExample.memos.map((memo, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <p className="text-gray-700 leading-relaxed">{memo}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

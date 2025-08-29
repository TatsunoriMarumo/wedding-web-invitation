"use client";

import { useLanguage } from "../providers";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export default function DressCode() {
  const { t } = useLanguage();


  const okMemos = (t("dresscode.ok.memos") as unknown as string[]) ?? [];
  const ngMemos = (t("dresscode.ng.memos") as unknown as string[]) ?? [];

  const okAlt = (t("dresscode.ok.alt") as string);
  const ngAlt = (t("dresscode.ng.alt") as string);

  const okImage = "/images/punta/suit-punta.png?height=400&width=300";
  const ngImage = "/images/punta/t-shirt-punta.png?height=400&width=300";

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

              <div className="flex-1">
                <div className="bg-green-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-800 text-lg mb-4">
                    {t("dresscode.point.ok")}
                  </h4>
                  <div className="space-y-3">
                    {okMemos.map((memo, index) => (
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

              <div className="flex-1">
                <div className="bg-red-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-800 text-lg mb-4">
                    {t("dresscode.point.ng")}
                  </h4>
                  <div className="space-y-3">
                    {ngMemos.map((memo, index) => (
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

"use client";

import { useLanguage } from "../providers";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function DressCode() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
          {t("dresscode.title")}
        </h2>
        <p className="text-lg text-gray-600 mb-6">{t("dresscode.subtitle")}</p>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-orange-400 mx-auto rounded-full" />
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* OK例 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white">
            <div className="flex items-center space-x-3">
              <CheckIcon className="w-8 h-8" />
              <h3 className="text-2xl font-semibold">
                {t("dresscode.ok.title")}
              </h3>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {t("dresscode.ok.items").map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl"
              >
                <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-800">{item.item}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NG例 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-400 to-pink-500 p-6 text-white">
            <div className="flex items-center space-x-3">
              <XMarkIcon className="w-8 h-8" />
              <h3 className="text-2xl font-semibold">
                {t("dresscode.ng.title")}
              </h3>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {t("dresscode.ng.items").map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-red-50 rounded-xl"
              >
                <XMarkIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-800">{item.item}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

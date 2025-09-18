"use client";

import { useState } from "react";
import { useLanguage } from "../providers";
import {
  MapPinIcon,
  ClockIcon,
  TruckIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

export default function Access() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"walk" | "taxi">("walk");

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
          {t("access.title")}
        </h2>
        <p className="text-lg text-gray-600 mb-6">{t("access.subtitle")}</p>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-orange-400 mx-auto rounded-full" />
      </div>

      <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* 地図 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-80 bg-gray-200 flex items-center justify-center">
            <iframe
                title="venue-map"
                src={`https://www.google.com/maps?q=%E3%80%92531-6101%20%E5%A4%A7%E9%98%AA%E5%B8%82%E5%8C%97%E5%8C%BA%E5%A4%A7%E6%B7%80%E4%B8%AD1-8-30&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
          </div>

          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t("access.venue.name")}
            </h3>
            <p className="text-gray-600 mb-4">{t("access.venue.address")}</p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-red-700">
                <TruckIcon className="w-5 h-5" />
                <span className="font-medium">{t("access.parking.title")}</span>
              </div>
              <p className="text-red-600 text-sm mt-1">
                {t("access.parking.notice")}
              </p>
            </div>
          </div>
        </div>

        {/* アクセス方法 */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {t("access.tabs.title")}
            </h3>

            {/* タブボタン */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab("walk")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "walk"
                    ? "bg-white text-pink-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {t("access.tabs.walk")}
              </button>
              <button
                onClick={() => setActiveTab("taxi")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "taxi"
                    ? "bg-white text-pink-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {t("access.tabs.taxi")}
              </button>
            </div>

            {/* タブコンテンツ */}
            {activeTab === "walk" && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center">
                    <BuildingOffice2Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {t("access.tabs.walk")}
                    </h4>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-2xl font-bold text-pink-600">
                        {t("access.walkAccess.duration")}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  {t("access.walkAccess.description")}
                </p>

                <div className="space-y-2">
                  {t("access.walkAccess.details").map(
                    (detail: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-pink-400 rounded-full flex-shrink-0 mt-2"></div>
                        <p className="text-gray-700">{detail}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {activeTab === "taxi" && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center">
                    <TruckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {t("access.tabs.taxi")}
                    </h4>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span className="text-2xl font-bold text-pink-600">
                          {t("access.taxiAccess.duration")}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {t("access.taxiAccess.fare")}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  {t("access.taxiAccess.description")}
                </p>

                <div className="space-y-2">
                  {t("access.taxiAccess.details").map(
                    (detail: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-pink-400 rounded-full flex-shrink-0 mt-2"></div>
                        <p className="text-gray-700">{detail}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 当日カード */}
          <div className="bg-gradient-to-br from-sky-50 to-pink-50 rounded-2xl p-6 border-2 border-dashed border-pink-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📱</span>
              {t("access.eventCard.title")}
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>{t("access.eventCard.date")}</p>
              <p>{t("access.eventCard.reception")}</p>
              <p>{t("access.eventCard.contact")}</p>
            </div>

            <div className="flex space-x-2 mt-4">
              <button className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors">
                {t("access.eventCard.addToCalendar")}
              </button>
              <button className="flex-1 border border-pink-500 text-pink-500 py-2 px-4 rounded-lg text-sm font-medium hover:bg-pink-50 transition-colors">
                {t("access.eventCard.share")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState("train");

  const transportOptions = [
    {
      id: "train",
      icon: BuildingOffice2Icon,
      label: t("access.transport.train.label"),
      time: t("access.transport.train.time"),
      description: t("access.transport.train.description"),
      details: t("access.transport.train.details"),
    },
    {
      id: "taxi",
      icon: TruckIcon,
      label: t("access.transport.taxi.label"),
      time: t("access.transport.taxi.time"),
      description: t("access.transport.taxi.description"),
      details: t("access.transport.taxi.details"),
    },
  ];

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
            <div className="text-center text-gray-500">
              <MapPinIcon className="w-12 h-12 mx-auto mb-2" />
              <p>Google Map</p>
              <p className="text-sm">（実装時にGoogle Maps APIを使用）</p>
            </div>
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
          {/* タブ */}
          <div className="flex space-x-2 bg-gray-100 rounded-xl p-1">
            {transportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveTab(option.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
                  activeTab === option.id
                    ? "bg-white shadow-md text-pink-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <option.icon className="w-5 h-5" />
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>

          {/* アクティブなタブの内容 */}
          {transportOptions.map(
            (option) =>
              activeTab === option.id && (
                <div
                  key={option.id}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center">
                      <option.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {option.label}
                      </h3>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <ClockIcon className="w-4 h-4" />
                        <span className="text-2xl font-bold text-pink-600">
                          {option.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{option.description}</p>

                  <div className="space-y-2">
                    {option.details.map((detail: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-pink-600 text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-gray-700">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}

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
              <p>{t("access.eventCard.dresscode")}</p>
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

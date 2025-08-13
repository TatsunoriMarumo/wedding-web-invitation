"use client";

import { useLanguage } from "../providers";
import { HeartIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/solid";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <HeartIcon className="w-8 h-8 text-pink-400" />
            <h3 className="text-2xl font-semibold">太郎 & 花子</h3>
            <HeartIcon className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
            私たちの特別な日にお越しいただける皆様に、心より感謝申し上げます。
            素敵な時間を一緒に過ごせることを楽しみにしております。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <EnvelopeIcon className="w-8 h-8 text-pink-400 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">{t("footer.contact")}</h4>
            <p className="text-gray-300 text-sm">wedding@example.com</p>
          </div>

          <div className="text-center">
            <PhoneIcon className="w-8 h-8 text-pink-400 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">緊急連絡先</h4>
            <p className="text-gray-300 text-sm">090-1234-5678</p>
          </div>

          <div className="text-center">
            <div className="w-8 h-8 bg-pink-400 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-white text-sm font-bold">日</span>
            </div>
            <h4 className="font-semibold mb-2">挙式日</h4>
            <p className="text-gray-300 text-sm">2024年6月15日</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400 text-sm">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}

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
            <h3 className="text-2xl font-semibold">{t("footer.title")}</h3>
            <HeartIcon className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t("footer.message")}
          </p>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400 text-sm">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}

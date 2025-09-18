"use client";

import { useLanguage } from "../providers";
import { HeartIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-r from-rose-300 to-amber-200 text-gray-700 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image
              src="/images/punta/circle-punta.png"
              alt="ぷん太"
              width={40}
              height={40}
              className="w-8 h-8 rounded-full object-cover ring-1 shadow"
            />
            <h3 className="text-2xl font-semibold whitespace-pre-line">{t("footer.title")}</h3>
            <Image
              src="/images/punta/circle-punta.png"
              alt="ぷん太"
              width={40}
              height={40}
              className="w-8 h-8 rounded-full object-cover ring-1 shadow"
            />
          </div>
          <p className="text-red-500 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
            {t("footer.message")}
          </p>
        </div>
        <div className="border-t border-gray-500 pt-8 text-center">
          <p className="text-gray-700 text-sm">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}

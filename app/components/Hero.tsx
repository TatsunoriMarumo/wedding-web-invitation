"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../providers";
import Image from "next/image";

export default function Hero() {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const weddingDate = new Date("2024-06-15T14:30:00");

    const updateCountdown = () => {
      const now = new Date();
      const difference = weddingDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 背景画像 */}
      <div className="absolute inset-0">
        <Image
          src="/images/sit.JPG?height=1080&width=1920"
          alt="Wedding ceremony background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      </div>

      {/* 光筋エフェクト */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent transform rotate-12" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-white/15 to-transparent transform -rotate-12" />
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold mb-6 tracking-tight">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            {t("hero.subtitle")}
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 border border-white/20">
            <div className="space-y-2 mb-6">
              <p className="text-xl md:text-2xl font-medium">
                {t("hero.date")}
              </p>
              <p className="text-lg opacity-90">{t("hero.time")}</p>
              <p className="text-lg opacity-90">{t("hero.venue")}</p>
            </div>

            {/* カウントダウン */}
            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
              {[
                { value: timeLeft.days, label: t("countdown.days") },
                { value: timeLeft.hours, label: t("countdown.hours") },
                { value: timeLeft.minutes, label: t("countdown.minutes") },
                { value: timeLeft.seconds, label: t("countdown.seconds") },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold">
                    {item.value}
                  </div>
                  <div className="text-xs md:text-sm opacity-75">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-base md:text-lg leading-relaxed opacity-90 max-w-2xl mx-auto">
            {t("hero.greeting")}
          </p>
        </div>
      </div>

      {/* スクロール指示 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

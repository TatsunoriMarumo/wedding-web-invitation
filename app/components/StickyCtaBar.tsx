"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../providers";

export default function StickyCtaBar() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const scrollToRsvp = () => {
    const element = document.getElementById("rsvp");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-600">あと</div>
            <div className="flex items-center space-x-1">
              <span className="text-lg font-bold text-pink-600">
                {timeLeft.days}
              </span>
              <span className="text-xs text-gray-500">日</span>
              <span className="text-sm font-medium text-pink-600">
                {timeLeft.hours}:{timeLeft.minutes.toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          <button
            onClick={scrollToRsvp}
            className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            {t("cta.rsvp")}
          </button>
        </div>
      </div>
    </div>
  );
}

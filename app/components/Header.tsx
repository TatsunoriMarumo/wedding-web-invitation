"use client";

import { useState, useEffect, forwardRef } from "react";
import { useLanguage } from "../providers";
import type { TranslationKey } from "../providers";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

// 翻訳キーをリテラルで固定しつつ、型で保証する
const sections = [
  { id: "intro", key: "nav.intro" },
  { id: "profile", key: "nav.profile" },
  { id: "dresscode", key: "nav.dresscode" },
  { id: "rsvp", key: "nav.rsvp" },
  { id: "gift", key: "nav.gift" },
  { id: "access", key: "nav.access" },
  { id: "gallery", key: "nav.gallery" },
] as const satisfies readonly { id: string; key: TranslationKey }[];

// id ユニオンを抽出
type SectionId = (typeof sections)[number]["id"];

// props の型
interface HeaderProps {
  headerHeight: number;
}

const Header = forwardRef<HTMLElement, HeaderProps>(({ headerHeight }, ref) => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<SectionId>("intro");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
  const handleScroll = () => {
    const scrollOffset = headerHeight;
    const sectionElements = sections.map(s => ({
      id: s.id,
      el: document.getElementById(s.id),
    }));

    const current = sectionElements.find(({ el }) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top <= scrollOffset && r.bottom >= scrollOffset;
    });

    if (current) setActiveSection(current.id as SectionId);
  };
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, [headerHeight]);

  // スクロールロジック
  const scrollToSection = (sectionId: SectionId) => {
    setIsMobileMenuOpen(false); // メニューを閉じる

    // "intro" は最上部へ
    if (sectionId === "intro") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <header
        ref={ref}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-lg py-2"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* デスクトップのナビ */}
            <div className="hidden md:flex items-center space-x-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-pink-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-pink-500 hover:bg-pink-50"
                  }`}
                >
                  {t(section.key)}
                </button>
              ))}
            </div>

            {/* モバイル：メニューボタン */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-pink-500 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* 中央タイトル（モバイルのみ） */}
            <div className="md:hidden absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-lg font-semibold text-gray-800">Wedding</h1>
            </div>

            {/* 右側 CTA */}
            <div className="flex items-center">
              <button
                onClick={() => scrollToSection("rsvp")}
                className="hidden md:block bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                {t("cta.rsvp")}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* モバイルメニュー */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-0 left-0 w-80 max-w-[80vw] h-full bg-white shadow-2xl transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6 pt-20">
            <nav className="space-y-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-pink-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-pink-50 hover:text-pink-500"
                  }`}
                >
                  {t(section.key)}
                </button>
              ))}
              <button
                onClick={() => scrollToSection("rsvp")}
                className="w-full bg-orange-400 hover:bg-orange-500 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 mt-6"
              >
                {t("cta.rsvp")}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
});

Header.displayName = "Header";
export default Header;

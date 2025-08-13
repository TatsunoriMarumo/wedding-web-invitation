"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../providers";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const sections = [
  { id: "intro", key: "nav.intro" },
  { id: "profile", key: "nav.profile" },
  { id: "dresscode", key: "nav.dresscode" },
  { id: "rsvp", key: "nav.rsvp" },
  { id: "access", key: "nav.access" },
  { id: "gallery", key: "nav.gallery" },
];

export default function Header() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState("intro");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // アクティブセクションの検出
      const sectionElements = sections.map((section) => ({
        id: section.id,
        element: document.getElementById(section.id),
      }));

      const currentSection = sectionElements.find(({ element }) => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
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

            <div className="md:hidden absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-lg font-semibold text-gray-800">Wedding</h1>
            </div>

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

      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* オーバーレイ */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* メニューパネル */}
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

              {/* モバイル用RSVPボタン */}
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
}

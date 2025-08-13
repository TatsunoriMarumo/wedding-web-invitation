"use client";

import { createContext, useContext, type ReactNode } from "react";
import { translations, getNestedValue, type Language } from "../lib/i18n";

interface LanguageContextType {
  t: (key: string) => string;
  language: Language;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function Providers({ children }: { children: ReactNode }) {
  const language: Language = "ja";

  const t = (key: string): string => {
    return getNestedValue(translations[language], key) || key;
  };

  return (
    <LanguageContext.Provider value={{ t, language }}>
      {children}
    </LanguageContext.Provider>
  );
}

"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { translations, getNestedValue, type Language } from "../lib/i18n";

/** ===== 型ユーティリティ（配列は葉で打ち切り） ===== */
type TranslationSchema = (typeof translations)[keyof typeof translations];

type DottedPaths<T, Prev extends string = ""> = T extends readonly any[]
  ? Prev
  : T extends object
  ? {
      [K in Extract<keyof T, string>]: DottedPaths<
        T[K],
        Prev extends "" ? K : `${Prev}.${K}`
      >;
    }[Extract<keyof T, string>]
  : Prev;

type NonEmpty<T> = T extends "" ? never : T;
type TranslationKey = NonEmpty<DottedPaths<TranslationSchema>>;

type PathValue<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PathValue<T[K], R>
    : never
  : P extends keyof T
  ? T[P]
  : never;

type ValueOfKey<K extends TranslationKey> = PathValue<TranslationSchema, K>;

/** ===== Context 型 ===== */
interface LanguageContextType {
  t: <K extends TranslationKey>(
    key: K,
    _opts?: { returnObjects?: boolean } 
  ) => ValueOfKey<K>;
  language: Language;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

export function Providers({ children }: { children: ReactNode }) {
  // 必要に応じて localStorage / cookie 等から復元する実装に差し替え可
  const language: Language = "ja";

  // t はキー型に応じた厳密な返り値型を維持
  const t = useCallback(
    <K extends TranslationKey>(key: K): ValueOfKey<K> => {
      const v = getNestedValue(translations[language], key as string);
      if (process.env.NODE_ENV !== "production" && v == null) {
        // 開発時にだけ warn（本番では無音）
        console.warn(`[i18n] Missing key: ${String(key)} (lang=${language})`);
      }
      // 未定義ならキー文字列をそのまま返す（型は安全にキャスト）
      return (v ?? key) as ValueOfKey<K>;
    },
    [language]
  );

  // Provider 値はメモ化して下位ツリーの再レンダーを抑制
  const value = useMemo(() => ({ t, language }), [t, language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

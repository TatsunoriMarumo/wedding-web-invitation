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

type DottedPaths<T, Prev extends string = ""> = T extends readonly unknown[]
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

/** 他ファイルでも使うために export します */
export type TranslationKey = NonEmpty<DottedPaths<TranslationSchema>>;

type PathValue<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PathValue<T[K], R>
    : never
  : P extends keyof T
  ? T[P]
  : never;

type ValueOfKey<K extends TranslationKey> = PathValue<TranslationSchema, K>;

/** ===== 追加：t用オプション型（差し込みを許可） ===== */
type TOptions = {
  returnObjects?: boolean;
} & Record<string, string | number | boolean | null | undefined>;

/** ===== Context 型 ===== */
interface LanguageContextType {
  t: <K extends TranslationKey>(key: K, opts?: TOptions) => ValueOfKey<K>;
  language: Language;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

/** ===== 追加：{{var}} 補間関数 ===== */
function interpolate(template: string, opts?: TOptions): string {
  if (!opts) return template;
  const { returnObjects: _ignored, ...vars } = opts;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => {
    const v = vars[k];
    return v === null || v === undefined ? "" : String(v);
  });
}

export function Providers({ children }: { children: ReactNode }) {
  // 必要に応じて localStorage / cookie 等から復元する実装に差し替え可
  const language: Language = "ja";

  // t はキー型に応じた厳密な返り値型を維持
  const t = useCallback(
    <K extends TranslationKey>(key: K, opts?: TOptions): ValueOfKey<K> => {
      const v = getNestedValue(translations[language], key as string);
      if (process.env.NODE_ENV !== "production" && v == null) {
        console.warn(`[i18n] Missing key: ${String(key)} (lang=${language})`);
      }

      // 文字列は補間して返す
      if (typeof v === "string") {
        return interpolate(v, opts) as ValueOfKey<K>;
      }

      // オブジェクト/配列/その他はそのまま返す（キー型に合致）
      return (v ?? (key as unknown)) as ValueOfKey<K>;
    },
    [language]
  );

  const value = useMemo(() => ({ t, language }), [t, language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

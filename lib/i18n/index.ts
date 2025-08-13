import { ja } from "./ja";

export type TranslationKey = keyof typeof ja;
export type NestedTranslationKey = string;

export const translations = {
  ja,
} as const;

export type Language = keyof typeof translations;
export type Translation = (typeof translations)[Language];

// ネストされたオブジェクトから値を取得するヘルパー関数
export function getNestedValue(obj: any, path: string): string {
  return path.split(".").reduce((current, key) => current?.[key], obj) || path;
}

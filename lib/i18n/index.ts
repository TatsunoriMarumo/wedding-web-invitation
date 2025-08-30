// ./lib/i18n/index.ts

// 既存の言語ファイルのエクスポート形に合わせて調整してください（default export を想定）
import { ja } from "./ja";

/** 翻訳ツリーは文字列（や文字列配列）と入れ子オブジェクトで構成される想定 */
export type TranslationLeaf = string | readonly string[];
export type TranslationTree =
  | TranslationLeaf
  | { readonly [key: string]: TranslationTree };

/** 全言語の辞書 */
export const translations = {
  ja,
} as const satisfies Record<string, TranslationTree>;

/** 利用可能な言語コード */
export type Language = keyof typeof translations;

/** ------ 型ユーティリティ： "a.b.c" から値の型を取得 ------ */
type PathValue<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PathValue<T[K], R>
    : undefined
  : P extends keyof T
  ? T[P]
  : undefined;

/** ------ ランタイムユーティリティ：ドット区切りでネスト取得 ------ */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getNestedValue<T, P extends string>(
  obj: T,
  path: P
): PathValue<T, P> {
  let cur: unknown = obj;
  for (const key of path.split(".")) {
    if (!isRecord(cur)) {
      return undefined as PathValue<T, P>;
    }
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur as PathValue<T, P>;
}

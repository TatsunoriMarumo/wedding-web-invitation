import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    /** UI上の見出しなどに使う表示名 */
    title?: string;
    isVisible?: boolean;
    // 必要ならここに他のメタも追加
    // filterVariant?: 'text' | 'select' | 'range';
  }
}
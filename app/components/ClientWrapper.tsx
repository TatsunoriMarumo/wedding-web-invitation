"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import Header from "./Header";
import { useLanguage } from "../providers";

interface ClientWrapperProps {
  children: ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
        // 初回のみisReadyをtrueにする
        if (!isReady && height > 0) {
          setIsReady(true);
        }
      }
    };

    // 初回レンダリング時の高さ取得
    // requestAnimationFrameを使用して、DOMが完全に構築された後に実行
    requestAnimationFrame(() => {
      updateHeaderHeight();
    });

    // ウィンドウリサイズ時の高さ更新
    window.addEventListener("resize", updateHeaderHeight);

    // クリーンアップ関数
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, [isReady]);

  // ローディング画面
  if (!isReady) {
    return (
      <>
        <Header ref={headerRef} headerHeight={0} />
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
          <div className="text-center">
            <div className="relative">
              {/* アニメーションするハートアイコン */}
              <div className="animate-pulse">
                <svg
                  className="w-16 h-16 mx-auto text-pink-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>

              {/* ローディングテキスト */}
              <div className="mt-4 space-y-2">
                <div className="text-lg font-medium text-gray-700">
                  {t("common.loading")}
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <div
                    className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // メインコンテンツ
  return (
    <>
      <Header ref={headerRef} headerHeight={headerHeight} />
      <main
        className="min-h-screen bg-gradient-to-b from-sky-50 to-white animate-fadeIn"
        style={{ paddingTop: `${headerHeight}px` }}
      >
        {children}
      </main>

      {/* フェードインアニメーション用のスタイル */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}

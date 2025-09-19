import type React from "react";
import type { Metadata } from "next";
import { Klee_One } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ja } from "../lib/i18n/ja";

const kleeOne = Klee_One({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-klee-one",
  display: "swap",
});

export const metadata: Metadata = {
  title: ja.meta.title,
  description: ja.meta.description,
  openGraph: {
    title: ja.meta.title,
    description: ja.meta.description,
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "images/punta/punta-favi.ico"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={kleeOne.variable}>
      <body className="font-klee antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

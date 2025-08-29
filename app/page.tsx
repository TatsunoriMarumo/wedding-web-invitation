"use client"; // DOM操作のためクライアントコンポーネントに

import { Suspense, useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CoupleProfile from "./components/CoupleProfile";
import DressCode from "./components/DressCode";
import RsvpSection from "./components/RsvpSection";
import Access from "./components/Access";
import Gallery from "./components/Gallery";
import Footer from "./components/Footer";
import SectionDivider from "./components/SectionDivider";
import Greeting from "./components/Greeting";

export default function Home() {
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    // 初回レンダリング時とウィンドウリサイズ時に高さを更新
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);

    // クリーンアップ関数
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  return (
    // 静的なpt-20を削除し、style属性で動的にpaddingTopを設定
    <main
      className="min-h-screen bg-gradient-to-b from-sky-50 to-white"
      style={{ paddingTop: `${headerHeight}px` }}
    >
      {/* 作成したrefをHeaderコンポーネントに渡す */}
      <Header ref={headerRef} headerHeight={headerHeight} />

      <section id="intro">
        <Hero />
      </section>

      <section id="greeting" className="py-16 md:py-24">
        <Greeting />
      </section>

      <SectionDivider />

      <section id="profile" className="py-16 md:py-24">
        <CoupleProfile />
      </section>

      <SectionDivider variant="reverse" />

      <section
        id="dresscode"
        className="py-16 md:py-24 bg-gradient-to-r from-sky-50 to-pink-50"
      >
        <DressCode />
      </section>

      <SectionDivider />

      <section id="rsvp" className="py-16 md:py-24">
        <Suspense fallback={<div className="text-center">読み込み中...</div>}>
          <RsvpSection />
        </Suspense>
      </section>

      <SectionDivider variant="reverse" />

      <section
        id="access"
        className="py-16 md:py-24 bg-gradient-to-r from-orange-50 to-yellow-50"
      >
        <Access />
      </section>

      <SectionDivider />

      <section id="gallery" className="py-16 md:py-24">
        <Gallery />
      </section>

      <Footer />
    </main>
  );
}

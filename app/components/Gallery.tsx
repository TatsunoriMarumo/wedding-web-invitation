"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../providers";
import Image from "next/image";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function Gallery() {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const galleryImages = t("gallery.images").map(
    (alt: string, index: number) => ({
      id: index + 1,
      src: `/placeholder.svg?height=${index % 2 === 0 ? 400 : 600}&width=${
        index % 2 === 0 ? 600 : 400
      }`,
      alt,
    })
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          navigateImage("prev");
          break;
        case "ArrowRight":
          navigateImage("next");
          break;
      }
    };

    if (selectedImage) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedImage]);

  const openLightbox = (imageId: number) => {
    setSelectedImage(imageId);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImage === null) return;

    const currentIndex = galleryImages.findIndex(
      (img) => img.id === selectedImage
    );
    let newIndex;

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : galleryImages.length - 1;
    } else {
      newIndex = currentIndex < galleryImages.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedImage(galleryImages[newIndex].id);
  };

  const handleTouchStart = useRef<number>(0);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!selectedImage) return;

    const touchEnd = e.changedTouches[0].clientX;
    const touchStart = handleTouchStart.current;

    if (touchStart - touchEnd > 50) {
      navigateImage("next");
    }

    if (touchEnd - touchStart > 50) {
      navigateImage("prev");
    }
  };

  const selectedImageData = galleryImages.find(
    (img) => img.id === selectedImage
  );

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
          {t("gallery.title")}
        </h2>
        <p className="text-lg text-gray-600 mb-6">{t("gallery.subtitle")}</p>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-orange-400 mx-auto rounded-full" />
      </div>

      {isMobile ? (
        // モバイル用横スクロールギャラリー
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {galleryImages.map((image) => (
              <div
                key={image.id}
                className="flex-shrink-0 w-72 cursor-pointer group"
                style={{ scrollSnapAlign: "start" }}
                onClick={() => openLightbox(image.id)}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    width={288}
                    height={400}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🔍</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2 px-2">
                  {image.alt}
                </p>
              </div>
            ))}
          </div>

          {/* スクロールインジケーター */}
          <div className="flex justify-center mt-6 space-x-2">
            {galleryImages.map((_, index) => (
              <div key={index} className="w-2 h-2 rounded-full bg-gray-300" />
            ))}
          </div>
        </div>
      ) : (
        // デスクトップ用Masonryグリッド
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="break-inside-avoid cursor-pointer group"
              onClick={() => openLightbox(image.id)}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  width={400}
                  height={600}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🔍</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && selectedImageData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          style={{
            backdropFilter: "blur(20px)",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
          }}
          onTouchStart={(e) =>
            (handleTouchStart.current = e.touches[0].clientX)
          }
          onTouchEnd={handleTouchMove}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
        >
          <div className="relative max-w-4xl max-h-full animate-in zoom-in-95 duration-300">
            {/* 閉じるボタン */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
              aria-label={t("gallery.lightbox.close")}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* 前の画像ボタン */}
            <button
              onClick={() => navigateImage("prev")}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
              aria-label={t("gallery.lightbox.prev")}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>

            {/* 次の画像ボタン */}
            <button
              onClick={() => navigateImage("next")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
              aria-label={t("gallery.lightbox.next")}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>

            {/* 画像 */}
            <div className="relative">
              <Image
                src={selectedImageData.src || "/placeholder.svg"}
                alt={selectedImageData.alt}
                width={800}
                height={600}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                priority
              />
            </div>

            {/* 画像情報 */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p
                id="lightbox-title"
                className="text-white text-lg font-medium bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 inline-block"
              >
                {selectedImageData.alt}
              </p>
              <div className="mt-2 text-white/70 text-sm">
                {galleryImages.findIndex((img) => img.id === selectedImage) + 1}{" "}
                / {galleryImages.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

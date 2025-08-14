"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "../providers";
import Image from "next/image";
import ImageModal from "./ImageModal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export default function Gallery() {
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);

  const files = [
    "airbnb_pizza.png",
    "clam_chowder.png",
    "dennys.png",
    "donut.png",
    "graduation.png",
    "gum_wall.png",
    "hamburger.png",
    "look2.png",
    "public_market.png",
    "rachel.png",
    "starbucks.png",
    "washinton_uni.png",
  ]

  const altList =
  (t("gallery.images", { returnObjects: true }) as string[] | undefined) ?? [];


  const galleryImages = useMemo(
  () =>
    files.map((file, index) => ({
      id: index + 1,
      src: `/images/honeymoon/${file}`,           // ← ここが実ファイルのパス
      alt: altList[index] ?? `写真 ${index + 1}`,  // ← フォールバックあり
      title: altList[index] ?? `写真 ${index + 1}`,
    })),
  [t] // 言語切替でaltが更新されるように
);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const setCurrentSafely = useCallback((idx: number) => {
    currentRef.current = idx;
    setCurrent(idx);
  }, []);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => setCurrentSafely(api.selectedScrollSnap());
    const handleInit = () => handleSelect();

    handleInit();
    api.on("select", handleSelect);
    api.on("reInit", handleInit);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleInit);
    };
  }, [api, setCurrentSafely]);

  const safeScrollNext = useCallback(() => {
    if (!api) return;
    const next = currentRef.current + 1;
    if (next < galleryImages.length) api.scrollTo(next);
  }, [api, galleryImages.length]);

  const safeScrollPrev = useCallback(() => {
    if (!api) return;
    const prev = currentRef.current - 1;
    if (prev >= 0) api.scrollTo(prev);
  }, [api]);

  const disablePrev = current === 0;
  const disableNext = current === galleryImages.length - 1;

  const dots = useMemo(
    () =>
      galleryImages.map((_, i) => (
        <button
          key={i}
          aria-label={`画像 ${i + 1} に移動`}
          onClick={() => api?.scrollTo(i)}
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            i === current ? "bg-pink-400" : "bg-gray-300 hover:bg-gray-400"
          )}
        />
      )),
    [galleryImages, api, current]
  );

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4 font-klee">
          {t("gallery.title")}
        </h2>
        <p className="text-lg text-gray-600 mb-6 font-klee">
          {t("gallery.subtitle")}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-orange-400 mx-auto rounded-full" />
      </div>

      {isMobile ? (
        <div className="relative">
          <div className="overflow-hidden">
            <Carousel
              className="w-full"
              setApi={setApi}
              opts={{
                align: "center",
                loop: false,
                skipSnaps: false,
                dragFree: false,
              }}
            >
              <CarouselContent className="-ml-2">
                {galleryImages.map((image, index) => {
                  // 最初と最後のアイテムには追加のパディングを適用
                  const isFirst = index === 0;
                  const isLast = index === galleryImages.length - 1;

                  return (
                    <CarouselItem
                      key={image.id}
                      className={cn(
                        "pl-2 pr-2 basis-4/5 flex justify-center",
                        // 最初のアイテムには左側に追加スペース
                        isFirst && "ml-[10%]",
                        // 最後のアイテムには右側に追加スペース
                        isLast && "mr-[10%]"
                      )}
                    >
                      <ImageModal
                        images={galleryImages}
                        currentIndex={index}
                        title={t("gallery.title")}
                      >
                        <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer w-full max-w-sm">
                          <Image
                            src={image.src || "/placeholder.svg"}
                            alt={image.alt}
                            width={320}
                            height={400}
                            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🔍</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-center text-sm text-gray-600 mt-2 px-2 font-klee">
                          {image.alt}
                        </p>
                      </ImageModal>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </div>

          <div className="flex justify-center mt-6 space-x-2">{dots}</div>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {galleryImages.map((image, index) => (
            <ImageModal
              key={image.id}
              images={galleryImages}
              currentIndex={index}
              title={t("gallery.title")}
            >
              <div className="break-inside-avoid cursor-pointer group">
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
            </ImageModal>
          ))}
        </div>
      )}
    </div>
  );
}

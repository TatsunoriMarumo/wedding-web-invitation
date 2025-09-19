"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ImageModalProps {
  images: Array<{ src: string; alt: string; title?: string }>;
  currentIndex: number;
  title: string;
  children: React.ReactNode;
}

export default function ImageModal({
  images,
  currentIndex,
  title,
  children,
}: ImageModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(currentIndex);
  const currentRef = useRef(currentIndex);
  const lastIndex = images.length - 1;

  const setCurrentSafely = useCallback((idx: number) => {
    currentRef.current = idx;
    setCurrent(idx);
  }, []);

  useEffect(() => {
    if (!api || !isOpen) return;

    const init = () => {
      api.scrollTo(currentIndex, true);
      setCurrentSafely(api.selectedScrollSnap());
    };

    init();

    const handleSelect = () => setCurrentSafely(api.selectedScrollSnap());

    api.on("select", handleSelect);
    api.on("reInit", init);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", init);
    };
  }, [api, currentIndex, setCurrentSafely, isOpen]);

  const safeScrollNext = useCallback(() => {
    if (!api) return;
    const next = currentRef.current + 1;
    if (next <= lastIndex) api.scrollTo(next);
  }, [api, lastIndex]);

  const safeScrollPrev = useCallback(() => {
    if (!api) return;
    const prev = currentRef.current - 1;
    if (prev >= 0) api.scrollTo(prev);
  }, [api]);

  const disablePrev = current === 0;
  const disableNext = current === lastIndex;

  const dots = useMemo(
    () =>
      images.map((_, i) => (
        <button
          key={i}
          aria-label={`画像 ${i + 1} に移動`}
          onMouseDown={(e) => {
            e.preventDefault();
            if (api && i !== currentRef.current) api.scrollTo(i);
          }}
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            i === current ? "bg-pink-400" : "bg-white/50 hover:bg-white/70"
          )}
        />
      )),
    [images, api, current]
  );

  const openModal = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeModal();
      }
    },
    [closeModal]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          safeScrollPrev();
          break;
        case "ArrowRight":
          safeScrollNext();
          break;
        case "Escape":
          closeModal();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, safeScrollPrev, safeScrollNext, closeModal]);

  const currentImageTitle =
    images[current]?.title || images[current]?.alt || `画像 ${current + 1}`;

  return (
    <>
      <div onClick={openModal} className="cursor-pointer">
        {children}
      </div>

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={handleBackgroundClick}
          >
            <button
              aria-label="モーダルを閉じる"
              onClick={closeModal}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70 hover:scale-110"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="sr-only">{title}</div>

            <div className="relative h-[calc(100vh-80px)] w-full max-w-screen px-4 sm:px-12 lg:px-20 mx-2 sm:mx-6 lg:mx-35">
              <Carousel className="h-full w-full touch-pan-x" setApi={setApi}>
                <CarouselContent>
                  {images.map((image, idx) => (
                    <CarouselItem key={idx}>
                      <div className="relative h-[calc(100vh-120px)] w-full px-2 sm:px-4">
                        <Image
                          src={image.src || "/placeholder.svg"}
                          alt={image.alt}
                          fill
                          className="select-none object-contain rounded-lg"
                          priority={idx === currentIndex}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {images.length > 1 && (
                <>
                  <button
                    aria-label="前の画像"
                    onClick={safeScrollPrev}
                    disabled={disablePrev}
                    className={cn(
                      "absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70 hover:scale-110",
                      disablePrev && "cursor-default opacity-50"
                    )}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    aria-label="次の画像"
                    onClick={safeScrollNext}
                    disabled={disableNext}
                    className={cn(
                      "absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70 hover:scale-110",
                      disableNext && "cursor-default opacity-50"
                    )}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex justify-center space-x-2">
                {dots}
              </div>
            )}

            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center">
              <p className="text-white text-sm bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 inline-block whitespace-pre-line">
                {currentImageTitle}
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

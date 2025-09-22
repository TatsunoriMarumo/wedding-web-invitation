// app/components/thank-you/ThankYouImage.tsx
"use client";

import Image from "next/image";

export default function ThankYouImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1600}
      height={900}
      className="w-full h-auto object-cover"
      priority
    />
  );
}

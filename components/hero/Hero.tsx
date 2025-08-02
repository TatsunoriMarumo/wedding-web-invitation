// components/hero/Hero.tsx
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Playfair_Display } from "next/font/google"

const playfair = Playfair_Display({
    weight: ["400", "700"],
    subsets: ["latin"],
})

const photos = [
    "/images/banpaku.JPG",
    "/images/roses.JPG",
    "/images/sit.JPG",
]

export default function Hero() {
    const [index, setIndex] = useState(0)

  // 5 秒ごとに画像を切り替え
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((i) => (i + 1) % photos.length)
        }, 7000)
        return () => clearInterval(timer)
    }, [])

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* ===== ブラー背景画像 ===== */}
        <Image
            src={photos[index]}
            alt="Background blurred"
            fill
            priority
            className="object-cover blur-lg brightness-75 transition-opacity duration-700"
        />

        {/* ===== 中央の写真スライド ===== */}
        <div className="relative z-10 h-[22rem] w-[22rem] max-w-[90vw] rounded-3xl shadow-2xl overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
            <motion.div
                key={photos[index]}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
            >
                <Image
                src={photos[index]}
                alt="Couple photo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80vw, 22rem"
                />
            </motion.div>
            </AnimatePresence>
        </div>

        {/* ===== テキスト ===== */}
        <motion.div
            className={`absolute z-20 text-center text-white drop-shadow-xl ${playfair.className}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
        >
            <p className="text-sm tracking-widest uppercase mb-2">Wedding Invitation</p>
            <h1 className="text-4xl font-bold mb-1">Takuto &amp; Hinano</h1>
            <p className="text-lg">2025.12.13&nbsp; Sat</p>
        </motion.div>
        </section>
    )
}

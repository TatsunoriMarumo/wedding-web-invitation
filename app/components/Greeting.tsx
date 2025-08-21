// app/(適宜)/components/Greeting.tsx
"use client";

import { useLanguage } from "../providers";

export default function Greeting() {
    const { t } = useLanguage();

    return (
    <div className="container mx-auto px-4">
        <p className="max-w-3xl mx-auto text-center text-gray-700 text-base md:text-lg leading-relaxed">
            {t("hero.greeting") as string}
        </p>
    </div>
    );
}

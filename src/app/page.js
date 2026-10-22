"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, LayoutDashboard } from "lucide-react";

const showcaseImages = [
  "/images/login-showcase.jpg",
  "/images/login-showcase-2.jpg",
  "/images/login-showcase-3.jpg",
];

export default function HomePage() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const isRTL = lang === "ar";
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance image slide every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % showcaseImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative isolate overflow-hidden min-h-[calc(100vh-5rem)] flex items-center">
      {/* Background glow decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#2563EB]/15 to-[#3B82F6]/20 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-[1400px] w-full px-6 sm:px-8 lg:px-12 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
          {/* Text Column (جهة كاملة للكلام) */}
          <div className="w-full flex flex-col justify-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] dark:bg-[#18181B] border border-[#BFDBFE] dark:border-[#27272A] px-3.5 py-1 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] dark:bg-[#3B82F6]" />
              <span>{t("landing.badge")}</span>
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-[#09090B] dark:text-[#F4F4F5] leading-[1.15]">
              {t("landing.heroTitlePrefix")} <span className="text-[#2563EB] dark:text-[#60A5FA]">TaskFlow</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#64748B] dark:text-[#A1A1AA]">
              {t("landing.heroSubtitle")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] px-7 py-3.5 text-base font-bold text-white shadow-xs transition"
                >
                  <LayoutDashboard className="h-5 w-5" /> {t("nav.dashboard")}
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] px-7 py-3.5 text-base font-bold text-white shadow-xs transition"
                  >
                    {t("auth.createAccountLink")} <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#09090B] px-7 py-3.5 text-base font-bold text-[#09090B] dark:text-[#F4F4F5] shadow-xs hover:bg-[#F1F3F5] dark:hover:bg-[#27272A] transition"
                  >
                    {t("auth.signInBtn")}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Images Column (جهة ثانية كاملة للصور) */}
          <div className="w-full flex items-center justify-center">
            <div className="relative w-full rounded-3xl overflow-hidden border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-2.5 sm:p-3.5 shadow-2xl">
              {/* Image Container with Smooth Fade Transition */}
              <div className="relative h-72 sm:h-96 lg:h-[460px] xl:h-[500px] w-full rounded-2xl overflow-hidden bg-[#121714]">
                {showcaseImages.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    alt={`TaskFlow Preview ${idx + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={idx === 0}
                    className={`object-cover object-center transition-all duration-700 ease-in-out ${
                      idx === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-103 pointer-events-none"
                    }`}
                  />
                ))}
              </div>

              {/* Clickable Indicator Dots */}
              <div className="flex items-center justify-center gap-2.5 py-3">
                {showcaseImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Show image ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeIndex
                        ? "w-8 bg-[#2563EB] dark:bg-[#3B82F6]"
                        : "w-2.5 bg-[#CBD5E1] dark:bg-[#27272A] hover:bg-[#94A3B8] dark:hover:bg-[#3F3F46]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function TaskFlowLogo({
  showTagline = false,
  hideTextOnMobile = false,
  className = "",
  size = "md",
}) {
  const { t } = useLanguage();
  const isSmall = size === "sm";

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 sm:gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] dark:focus-visible:ring-[#3B82F6] rounded-xl transition group shrink-0 ${className}`}
      aria-label="TaskFlow Home"
    >
      {/* Brand Icon: Tech Blue emblem with crisp white checkmark */}
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] border border-[#1D4ED8] dark:border-[#2563EB] shadow-xs ${
          isSmall ? "h-8 w-8" : "h-9 w-9"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4.5 w-4.5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Brand Name: TaskFlow */}
      <div className={`flex flex-col ${hideTextOnMobile ? "hidden sm:flex" : "flex"}`}>
        <span
          className={`font-black tracking-tight text-[#09090B] dark:text-[#F4F4F5] leading-none whitespace-nowrap ${
            isSmall ? "text-base" : "text-lg"
          }`}
        >
          Task<span className="text-[#2563EB] dark:text-[#60A5FA]">Flow</span>
        </span>
        {showTagline && (
          <span className="text-[10px] font-medium tracking-wide text-[#64748B] dark:text-[#A1A1AA] mt-0.5 whitespace-nowrap">
            {t("nav.tagline")}
          </span>
        )}
      </div>
    </Link>
  );
}

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
      className={`inline-flex items-center gap-2 sm:gap-2.5 focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-xl transition group shrink-0 ${className}`}
      aria-label="TaskFlow Home"
    >
      {/* Brand Icon: Forest Green emblem with crisp white checkmark */}
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-xl bg-[#166534] border border-[#14532D] shadow-xs ${
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
          className={`font-black tracking-tight text-[#26332B] dark:text-[#FAF9F6] leading-none whitespace-nowrap ${
            isSmall ? "text-base" : "text-lg"
          }`}
        >
          Task<span className="text-[#166534] dark:text-[#86A789]">Flow</span>
        </span>
        {showTagline && (
          <span className="text-[10px] font-medium tracking-wide text-[#5E7164] dark:text-[#8EA393] mt-0.5 whitespace-nowrap">
            {t("nav.tagline")}
          </span>
        )}
      </div>
    </Link>
  );
}

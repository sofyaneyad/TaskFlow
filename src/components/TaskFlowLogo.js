"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function TaskFlowLogo({ showTagline = false, className = "", size = "md" }) {
  const { t } = useLanguage();
  const isSmall = size === "sm";

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl transition group ${className}`}
      aria-label="TaskFlow Home"
    >
      {/* Brand Icon: Rounded box with bright blue checkmark */}
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-xl bg-slate-900 dark:bg-[#1E1E26] border border-slate-700 dark:border-[#2F2F3B] shadow-sm ${
          isSmall ? "h-8 w-8" : "h-9 w-9"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-blue-500"
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
      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight text-slate-900 dark:text-white leading-none ${
            isSmall ? "text-base" : "text-lg"
          }`}
        >
          Task<span className="text-blue-600 dark:text-blue-500">Flow</span>
        </span>
        {showTagline && (
          <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-400 mt-0.5">
            {t("nav.tagline")}
          </span>
        )}
      </div>
    </Link>
  );
}

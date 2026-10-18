"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function TaskFlowLogo({ showTagline = true, className = "", size = "md" }) {
  const { t } = useLanguage();

  const isSmall = size === "sm";

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] rounded-xl transition ${className}`}
      aria-label="TaskFlow Home"
    >
      {/* Exact 3-Layer Brand Mark from Design System */}
      <div className={`relative flex items-center justify-center shrink-0 ${isSmall ? "h-8 w-8" : "h-10 w-10"}`}>
        <svg
          viewBox="0 0 40 40"
          className="h-full w-full drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Bar */}
          <rect
            x="6"
            y="7"
            width="22"
            height="5.5"
            rx="2.75"
            fill="url(#logo_grad_1)"
            transform="skewX(-15)"
          />
          {/* Middle Bar */}
          <rect
            x="8"
            y="17"
            width="28"
            height="5.5"
            rx="2.75"
            fill="url(#logo_grad_2)"
            transform="skewX(-15)"
          />
          {/* Bottom Bar */}
          <rect
            x="4"
            y="27"
            width="20"
            height="5.5"
            rx="2.75"
            fill="url(#logo_grad_3)"
            transform="skewX(-15)"
          />
          <defs>
            <linearGradient id="logo_grad_1" x1="6" y1="7" x2="28" y2="12.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="logo_grad_2" x1="8" y1="17" x2="36" y2="22.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#3730A3" />
            </linearGradient>
            <linearGradient id="logo_grad_3" x1="4" y1="27" x2="24" y2="32.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818CF8" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight text-[#0F172A] leading-none ${
            isSmall ? "text-lg" : "text-xl"
          }`}
        >
          TaskFlow
        </span>
        {showTagline && (
          <span className="text-[10px] font-medium tracking-wide text-[#64748B] mt-0.5">
            {t("nav.tagline")}
          </span>
        )}
      </div>
    </Link>
  );
}

"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, isMounted } = useTheme();
  const { lang } = useLanguage();

  if (!isMounted) {
    return (
      <div className="h-9 w-9 rounded-xl border border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] opacity-0" />
    );
  }

  const isDark = theme === "dark";
  const title = isDark
    ? lang === "ar"
      ? "التبديل إلى الوضع الفاتح"
      : "Switch to Light Mode"
    : lang === "ar"
    ? "التبديل إلى الوضع الداكن"
    : "Switch to Dark Mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={title}
      aria-label={title}
      className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#059669] dark:focus:ring-[#00D084] shadow-xs shrink-0 ${
        isDark
          ? "border-[#133020] bg-[#0B1F14] text-[#F59E0B] hover:bg-[#133020] hover:text-[#FBBF24]"
          : "border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] hover:bg-[#F1F5F9] hover:text-[#059669]"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="h-4 w-4 animate-in spin-in-180 duration-300 text-[#059669]" />
      )}
    </button>
  );
}

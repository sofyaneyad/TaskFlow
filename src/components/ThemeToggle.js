"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, isMounted } = useTheme();
  const { lang } = useLanguage();

  if (!isMounted) {
    return (
      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] opacity-0" />
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

  const handleClick = (e) => {
    toggleTheme();
    // Blur button after click to prevent the focus ring from staying stuck
    if (e?.currentTarget) {
      e.currentTarget.blur();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={title}
      aria-label={title}
      className={`group relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border transition-all duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] dark:focus-visible:ring-[#3B82F6] shadow-xs shrink-0 cursor-pointer ${
        isDark
          ? "border-[#27272A] bg-[#141416] text-[#FBBF24] hover:bg-[#1F1F23]"
          : "border-[#E4E4E7] bg-[#FFFFFF] text-[#2563EB] hover:bg-[#F1F3F5]"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[#FBBF24] transition-transform duration-300 ease-out group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-[#2563EB] transition-transform duration-300 ease-out group-hover:-rotate-12" />
      )}
    </button>
  );
}

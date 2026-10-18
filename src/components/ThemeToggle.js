"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, isMounted } = useTheme();
  const { lang } = useLanguage();

  if (!isMounted) {
    return (
      <div className="h-9 w-9 rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] opacity-0" />
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
      className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#166534] shadow-2xs ${
        isDark
          ? "border-[#26372D] bg-[#17221C] text-amber-400 hover:bg-[#1F2E26] hover:text-amber-300"
          : "border-[#E5EBE5] bg-[#FFFFFF] text-[#26332B] hover:bg-[#FAF9F6] hover:text-[#166534]"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="h-4 w-4 animate-in spin-in-180 duration-300 text-[#166534]" />
      )}
    </button>
  );
}

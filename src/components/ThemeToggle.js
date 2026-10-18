"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, isMounted } = useTheme();
  const { lang } = useLanguage();

  if (!isMounted) {
    return (
      <div className="h-9 w-9 rounded-xl border border-slate-200 dark:border-[#272732] bg-white dark:bg-[#16161B] opacity-0" />
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
      className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs ${
        isDark
          ? "border-[#2A2A36] bg-[#16161B] text-amber-400 hover:bg-[#202028] hover:text-amber-300"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="h-4 w-4 animate-in spin-in-180 duration-300 text-blue-600" />
      )}
    </button>
  );
}

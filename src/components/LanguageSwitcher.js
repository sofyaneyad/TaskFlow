"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronDown } from "lucide-react";

export default function LanguageSwitcher() {
  const { lang, setLang, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] px-2 py-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] hover:bg-[#F1F3F5] dark:hover:bg-[#27272A] focus:outline-none transition shadow-xs shrink-0 whitespace-nowrap"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select Language"
      >
        <span className="text-sm shrink-0">{currentLang.flag}</span>
        <span className="hidden sm:inline-block font-medium shrink-0">{currentLang.name}</span>
        <ChevronDown className={`h-3 w-3 text-[#64748B] dark:text-[#A1A1AA] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1.5 w-38 rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLang(item.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition text-left rtl:text-right ${
                lang === item.code
                  ? "bg-[#EFF6FF] dark:bg-[#18181B] text-[#2563EB] dark:text-[#60A5FA] font-bold"
                  : "text-[#09090B] dark:text-[#F4F4F5] hover:bg-[#F1F3F5] dark:hover:bg-[#27272A]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{item.flag}</span>
                <span>{item.name}</span>
              </div>
              {lang === item.code && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] dark:bg-[#3B82F6]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

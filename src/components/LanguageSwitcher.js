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
        className="flex items-center gap-1.5 rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] px-2.5 py-1.5 text-xs font-semibold text-[#26332B] dark:text-[#FAF9F6] hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26] focus:outline-none transition shadow-2xs"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select Language"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="hidden sm:inline-block font-medium">{currentLang.name}</span>
        <ChevronDown className="h-3 w-3 text-[#5E7164] dark:text-[#8EA393]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1.5 w-38 rounded-2xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md">
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
                  ? "bg-[#E8EFE9] dark:bg-[#1E2E24] text-[#166534] dark:text-[#86A789] font-bold"
                  : "text-[#26332B] dark:text-[#FAF9F6] hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{item.flag}</span>
                <span>{item.name}</span>
              </div>
              {lang === item.code && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#166534] dark:bg-[#86A789]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

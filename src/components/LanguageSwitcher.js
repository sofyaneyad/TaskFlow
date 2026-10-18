"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Globe, ChevronDown } from "lucide-react";

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
        className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] focus:outline-none transition shadow-2xs"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select Language"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="hidden sm:inline-block">{currentLang.name}</span>
        <ChevronDown className="h-3 w-3 text-[#64748B]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1.5 w-36 rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLang(item.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition text-left rtl:text-right ${
                lang === item.code
                  ? "bg-[#EEF2FF] text-[#4F46E5] font-bold"
                  : "text-[#0F172A] hover:bg-[#F1F5F9]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{item.flag}</span>
                <span>{item.name}</span>
              </div>
              {lang === item.code && <span className="h-1.5 w-1.5 rounded-full bg-[#4F46E5]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

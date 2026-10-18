"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { translations } from "@/i18n/translations";

const LanguageContext = createContext({
  lang: "ar",
  dir: "rtl",
  setLang: () => {},
  t: (key) => key,
  languages: [],
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("ar");

  useEffect(() => {
    // Check saved preference or default to Arabic
    const saved = localStorage.getItem("taskflow_lang");
    if (saved && translations[saved]) {
      setLangState(saved);
    } else {
      setLangState("ar");
    }
  }, []);

  const setLang = (newLang) => {
    if (!translations[newLang]) return;
    setLangState(newLang);
    try {
      localStorage.setItem("taskflow_lang", newLang);
    } catch {}
  };

  const currentDict = useMemo(() => {
    return translations[lang] || translations.en;
  }, [lang]);

  const dir = currentDict.dir || "ltr";

  useEffect(() => {
    // Dynamically adjust HTML dir and lang attributes for full RTL/LTR support
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("dir", dir);
      document.documentElement.setAttribute("lang", lang);
    }
  }, [dir, lang]);

  // Dot-notation translation resolver e.g. t('nav.dashboard')
  const t = (path) => {
    const keys = path.split(".");
    let val = currentDict;
    for (const k of keys) {
      if (val && typeof val === "object" && k in val) {
        val = val[k];
      } else {
        // Fallback to English dictionary
        let fallback = translations.en;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === "object" && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            return path;
          }
        }
        return fallback;
      }
    }
    return val || path;
  };

  const languages = useMemo(() => {
    return Object.entries(translations).map(([code, data]) => ({
      code,
      name: data.name,
      flag: data.flag,
      dir: data.dir,
    }));
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
  isMounted: false,
});

export function ThemeProvider({ children }) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("taskflow_theme");
        if (saved === "light" || saved === "dark") return saved;
      } catch {}
    }
    return "dark";
  });

  const applyTheme = (t) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("taskflow_theme", newTheme);
    } catch {}
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isMounted: mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

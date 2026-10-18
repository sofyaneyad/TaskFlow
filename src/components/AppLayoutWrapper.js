"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function AppLayoutWrapper({ children }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isUserLoggedIn = mounted && Boolean(user);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#0E1512] text-[#26332B] dark:text-[#FAF9F6] transition-colors">
      {/* 1. Sidebar (Visible only when logged in) */}
      {isUserLoggedIn && (
        <Suspense fallback={null}>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </Suspense>
      )}

      {/* 2. Top Bar */}
      <Suspense fallback={<div className="h-14 w-full bg-[#FFFFFF] dark:bg-[#17221C] border-b border-[#E5EBE5] dark:border-[#26372D]" />}>
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isLoggedIn={isUserLoggedIn}
        />
      </Suspense>

      {/* 3. Main Content Area */}
      <main
        className={`flex-1 transition-all duration-200 ${
          isUserLoggedIn ? "lg:pl-60 rtl:lg:pl-0 rtl:lg:pr-60" : ""
        }`}
      >
        {children}
      </main>

      {/* 4. Minimal Footer */}
      <footer
        className={`border-t border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] py-3 text-center text-xs text-[#5E7164] dark:text-[#8EA393] transition-colors ${
          isUserLoggedIn ? "lg:pl-60 rtl:lg:pl-0 rtl:lg:pr-60" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-center text-[11px] font-medium">
          <span>{t("common.footerTagline") || "Modern Task & Project Management"}</span>
        </div>
      </footer>
    </div>
  );
}

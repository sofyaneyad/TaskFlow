"use client";

import { useState, Suspense, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

const emptySubscribe = () => () => {};

function AppLayoutContent({ children }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname() || "";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const isUserLoggedIn = mounted && Boolean(user);
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLandingPage = pathname === "/";
  // Sidebar and offset padding should only exist on internal workspace routes
  const isWorkspaceRoute = isUserLoggedIn && !isAuthPage && !isLandingPage;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-[#09090B] text-[#09090B] dark:text-[#F4F4F5] transition-colors">
      {/* 1. Sidebar (Visible only on internal workspace routes when logged in) */}
      {isWorkspaceRoute && (
        <Suspense fallback={null}>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </Suspense>
      )}

      {/* 2. Top Bar */}
      <Suspense fallback={<div className="h-14 w-full bg-[#FFFFFF] dark:bg-[#09090B] border-b border-[#E4E4E7] dark:border-[#27272A]" />}>
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isLoggedIn={isUserLoggedIn}
          isWorkspaceRoute={isWorkspaceRoute}
        />
      </Suspense>

      {/* 3. Main Content Area */}
      <main
        className={`flex-1 transition-all duration-200 ${
          isWorkspaceRoute ? "lg:pl-60 rtl:lg:pl-0 rtl:lg:pr-60" : ""
        }`}
      >
        {children}
      </main>

      {/* 4. Minimal Footer */}
      <footer
        className={`border-t border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#0A0F0E] py-3 text-center text-xs text-[#64748B] dark:text-[#A1A1AA] transition-colors ${
          isWorkspaceRoute ? "lg:pl-60 rtl:lg:pl-0 rtl:lg:pr-60" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-center text-[11px] font-medium">
          <span>{t("common.footerTagline")}</span>
        </div>
      </footer>
    </div>
  );
}

export default function AppLayoutWrapper({ children }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-[#09090B] text-[#09090B] dark:text-[#F4F4F5]">
          <main className="flex-1">{children}</main>
        </div>
      }
    >
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  );
}

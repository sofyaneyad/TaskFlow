"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function AppLayoutWrapper({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0C0C0E] text-slate-900 dark:text-white transition-colors">
      {/* 1. Sidebar (Visible when logged in) */}
      {user && (
        <Suspense fallback={null}>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </Suspense>
      )}

      {/* 2. Top Bar */}
      <Suspense fallback={<div className="h-14 w-full bg-white dark:bg-[#101014] border-b border-slate-200 dark:border-[#22222B]" />}>
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isLoggedIn={Boolean(user)}
        />
      </Suspense>

      {/* 3. Main Content Area */}
      <main
        className={`flex-1 transition-all duration-200 ${
          user ? "lg:pl-60 rtl:lg:pl-0 rtl:lg:pr-60" : ""
        }`}
      >
        {children}
      </main>

      {/* 4. Minimal Footer */}
      <footer
        className={`border-t border-slate-200 dark:border-[#1E1E26] bg-white dark:bg-[#101014] py-3 text-center text-xs text-slate-500 dark:text-slate-500 transition-colors ${
          user ? "lg:pl-60 rtl:lg:pl-0 rtl:lg:pr-60" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <span>TaskFlow • Modern Task & Project Management</span>
          <span className="text-slate-400 dark:text-slate-600">Built with Next.js 16, React 19 & Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
}

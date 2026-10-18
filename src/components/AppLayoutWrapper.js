"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import PermissionsModal from "@/components/PermissionsModal";

export default function AppLayoutWrapper({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFAFC]">
      {/* 1. Sidebar (Visible when logged in) */}
      {user && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenPermissions={() => setPermissionsOpen(true)}
        />
      )}

      {/* 2. Top Header Bar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenPermissions={() => setPermissionsOpen(true)}
        isLoggedIn={Boolean(user)}
      />

      {/* 3. Main Page Content - Offset on desktop when logged in */}
      <main
        className={`flex-1 transition-all duration-200 ${
          user ? "lg:pl-64 rtl:lg:pl-0 rtl:lg:pr-64" : ""
        }`}
      >
        {children}
      </main>

      {/* 4. Global Permissions Reference Modal */}
      <PermissionsModal
        isOpen={permissionsOpen}
        onClose={() => setPermissionsOpen(false)}
      />

      {/* 5. Minimal Footer */}
      <footer
        className={`border-t border-[#E2E8F0] bg-white py-4 text-center text-xs text-[#64748B] transition-all ${
          user ? "lg:pl-64 rtl:lg:pl-0 rtl:lg:pr-64" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TaskFlow • Design System v1.0</span>
          <span className="text-[11px] text-[#94A3B8]">Plan • Collaborate • Achieve</span>
        </div>
      </footer>
    </div>
  );
}

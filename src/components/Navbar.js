"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  PlusCircle,
  ShieldCheck,
  LogOut,
  HelpCircle,
  X,
} from "lucide-react";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TaskFlowLogo from "@/components/TaskFlowLogo";

export default function Navbar({ onToggleSidebar, onOpenPermissions, isLoggedIn }) {
  const { user, userProfile, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const displayName =
    userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Ahmed Saleh";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className={`sticky top-0 z-20 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm transition-all duration-200 ${
        isLoggedIn ? "lg:pl-64 rtl:lg:pl-0 rtl:lg:pr-64" : ""
      }`}
    >
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Mobile Menu Button + Search Bar */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          {isLoggedIn ? (
            <>
              {/* Mobile hamburger button to open sidebar drawer */}
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden rounded-xl p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] focus:outline-none transition"
                aria-label="Toggle navigation drawer"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Mobile-only logo */}
              <div className="lg:hidden">
                <TaskFlowLogo showTagline={false} size="sm" />
              </div>

              {/* Search Bar - Exactly like the mockup */}
              <div className="relative flex-1 max-w-md hidden sm:block">
                <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder={t("nav.searchPlaceholder")}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F1F5F9]/60 py-2 pl-10 rtl:pl-4 rtl:pr-10 pr-4 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#4F46E5] focus:bg-white focus:outline-none transition shadow-2xs"
                />
              </div>
            </>
          ) : (
            <TaskFlowLogo showTagline={true} size="md" />
          )}
        </div>

        {/* Right Side Actions: Language, New Project, Notifications, Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Language Switcher Dropdown */}
          <LanguageSwitcher />

          {isLoggedIn ? (
            <>
              {/* New Project Quick Button */}
              <Link
                href="/projects/new"
                className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] px-3 py-1.5 text-xs font-bold transition shadow-2xs"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{t("nav.newProject")}</span>
              </Link>

              {/* Roles & Permissions quick guide */}
              {onOpenPermissions && (
                <button
                  type="button"
                  onClick={onOpenPermissions}
                  title="Roles & Permissions Guide"
                  className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition shadow-2xs"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#15803D]" />
                  <span className="text-[11px] font-bold">Roles</span>
                </button>
              )}

              {/* Notification Bell with Badge Dot */}
              <button
                type="button"
                onClick={() => setHasUnreadNotification(false)}
                className="relative rounded-xl border border-[#E2E8F0] bg-white p-2 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition shadow-2xs"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {hasUnreadNotification && (
                  <span className="absolute top-1.5 right-1.5 rtl:right-auto rtl:left-1.5 h-2 w-2 rounded-full bg-[#DC2626] ring-2 ring-white animate-pulse" />
                )}
              </button>

              <div className="h-5 w-px bg-[#E2E8F0] hidden sm:block" aria-hidden="true" />

              {/* User Avatar Circle with Menu - Mockup AS Circle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4F46E5] text-xs font-bold text-white shadow-xs ring-2 ring-white hover:ring-[#EEF2FF] transition focus:outline-none"
                  aria-label="User profile menu"
                >
                  {userInitials}
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-[#F1F5F9]">
                      <p className="text-xs font-bold text-[#0F172A] truncate">{displayName}</p>
                      <p className="text-[11px] text-[#64748B] truncate">{user?.email}</p>
                      <span className="badge-owner inline-flex items-center gap-1 rounded mt-1.5 px-1.5 py-0.2 text-[9px] font-bold">
                        <ShieldCheck className="h-2.5 w-2.5" /> Owner
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9] transition"
                      >
                        {t("nav.dashboard")}
                      </Link>
                      <Link
                        href="/projects/new"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9] transition"
                      >
                        {t("nav.newProject")}
                      </Link>
                    </div>

                    <div className="border-t border-[#F1F5F9] pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#DC2626] hover:bg-[#FEF2F2] transition text-left rtl:text-right"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>{t("nav.signOut")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#0F172A] hover:text-[#4F46E5] transition px-3 py-2 rounded-lg"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 text-xs font-bold text-white shadow-xs transition"
              >
                {t("nav.getStarted")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

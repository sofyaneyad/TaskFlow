"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
} from "lucide-react";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "User";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm shadow-2xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with exact TaskFlow Design Style */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-[#4F46E5] rounded-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#818CF8] text-white shadow-sm">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h12M4 18h8" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
                TaskFlow
              </span>
              <span className="text-[10px] font-medium tracking-wide text-[#64748B]">
                {t("nav.tagline")}
              </span>
            </div>
          </Link>

          {/* Quick Search Bar */}
          {user && (
            <div className="hidden lg:flex items-center relative w-64">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                placeholder={t("nav.searchPlaceholder")}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F1F5F9]/60 py-1.5 pl-8 rtl:pl-3 rtl:pr-8 pr-3 text-xs text-[#0F172A] placeholder-[#64748B] focus:border-[#4F46E5] focus:bg-white focus:outline-none transition"
              />
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4" aria-label="Main Navigation">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#4F46E5] transition rounded-lg px-2.5 py-1.5 hover:bg-[#F1F5F9]"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t("nav.dashboard")}
              </Link>
              <Link
                href="/projects/new"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] transition rounded-lg px-3 py-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                {t("nav.newProject")}
              </Link>

              {/* Notification icon */}
              <button
                type="button"
                className="relative rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 rtl:right-auto rtl:left-1.5 h-2 w-2 rounded-full bg-[#EF4444]" />
              </button>

              <div className="h-5 w-px bg-[#E2E8F0]" aria-hidden="true" />

              {/* User Avatar Circle */}
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4F46E5] text-xs font-bold text-white shadow-xs"
                  title={displayName}
                >
                  {userInitials}
                </div>
                <div className="hidden xl:flex flex-col text-left rtl:text-right">
                  <span className="text-xs font-bold text-[#0F172A] max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-[#64748B] max-w-[120px] truncate">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-[#FECACA] transition"
                aria-label="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t("nav.signOut")}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#0F172A] hover:text-[#4F46E5] transition px-3 py-2 rounded-lg"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 text-xs font-semibold text-white shadow-sm focus:outline-none transition"
              >
                {t("nav.getStarted")}
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button & Language */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E2E8F0] bg-white px-4 pt-3 pb-5 space-y-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F46E5] text-xs font-bold text-white">
                  {userInitials}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">{displayName}</p>
                  <p className="text-[11px] text-[#64748B]">{user.email}</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-xs font-semibold text-[#0F172A] hover:text-[#4F46E5]"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t("nav.dashboard")}
              </Link>
              <Link
                href="/projects/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-xs font-semibold text-[#0F172A] hover:text-[#4F46E5]"
              >
                <PlusCircle className="h-4 w-4" />
                {t("nav.newProject")}
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 mt-2 rounded-lg bg-[#FEF2F2] py-2 text-xs font-semibold text-[#DC2626] hover:bg-rose-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t("nav.signOut")}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-[#0F172A] border border-[#E2E8F0] rounded-lg"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-white bg-[#4F46E5] rounded-lg"
              >
                {t("nav.getStarted")}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  Share2,
  LayoutDashboard,
  Plus,
  LogOut,
  FolderPlus,
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import TaskFlowLogo from "@/components/TaskFlowLogo";

export default function Navbar({ onToggleSidebar, isLoggedIn }) {
  const { user, userProfile, logout } = useAuth();
  const { lang, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const displayName =
    userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Saif";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isRTL = lang === "ar";

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "UrTask - Project & Task Management",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert(isRTL ? "تم نسخ الرابط بنجاح!" : "Link copied to clipboard!");
    }
  };

  return (
    <header
      className={`sticky top-0 z-20 w-full border-b border-slate-200 dark:border-[#22222B] bg-white/90 dark:bg-[#101014]/90 backdrop-blur-md transition-colors ${
        isLoggedIn ? "lg:pl-60 rtl:lg:pl-0 rtl:lg:pr-60" : ""
      }`}
    >
      <div className="mx-auto flex h-14 w-full items-center justify-between px-4 sm:px-6">
        {/* Left Side: Mobile toggle or Breadcrumb Title */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* Mobile hamburger button */}
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden rounded-xl p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E1E26] focus:outline-none"
                aria-label="Toggle navigation drawer"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Mobile logo */}
              <div className="lg:hidden">
                <TaskFlowLogo size="sm" />
              </div>

              {/* Desktop breadcrumb - Matching Mockup: [Icon] Dashboard */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <LayoutDashboard className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <span>{pathname.includes("/projects/") ? t("dashboard.myProjects") : t("nav.dashboard")}</span>
              </div>
            </>
          ) : (
            <TaskFlowLogo size="md" />
          )}
        </div>

        {/* Right Side Actions - Matching Mockup */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isLoggedIn && (
            <>
              {/* Last Updated + Team Avatars (from mockup) */}
              <div className="hidden md:flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-[#8E8E9F] mr-1 rtl:mr-0 rtl:ml-1">
                <span>{isRTL ? "آخر تحديث: 18 أغسطس 2025" : "Last Updated 18 Aug 2025"}</span>
                <div className="flex -space-x-1.5 rtl:space-x-reverse">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#101014]">
                    JD
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#101014]">
                    FA
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#101014]">
                    MK
                  </span>
                </div>
              </div>

              {/* Share button - from mockup */}
              <button
                type="button"
                onClick={handleShare}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#2A2A38] bg-white dark:bg-[#16161C] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#202028] transition shadow-2xs"
              >
                <Share2 className="h-3.5 w-3.5 text-slate-400" />
                <span>{isRTL ? "مشاركة" : "Share"}</span>
              </button>
            </>
          )}

          {/* Theme Toggle (Dark / Light) */}
          <ThemeToggle />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Authentication State Buttons */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/projects/new"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-bold transition shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("dashboard.newProject")}</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-500 transition px-2.5 py-1.5"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition"
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

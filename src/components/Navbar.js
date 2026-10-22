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
  const pathname = usePathname() || "";

  const displayName =
    userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || t("common.user");
  const photoURL = user?.photoURL || userProfile?.photoURL;
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isRTL = lang === "ar";
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLandingPage = pathname === "/";
  const userLoggedIn = isLoggedIn && !isAuthPage;
  const hasSidebar = userLoggedIn && !isLandingPage;

  return (
    <header
      className={`sticky top-0 z-20 w-full border-b border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF]/95 dark:bg-[#09090B]/95 backdrop-blur-md transition-colors ${
        hasSidebar ? "lg:pl-60 rtl:lg:pl-0 rtl:lg:pr-60" : ""
      }`}
    >
      <div className="mx-auto flex h-14 w-full items-center justify-between px-3 sm:px-6 gap-2">
        {/* Left Side: Mobile toggle or Breadcrumb Title or Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {hasSidebar ? (
            <>
              {/* Mobile hamburger button */}
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden rounded-xl p-1.5 text-[#64748B] dark:text-[#A1A1AA] hover:bg-[#F1F3F5] dark:hover:bg-[#18181B] focus:outline-none shrink-0 cursor-pointer"
                aria-label="Toggle navigation drawer"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Mobile logo */}
              <div className="lg:hidden shrink-0">
                <TaskFlowLogo size="sm" hideTextOnMobile={true} />
              </div>

              {/* Desktop breadcrumb */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] truncate">
                <LayoutDashboard className="h-4 w-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                <span className="truncate">{pathname.includes("/projects/") ? t("dashboard.myProjects") : t("nav.dashboard")}</span>
              </div>
            </>
          ) : (
            <TaskFlowLogo size="md" hideTextOnMobile={true} />
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {userLoggedIn && (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-bold transition shadow-xs whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{t("dashboard.newProject")}</span>
              </Link>
              {photoURL ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full object-cover shadow-2xs shrink-0"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white shadow-2xs shrink-0">
                  {userInitials}
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle (Dark / Light) */}
          <div className="shrink-0">
            <ThemeToggle />
          </div>

          {/* Language Switcher */}
          <div className="shrink-0">
            <LanguageSwitcher />
          </div>

          {/* Non-logged in action links */}
          {!userLoggedIn && (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] hover:text-[#2563EB] dark:hover:text-[#93C5FD] transition px-2 py-1.5 sm:px-2.5 whitespace-nowrap shrink-0"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 text-xs font-bold shadow-xs transition whitespace-nowrap shrink-0"
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

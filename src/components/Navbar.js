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
    userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "User";
  const photoURL = user?.photoURL || userProfile?.photoURL;
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isRTL = lang === "ar";
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const userLoggedIn = isLoggedIn && !isAuthPage;

  return (
    <header
      className={`sticky top-0 z-20 w-full border-b border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF]/95 dark:bg-[#17221C]/95 backdrop-blur-md transition-colors ${
        userLoggedIn ? "lg:pl-60 rtl:lg:pl-0 rtl:lg:pr-60" : ""
      }`}
    >
      <div className="mx-auto flex h-14 w-full items-center justify-between px-3 sm:px-6 gap-2">
        {/* Left Side: Mobile toggle or Breadcrumb Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {userLoggedIn ? (
            <>
              {/* Mobile hamburger button */}
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden rounded-xl p-1.5 text-[#5E7164] dark:text-[#8EA393] hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26] focus:outline-none shrink-0"
                aria-label="Toggle navigation drawer"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Mobile logo */}
              <div className="lg:hidden shrink-0">
                <TaskFlowLogo size="sm" hideTextOnMobile={true} />
              </div>

              {/* Desktop breadcrumb */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-[#26332B] dark:text-[#FAF9F6] truncate">
                <LayoutDashboard className="h-4 w-4 text-[#86A789] shrink-0" />
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-bold transition shadow-xs whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{t("dashboard.newProject")}</span>
              </Link>
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-[#C8DAC9] dark:ring-[#26372D] shadow-2xs shrink-0"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#166534] text-xs font-bold text-white ring-1 ring-[#C8DAC9] dark:ring-[#26372D] shrink-0">
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
                className="text-xs font-semibold text-[#26332B] dark:text-[#FAF9F6] hover:text-[#166534] dark:hover:text-[#86A789] transition px-2 py-1.5 sm:px-2.5 whitespace-nowrap shrink-0"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[#166534] hover:bg-[#14532D] text-white px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 text-xs font-bold shadow-xs transition whitespace-nowrap shrink-0"
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

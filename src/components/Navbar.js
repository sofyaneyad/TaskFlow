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
      className={`sticky top-0 z-20 w-full border-b border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF]/95 dark:bg-[#07160D]/95 backdrop-blur-md transition-colors ${
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
                className="lg:hidden rounded-xl p-1.5 text-[#64748B] dark:text-[#7B9A89] hover:bg-[#F1F5F9] dark:hover:bg-[#0D2217] focus:outline-none shrink-0 cursor-pointer"
                aria-label="Toggle navigation drawer"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Mobile logo */}
              <div className="lg:hidden shrink-0">
                <TaskFlowLogo size="sm" hideTextOnMobile={true} />
              </div>

              {/* Desktop breadcrumb */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-[#0F172A] dark:text-[#FFFFFF] truncate">
                <LayoutDashboard className="h-4 w-4 text-[#059669] dark:text-[#00D084] shrink-0" />
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] dark:bg-[#00A86B] dark:hover:bg-[#00925D] text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-bold transition shadow-xs whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{t("dashboard.newProject")}</span>
              </Link>
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-[#CBD5E1] dark:ring-[#17432B] shadow-2xs shrink-0"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#059669] dark:bg-[#00A86B] text-xs font-bold text-white ring-1 ring-[#CBD5E1] dark:ring-[#17432B] shrink-0">
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
                className="text-xs font-semibold text-[#0F172A] dark:text-[#FFFFFF] hover:text-[#059669] dark:hover:text-[#00D084] transition px-2 py-1.5 sm:px-2.5 whitespace-nowrap shrink-0"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[#059669] hover:bg-[#047857] dark:bg-[#00A86B] dark:hover:bg-[#00925D] text-white px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 text-xs font-bold shadow-xs transition whitespace-nowrap shrink-0"
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

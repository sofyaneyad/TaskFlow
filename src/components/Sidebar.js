"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import TaskFlowLogo from "@/components/TaskFlowLogo";
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Settings,
  Search,
  Sparkles,
  LayoutTemplate,
  Bell,
  Inbox,
  BarChart2,
  HelpCircle,
  Crown,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, userProfile, logout } = useAuth();
  const { lang, t } = useLanguage();

  if (!user) return null;

  const displayName =
    userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Saif";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isRTL = lang === "ar";

  const featureItems = [
    {
      label: isRTL ? "مساعد الذكاء الاصطناعي" : "UrTask AI",
      icon: Sparkles,
      href: "/dashboard#ai",
    },
    {
      label: isRTL ? "القوالب الجاهزة" : "Templates",
      icon: LayoutTemplate,
      href: "/dashboard#templates",
    },
    {
      label: isRTL ? "الإشعارات" : "Notification",
      icon: Bell,
      href: "/dashboard#notifications",
    },
  ];

  const mainNavItems = [
    {
      label: t("nav.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: isRTL ? "صندوق الوارد" : "Inbox",
      href: "/dashboard#inbox",
      icon: Inbox,
      badge: "4",
      active: false,
    },
    {
      label: isRTL ? "المشاريع" : "Project",
      href: "/dashboard#projects",
      icon: FolderKanban,
      active: pathname.startsWith("/projects") && pathname !== "/projects/new",
    },
    {
      label: isRTL ? "التقويم" : "Calendar",
      href: "/dashboard#calendar",
      icon: Calendar,
      active: false,
    },
    {
      label: isRTL ? "التقارير" : "Reports",
      href: "/dashboard#reports",
      icon: BarChart2,
      active: false,
    },
    {
      label: isRTL ? "مركز المساعدة" : "Help & Center",
      href: "/dashboard#help",
      icon: HelpCircle,
      active: false,
    },
    {
      label: isRTL ? "الإعدادات" : "Settings",
      href: "/dashboard#settings",
      icon: Settings,
      active: false,
    },
  ];

  const sidebarBody = (
    <div className="flex h-full flex-col justify-between p-4 overflow-y-auto">
      {/* Top Header: Logo + User Avatar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#22222B]">
          <TaskFlowLogo size="sm" />
          <div className="flex items-center gap-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-1 ring-white dark:ring-[#2A2A36]">
              {userInitials}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search input with ⌘K badge */}
        <div className="relative">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={isRTL ? "بحث..." : "Search"}
            className="w-full rounded-xl border border-slate-200 dark:border-[#24242F] bg-slate-50 dark:bg-[#14141A] py-1.5 pl-8 pr-8 rtl:pr-8 rtl:pl-8 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
          />
          <span className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 rounded bg-slate-200 dark:bg-[#202028] px-1 py-0.5 text-[9px] font-mono font-semibold text-slate-500 dark:text-slate-400">
            ⌘K
          </span>
        </div>

        {/* Section 1: Features */}
        <div className="space-y-1 pt-1">
          {featureItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 dark:text-[#8E8E9F] hover:bg-slate-100 dark:hover:bg-[#181820] hover:text-slate-900 dark:hover:text-white transition group"
              >
                <Icon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Section 2: Main Navigation */}
        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-[#22222B]">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition group ${
                  item.active
                    ? "bg-slate-100 dark:bg-[#191922] text-blue-600 dark:text-white shadow-2xs font-bold"
                    : "text-slate-600 dark:text-[#8E8E9F] hover:bg-slate-50 dark:hover:bg-[#15151C] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {/* Active indicator bar on side */}
                {item.active && (
                  <span className="absolute left-0 rtl:left-auto rtl:right-0 top-2 bottom-2 w-1 rounded-r-full rtl:rounded-r-none rtl:rounded-l-full bg-blue-500" />
                )}
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      item.active ? "text-blue-500" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom: Activate Pro Card - From Mockup */}
      <div className="pt-4 mt-4 border-t border-slate-200 dark:border-[#22222B]">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-[#2A2A38] bg-gradient-to-br from-slate-100 to-white dark:from-[#181822] dark:to-[#121218] p-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Crown className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {isRTL ? "ترقية لحساب Pro" : "Activate Pro"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-[#8E8E9F] truncate">
                {isRTL ? "افتح جميع الميزات المتقدمة" : "Unlock all features on UrTask"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick logout */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="truncate text-[11px] font-medium">{user.email}</span>
          <button
            type="button"
            onClick={logout}
            className="hover:text-red-500 dark:hover:text-red-400 transition"
            title={t("nav.signOut")}
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 bg-white dark:bg-[#101014] border-r rtl:border-r-0 rtl:border-l border-slate-200 dark:border-[#22222B] transition-colors">
        {sidebarBody}
      </aside>

      {/* 2. Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-2xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-[#101014] shadow-2xl animate-in slide-in-from-left rtl:slide-in-from-right duration-200">
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
}

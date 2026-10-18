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
    userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "User";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isRTL = lang === "ar";

  const mainNavItems = [
    {
      label: t("nav.dashboard") || "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: t("dashboard.myProjects") || "Projects",
      href: "/dashboard#projects",
      icon: FolderKanban,
      active: pathname.startsWith("/projects") && pathname !== "/projects/new",
    },
    {
      label: t("dashboard.newProject") || "New Project",
      href: "/projects/new",
      icon: Plus,
      active: pathname === "/projects/new",
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

        {/* Navigation Links */}
        <nav className="space-y-1.5 pt-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition group ${
                  item.active
                    ? "bg-slate-100 dark:bg-[#191922] text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
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
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile + Quick Logout */}
      <div className="pt-4 border-t border-slate-200 dark:border-[#22222B]">
        <div className="flex items-center justify-between rounded-xl p-2 bg-slate-50 dark:bg-[#15151C] border border-slate-100 dark:border-[#22222C]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0"
            title={t("nav.signOut")}
          >
            <LogOut className="h-4 w-4" />
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

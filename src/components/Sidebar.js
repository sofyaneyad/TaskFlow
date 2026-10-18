"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import TaskFlowLogo from "@/components/TaskFlowLogo";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  Calendar,
  Settings,
  Share2,
  ShieldCheck,
  LogOut,
  X,
  ShieldAlert,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose, onOpenPermissions }) {
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

  const navItems = [
    {
      label: t("nav.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: isRTL ? "مشاريعي" : "My Projects",
      href: "/dashboard#projects",
      icon: FolderKanban,
      active: pathname.startsWith("/projects") && pathname !== "/projects/new",
    },
    {
      label: isRTL ? "المشاريع المشتركة" : "Shared Projects",
      href: "/dashboard#shared",
      icon: Share2,
      active: false,
    },
    {
      label: isRTL ? "مهامي" : "My Tasks",
      href: "/dashboard#tasks",
      icon: CheckSquare,
      active: false,
    },
    {
      label: isRTL ? "الفريق والصلاحيات" : "Team & Roles",
      href: "#permissions",
      icon: Users,
      onClick: onOpenPermissions,
      active: false,
    },
    {
      label: isRTL ? "التقويم" : "Calendar",
      href: "/dashboard#calendar",
      icon: Calendar,
      active: false,
    },
    {
      label: isRTL ? "الإعدادات" : "Settings",
      href: "/dashboard#settings",
      icon: Settings,
      active: false,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      {/* Top Branding & Menu */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-2 pb-2 border-b border-[#E2E8F0]">
          <TaskFlowLogo showTagline={true} size="sm" />
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5" aria-label="Sidebar Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <Icon
                  className={`h-4 w-4 shrink-0 transition ${
                    item.active ? "text-[#4F46E5]" : "text-[#64748B] group-hover:text-[#0F172A]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </>
            );

            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.onClick();
                    if (onClose) onClose();
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition group text-left rtl:text-right"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition group ${
                  item.active
                    ? "bg-[#EEF2FF] text-[#4F46E5] font-bold shadow-2xs"
                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                }`}
              >
                {content}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section - Matching Design System Mockup */}
      <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
        <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-xs font-bold text-white shadow-xs">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#0F172A]">{displayName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="badge-owner inline-flex items-center gap-1 rounded px-1.5 py-0.2 text-[9px] font-bold">
                  <ShieldCheck className="h-2.5 w-2.5" /> Owner
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title={t("nav.signOut")}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition shrink-0"
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
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 bg-white border-r rtl:border-r-0 rtl:border-l border-[#E2E8F0]">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Backdrop & Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs transition-opacity"
            onClick={onClose}
          />
          {/* Drawer container */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-2xl animate-in slide-in-from-left rtl:slide-in-from-right duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

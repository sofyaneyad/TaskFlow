"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import TaskFlowLogo from "@/components/TaskFlowLogo";
import {
  LayoutDashboard,
  FolderKanban,
  Plus,
  X,
  LogOut,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();
  const { lang, t } = useLanguage();

  if (!user) return null;

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
        <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5] dark:border-[#26372D]">
          <TaskFlowLogo size="sm" />
          <div className="flex items-center gap-1.5">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="h-7 w-7 rounded-full object-cover ring-1 ring-[#C8DAC9] dark:ring-[#26372D]"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#166534] text-[10px] font-bold text-white ring-1 ring-white dark:ring-[#26372D]">
                {userInitials}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1 text-[#5E7164] dark:text-[#8EA393] hover:text-[#26332B] dark:hover:text-[#FAF9F6]"
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
                    ? "bg-[#E8EFE9] dark:bg-[#1E2E24] text-[#166534] dark:text-[#86A789] shadow-2xs font-bold"
                    : "text-[#5E7164] dark:text-[#8EA393] hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26] hover:text-[#26332B] dark:hover:text-[#FAF9F6]"
                }`}
              >
                {/* Active indicator bar on side */}
                {item.active && (
                  <span className="absolute left-0 rtl:left-auto rtl:right-0 top-2 bottom-2 w-1 rounded-r-full rtl:rounded-r-none rtl:rounded-l-full bg-[#166534] dark:bg-[#86A789]" />
                )}
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      item.active ? "text-[#166534] dark:text-[#86A789]" : "text-[#5E7164] dark:text-[#8EA393] group-hover:text-[#26332B] dark:group-hover:text-[#FAF9F6]"
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
      <div className="pt-4 border-t border-[#E5EBE5] dark:border-[#26372D]">
        <div className="flex items-center justify-between rounded-xl p-2 bg-[#FAF9F6] dark:bg-[#131D17] border border-[#E5EBE5] dark:border-[#26372D]">
          <div className="flex items-center gap-2.5 min-w-0">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-[#C8DAC9] dark:ring-[#26372D]"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#166534] text-xs font-bold text-white">
                {userInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#26332B] dark:text-[#FAF9F6] truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-[#5E7164] dark:text-[#8EA393] truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                router.push("/login");
                await logout();
              } catch (e) {
                console.error("Logout error:", e);
              }
            }}
            className="p-1.5 rounded-lg text-[#5E7164] dark:text-[#8EA393] hover:text-[#CA8A04] dark:hover:text-[#FACC15] hover:bg-[#FAF5E8] dark:hover:bg-[#6B5424]/30 transition shrink-0"
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
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 bg-[#FFFFFF] dark:bg-[#17221C] border-r rtl:border-r-0 rtl:border-l border-[#E5EBE5] dark:border-[#26372D] transition-colors">
        {sidebarBody}
      </aside>

      {/* 2. Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-2xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-[#FFFFFF] dark:bg-[#17221C] shadow-2xl animate-in slide-in-from-left rtl:slide-in-from-right duration-200">
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
}

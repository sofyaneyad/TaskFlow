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

  if (!user || pathname === "/login" || pathname === "/register") return null;

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

  const mainNavItems = [
    {
      label: t("nav.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: t("dashboard.myProjects"),
      href: "/projects",
      icon: FolderKanban,
      active: pathname.startsWith("/projects") && pathname !== "/projects/new",
    },
    {
      label: t("dashboard.newProject"),
      href: "/projects/new",
      icon: Plus,
      active: pathname === "/projects/new",
    },
  ];

  const sidebarBody = (
    <div className="flex h-full flex-col justify-between p-3.5 sm:p-4 overflow-y-auto">
      {/* Top Header: Logo + Close Button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
          <TaskFlowLogo size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden rounded-lg p-1 text-[#64748B] dark:text-[#A1A1AA] hover:bg-[#F1F3F5] dark:hover:bg-[#18181B] hover:text-[#09090B] dark:hover:text-[#FFFFFF] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 pt-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (onClose) onClose();
                  if (item.href === "/dashboard#projects" && pathname === "/dashboard") {
                    const el = document.getElementById("projects");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }
                }}
                className={`relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition group cursor-pointer ${
                  item.active
                    ? "bg-[#EFF6FF] dark:bg-[#18181B] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs font-bold"
                    : "text-[#64748B] dark:text-[#A1A1AA] hover:bg-[#F1F3F5] dark:hover:bg-[#18181B] hover:text-[#09090B] dark:hover:text-[#FFFFFF]"
                }`}
              >
                {/* Active indicator bar on side */}
                {item.active && (
                  <span className="absolute left-0 rtl:left-auto rtl:right-0 top-1.5 bottom-1.5 w-1 rounded-r-full rtl:rounded-r-none rtl:rounded-l-full bg-[#2563EB] dark:bg-[#3B82F6]" />
                )}
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      item.active ? "text-[#2563EB] dark:text-[#60A5FA]" : "text-[#64748B] dark:text-[#A1A1AA] group-hover:text-[#09090B] dark:group-hover:text-[#EBF1EC]"
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
      <div className="pt-3 pb-2 sm:pb-0 border-t border-[#E4E4E7] dark:border-[#27272A]">
        <div className="flex items-center justify-between rounded-xl p-2 bg-[#F8F9FA] dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A]">
          <div className="flex items-center gap-2 min-w-0 flex-1 mr-1 rtl:mr-0 rtl:ml-1">
            {photoURL ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photoURL}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                {userInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#09090B] dark:text-[#F4F4F5] truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-[#64748B] dark:text-[#A1A1AA] truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await logout();
                router.push("/login");
              } catch (e) {
                console.error("Logout error:", e);
                router.push("/login");
              }
            }}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#A1A1AA] hover:text-amber-600 dark:hover:text-[#FDE047] hover:bg-amber-50 dark:hover:bg-[#1F170D] transition shrink-0 cursor-pointer"
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
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 rtl:lg:left-auto rtl:lg:right-0 lg:z-30 bg-[#FFFFFF] dark:bg-[#0A0F0E] border-r rtl:border-r-0 rtl:border-l border-[#E4E4E7] dark:border-[#27272A] transition-colors">
        {sidebarBody}
      </aside>

      {/* 2. Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex rtl:flex-row-reverse">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-2xs transition-opacity cursor-pointer"
            onClick={onClose}
          />
          <div className="relative flex w-60 max-w-[75vw] flex-col bg-[#FFFFFF] dark:bg-[#0A0F0E] shadow-2xl animate-in slide-in-from-left rtl:slide-in-from-right duration-200">
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
}

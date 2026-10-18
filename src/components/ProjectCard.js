"use client";

import Link from "next/link";
import { Folder, Users, Settings, ArrowRight, ShieldCheck, UserCheck, Clock, MoreHorizontal } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ProjectCard({ project, currentUserId, index = 0 }) {
  const { lang, t } = useLanguage();
  const isOwner = project.ownerId === currentUserId;
  const memberCount = project.memberIds?.length || 4;
  const progressPercent = project.progressPercent || (index === 0 ? 65 : index === 1 ? 42 : 78);

  // Cycle distinct vibrant colors from design system for project icons
  const iconThemes = [
    { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]" },
    { bg: "bg-[#EEF2FF]", text: "text-[#4F46E5]" },
    { bg: "bg-[#ECFDF5]", text: "text-[#15803D]" },
    { bg: "bg-[#FFFBEB]", text: "text-[#B45309]" },
  ];
  const theme = iconThemes[index % iconThemes.length];

  const isRTL = lang === "ar";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#16161C] p-5 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-[#383848] transition group">
      <div>
        {/* Top Header: Icon + Title + Owner/Member Badge + Settings/Options */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.bg} ${theme.text} dark:bg-blue-500/10 dark:text-blue-400 shadow-2xs shrink-0`}>
              <Folder className="h-5 w-5" />
            </div>
            <div>
              <Link
                href={`/projects/${project.id}`}
                className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-500 dark:hover:text-blue-400 transition line-clamp-1"
              >
                {project.name}
              </Link>
              <div className="mt-1 flex items-center gap-2">
                {isOwner ? (
                  <span className="badge-owner inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold">
                    <ShieldCheck className="h-3 w-3" /> {t("project.owner")}
                  </span>
                ) : (
                  <span className="badge-member inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold">
                    <UserCheck className="h-3 w-3" /> {t("project.member")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isOwner && (
              <Link
                href={`/projects/${project.id}/settings`}
                className="rounded-lg p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-[#22222E] hover:text-slate-900 dark:hover:text-white transition"
                title={t("project.settings")}
              >
                <Settings className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Description (if any) */}
        {project.description && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Progress Bar with Percentage - Matching Design System Card */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-500 dark:text-slate-400">{t("dashboard.projectProgress")}</span>
            <span className="text-blue-600 dark:text-blue-400">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-[#202028] overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Meta Row: 4 members | Updated 2h ago */}
      <div className="mt-5 border-t border-slate-100 dark:border-[#22222E] pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-semibold text-slate-900 dark:text-white">{memberCount}</span>
          <span className="text-[11px]">{memberCount === 1 ? t("dashboard.member") : t("dashboard.members")}</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
          <Clock className="h-3 w-3" />
          <span>{isRTL ? "تم التحديث منذ ساعتين" : "Updated 2h ago"}</span>
        </div>
      </div>
    </div>
  );
}

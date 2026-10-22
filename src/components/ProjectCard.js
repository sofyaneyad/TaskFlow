"use client";
import { useMemo } from "react";
import Link from "next/link";
import { Folder, Users, Settings, ArrowRight, ShieldCheck, UserCheck, Clock, MoreHorizontal } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { calculateTasksProgress } from "@/services/projects";

export default function ProjectCard({ project, currentUserId, index = 0 }) {
  const { lang, t } = useLanguage();
  const isOwner = project.ownerId === currentUserId;
  const memberCount = project.memberIds?.length || 1;

  const progressPercent = useMemo(() => {
    if (typeof project.progressPercent === "number" && project.taskCount > 0) {
      return project.progressPercent;
    }
    if (typeof window !== "undefined" && project.id) {
      try {
        const raw = localStorage.getItem("taskflow_tasks_" + project.id);
        if (raw) {
          const tasks = JSON.parse(raw);
          return calculateTasksProgress(tasks).progressPercent;
        }
      } catch {}
    }
    return project.progressPercent || 0;
  }, [project.progressPercent, project.taskCount, project.id]);

  const isRTL = lang === "ar";

  const updatedDateText = project.updatedAt
    ? new Date(project.updatedAt?.seconds ? project.updatedAt.seconds * 1000 : project.updatedAt).toLocaleDateString()
    : null;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-5 shadow-2xs hover:shadow-md hover:border-[#2563EB]/50 dark:hover:border-[#3B82F6]/50 hover:-translate-y-1 transition-all duration-200 ease-out group">
      <div>
        {/* Top Header: Icon + Title + Owner/Member Badge + Settings */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-[#18181B] dark:text-[#60A5FA] shadow-2xs shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-200">
              <Folder className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/projects/${project.id}`}
                className="font-bold text-[#09090B] dark:text-[#F4F4F5] text-sm hover:text-[#2563EB] dark:hover:text-[#93C5FD] transition truncate block"
              >
                {project.name}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {isOwner ? (
                  <span className="badge-owner inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 !text-white">
                    <ShieldCheck className="h-3 w-3 text-white" /> {t("project.owner")}
                  </span>
                ) : (
                  <span className="badge-member inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0">
                    <UserCheck className="h-3 w-3" /> {t("project.member")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isOwner && (
              <Link
                href={`/projects/${project.id}/settings`}
                className="rounded-lg p-1 text-[#64748B] dark:text-[#A1A1AA] hover:bg-[#F1F3F5] dark:hover:bg-[#27272A] hover:text-[#09090B] dark:hover:text-[#FFFFFF] transition"
                title={t("project.settings")}
              >
                <Settings className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="mt-3 text-xs text-[#64748B] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Progress Bar with Percentage */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-[#64748B] dark:text-[#A1A1AA]">{t("dashboard.projectProgress")}</span>
            <span className="text-[#2563EB] dark:text-[#60A5FA]">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#F1F3F5] dark:bg-[#09090B] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#2563EB] dark:bg-[#3B82F6] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Meta Row: Members count & Link to project */}
      <div className="mt-5 border-t border-[#E4E4E7] dark:border-[#27272A] pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B] dark:text-[#A1A1AA]">
        <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
          <Users className="h-3.5 w-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
          <span className="font-semibold text-[#09090B] dark:text-[#F4F4F5]">{memberCount}</span>
          <span className="text-[11px]">{memberCount === 1 ? t("dashboard.member") : t("dashboard.members")}</span>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="flex items-center gap-1 text-[11px] font-bold text-[#2563EB] dark:text-[#60A5FA] group-hover:underline shrink-0 whitespace-nowrap"
        >
          <span>{updatedDateText || t("dashboard.viewProject")}</span>
          <ArrowRight className="h-3 w-3 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </div>
  );
}

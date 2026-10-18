"use client";

import Link from "next/link";
import { Folder, Users, Settings, ArrowRight, ShieldCheck, UserCheck, Clock, MoreHorizontal } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ProjectCard({ project, currentUserId, index = 0 }) {
  const { lang, t } = useLanguage();
  const isOwner = project.ownerId === currentUserId;
  const memberCount = project.memberIds?.length || 1;
  const progressPercent = project.progressPercent || 0;

  const isRTL = lang === "ar";

  const updatedDateText = project.updatedAt
    ? new Date(project.updatedAt?.seconds ? project.updatedAt.seconds * 1000 : project.updatedAt).toLocaleDateString()
    : null;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-5 shadow-2xs hover:shadow-md hover:border-[#86A789]/50 transition duration-200 group">
      <div>
        {/* Top Header: Icon + Title + Owner/Member Badge + Settings */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EFE9] text-[#166534] dark:bg-[#1E2E24] dark:text-[#86A789] shadow-2xs shrink-0 mt-0.5">
              <Folder className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/projects/${project.id}`}
                className="font-bold text-[#26332B] dark:text-[#FAF9F6] text-sm hover:text-[#166534] dark:hover:text-[#86A789] transition truncate block"
              >
                {project.name}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {isOwner ? (
                  <span className="badge-owner inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0">
                    <ShieldCheck className="h-3 w-3" /> {t("project.owner")}
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
                className="rounded-lg p-1 text-[#5E7164] dark:text-[#8EA393] hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26] hover:text-[#26332B] dark:hover:text-[#FAF9F6] transition"
                title={t("project.settings")}
              >
                <Settings className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="mt-3 text-xs text-[#5E7164] dark:text-[#8EA393] line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Progress Bar with Percentage */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-[#5E7164] dark:text-[#8EA393]">{t("dashboard.projectProgress")}</span>
            <span className="text-[#166534] dark:text-[#86A789]">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#E8EFE9] dark:bg-[#1E2E24] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#166534] dark:bg-[#86A789] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Meta Row: Members count & Link to project */}
      <div className="mt-5 border-t border-[#E5EBE5] dark:border-[#26372D] pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5E7164] dark:text-[#8EA393]">
        <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
          <Users className="h-3.5 w-3.5 text-[#166534] dark:text-[#86A789]" />
          <span className="font-semibold text-[#26332B] dark:text-[#FAF9F6]">{memberCount}</span>
          <span className="text-[11px]">{memberCount === 1 ? t("dashboard.member") : t("dashboard.members")}</span>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="flex items-center gap-1 text-[11px] font-bold text-[#166534] dark:text-[#86A789] hover:underline shrink-0 whitespace-nowrap"
        >
          <span>{updatedDateText || (isRTL ? "عرض المشروع" : "View Project")}</span>
          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}

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
    <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] p-5 shadow-2xs hover:shadow-md hover:border-[#059669]/50 dark:hover:border-[#00D084]/50 transition duration-200 group">
      <div>
        {/* Top Header: Icon + Title + Owner/Member Badge + Settings */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669] dark:bg-[#0E2E1D] dark:text-[#00D084] shadow-2xs shrink-0 mt-0.5">
              <Folder className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/projects/${project.id}`}
                className="font-bold text-[#0F172A] dark:text-[#FFFFFF] text-sm hover:text-[#059669] dark:hover:text-[#00D084] transition truncate block"
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
                className="rounded-lg p-1 text-[#64748B] dark:text-[#7B9A89] hover:bg-[#F1F5F9] dark:hover:bg-[#0E281A] hover:text-[#0F172A] dark:hover:text-[#FFFFFF] transition"
                title={t("project.settings")}
              >
                <Settings className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="mt-3 text-xs text-[#64748B] dark:text-[#7B9A89] line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Progress Bar with Percentage */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-[#64748B] dark:text-[#7B9A89]">{t("dashboard.projectProgress")}</span>
            <span className="text-[#059669] dark:text-[#00D084]">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] dark:bg-[#06130B] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#059669] dark:bg-[#00D084] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Meta Row: Members count & Link to project */}
      <div className="mt-5 border-t border-[#E2E8F0] dark:border-[#133020] pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B] dark:text-[#7B9A89]">
        <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
          <Users className="h-3.5 w-3.5 text-[#059669] dark:text-[#00D084]" />
          <span className="font-semibold text-[#0F172A] dark:text-[#FFFFFF]">{memberCount}</span>
          <span className="text-[11px]">{memberCount === 1 ? t("dashboard.member") : t("dashboard.members")}</span>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="flex items-center gap-1 text-[11px] font-bold text-[#059669] dark:text-[#00D084] hover:underline shrink-0 whitespace-nowrap"
        >
          <span>{updatedDateText || (isRTL ? "عرض المشروع" : "View Project")}</span>
          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}

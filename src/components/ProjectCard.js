"use client";

import Link from "next/link";
import { Folder, Users, Settings, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ProjectCard({ project, currentUserId }) {
  const { t } = useLanguage();
  const isOwner = project.ownerId === currentUserId;
  const memberCount = project.memberIds?.length || 1;
  const progressPercent = project.progressPercent || 65;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs hover:shadow-md hover:border-[#CBD5E1] transition">
      <div>
        {/* Top Header with Icon and Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <Folder className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] text-base line-clamp-1">
                {project.name}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                {isOwner ? (
                  <span className="badge-owner inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold">
                    <ShieldCheck className="h-3 w-3" /> {t("project.owner")}
                  </span>
                ) : (
                  <span className="badge-member inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold">
                    <UserCheck className="h-3 w-3" /> {t("project.member")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isOwner && (
            <Link
              href={`/projects/${project.id}/settings`}
              className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
              title={t("project.settings")}
            >
              <Settings className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Description */}
        <p className="mt-3.5 text-xs text-[#64748B] line-clamp-2 leading-relaxed">
          {project.description || "No description provided."}
        </p>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-[#64748B]">{t("dashboard.projectProgress")}</span>
            <span className="text-[#4F46E5] font-bold">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#4F46E5] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-5 border-t border-[#F1F5F9] pt-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#64748B]">
          <Users className="h-3.5 w-3.5 text-[#4F46E5]" />
          <span className="font-medium text-[#0F172A]">{memberCount}</span>
          <span>{memberCount === 1 ? t("dashboard.member") : t("dashboard.members")}</span>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="flex items-center gap-1 font-semibold text-[#4F46E5] hover:text-[#4338CA] transition group text-xs"
        >
          <span>{t("dashboard.openProject")}</span>
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}

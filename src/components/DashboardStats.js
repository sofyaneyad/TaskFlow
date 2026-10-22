"use client";

import { useLanguage } from "@/context/LanguageContext";
import { FolderKanban, ListTodo, Clock, CheckCircle2, TrendingUp } from "lucide-react";

export default function DashboardStats({ stats, projectsCount, onProjectsClick }) {
  const { t } = useLanguage();

  const totalProjectsValue = projectsCount ?? stats?.totalProjects ?? 0;

  const cards = [
    {
      label: t("dashboard.totalProjects"),
      value: totalProjectsValue,
      icon: FolderKanban,
      onClick: onProjectsClick,
      badgeText: t("dashboard.viewProjectsBadge"),
      badgeType: "emerald",
      iconColor: "text-[#2563EB] dark:text-[#60A5FA]",
      iconBg: "bg-[#EFF6FF] dark:bg-[#18181B]",
      isHighlighted: true,
    },
    {
      label: t("dashboard.totalTasks"),
      value: stats?.totalTasks ?? 0,
      icon: ListTodo,
      subText: t("dashboard.recordedTasksSub"),
      iconColor: "text-[#475569] dark:text-[#A1A1AA]",
      iconBg: "bg-[#F1F3F5] dark:bg-[#18181B]",
    },
    {
      label: t("dashboard.inProgress"),
      value: stats?.inProgressTasks ?? 0,
      icon: Clock,
      badgeText: t("dashboard.runningNow"),
      badgeType: "amber",
      iconColor: "text-[#D97706] dark:text-[#FDE047]",
      iconBg: "bg-[#FEF3C7] dark:bg-[#1F170D]",
    },
    {
      label: t("dashboard.completed"),
      value: stats?.doneTasks ?? 0,
      icon: CheckCircle2,
      badgeText: t("dashboard.doneBadge"),
      badgeType: "emerald",
      iconColor: "text-[#2563EB] dark:text-[#60A5FA]",
      iconBg: "bg-[#EFF6FF] dark:bg-[#18181B]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const isClickable = Boolean(card.onClick);

        return (
          <div
            key={card.label}
            onClick={card.onClick}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={(e) => {
              if (isClickable && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                card.onClick();
              }
            }}
            className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-200 bg-[#FFFFFF] dark:bg-[#141416] ${
              card.isHighlighted
                ? "border border-[#2563EB]/40 dark:border-[#3B82F6]/40 hover:border-[#2563EB] dark:hover:border-[#3B82F6] shadow-xs"
                : "border border-[#E4E4E7] dark:border-[#27272A] hover:border-[#CBD5E1] dark:hover:border-[#3F3F46] shadow-xs"
            } ${
              isClickable
                ? "cursor-pointer select-none active:scale-[0.98] hover:shadow-md hover:-translate-y-0.5"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#64748B] dark:text-[#A1A1AA]">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight text-[#09090B] dark:text-[#F4F4F5]">
                  {card.value}
                </p>

                {/* Subtext or Pill Badge */}
                {card.badgeText && (
                  <div className="mt-2.5">
                    {card.badgeType === "amber" ? (
                      <span className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-[11px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] dark:bg-[#1F170D] dark:text-[#FDE047] dark:border-[#452A12]">
                        {card.badgeText}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] dark:bg-[#18181B] dark:text-[#60A5FA] dark:border-[#27272A]">
                        {card.badgeText}
                      </span>
                    )}
                  </div>
                )}

                {card.subText && (
                  <p className="mt-3 text-[11px] font-medium text-[#64748B] dark:text-[#A1A1AA]">
                    {card.subText}
                  </p>
                )}
              </div>

              {/* Icon Emblem */}
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 shadow-2xs transition-transform duration-200 ${
                  isClickable ? "hover:scale-105" : ""
                } ${card.iconBg} ${card.iconColor}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

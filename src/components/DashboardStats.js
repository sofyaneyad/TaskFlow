"use client";

import { useLanguage } from "@/context/LanguageContext";
import { FolderKanban, ListTodo, Clock, CheckCircle2, TrendingUp } from "lucide-react";

export default function DashboardStats({ stats, projectsCount, onProjectsClick }) {
  const { lang, t } = useLanguage();
  const isRTL = lang === "ar";

  const totalProjectsValue = projectsCount ?? stats?.totalProjects ?? 0;

  const cards = [
    {
      label: t("dashboard.totalProjects") || "Total Projects",
      value: totalProjectsValue,
      icon: FolderKanban,
      onClick: onProjectsClick,
      badgeText: isRTL ? "انقر لعرض مشاريعك !" : "Click to view projects !",
      badgeType: "emerald",
      iconColor: "text-[#059669] dark:text-[#00D084]",
      iconBg: "bg-[#ECFDF5] dark:bg-[#0E2E1D]",
      isHighlighted: true,
    },
    {
      label: t("dashboard.totalTasks") || "Total Tasks",
      value: stats?.totalTasks ?? 0,
      icon: ListTodo,
      subText: isRTL ? "مهمة مسجلة" : "Recorded tasks",
      iconColor: "text-[#475569] dark:text-[#7B9A89]",
      iconBg: "bg-[#F1F5F9] dark:bg-[#0E2518]",
    },
    {
      label: t("dashboard.inProgress") || "In Progress",
      value: stats?.inProgressTasks ?? 0,
      icon: Clock,
      badgeText: isRTL ? "جارية الآن" : "In progress",
      badgeType: "amber",
      iconColor: "text-[#D97706] dark:text-[#F59E0B]",
      iconBg: "bg-[#FEF3C7] dark:bg-[#242211]",
    },
    {
      label: t("dashboard.completed") || "Completed Tasks",
      value: stats?.doneTasks ?? 0,
      icon: CheckCircle2,
      badgeText: isRTL ? "منجزة" : "Done",
      badgeType: "emerald",
      iconColor: "text-[#059669] dark:text-[#00D084]",
      iconBg: "bg-[#ECFDF5] dark:bg-[#0E2E1D]",
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
            className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-200 bg-[#FFFFFF] dark:bg-[#0B1F14] ${
              card.isHighlighted
                ? "border border-[#E2E8F0] dark:border-[#144229] hover:border-[#059669] dark:hover:border-[#00D084] shadow-xs"
                : "border border-[#E2E8F0] dark:border-[#133020] hover:border-[#CBD5E1] dark:hover:border-[#1A432D] shadow-xs"
            } ${
              isClickable
                ? "cursor-pointer select-none active:scale-[0.98] hover:shadow-md hover:-translate-y-0.5"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#64748B] dark:text-[#7B9A89]">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight text-[#0F172A] dark:text-[#FFFFFF]">
                  {card.value}
                </p>

                {/* Subtext or Pill Badge */}
                {card.badgeText && (
                  <div className="mt-2.5">
                    {card.badgeType === "amber" ? (
                      <span className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-[11px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] dark:bg-[#272210] dark:text-[#F59E0B] dark:border-[#423612]">
                        {card.badgeText}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] dark:bg-[#0E2E1D] dark:text-[#00D084] dark:border-[#15442A]">
                        {card.badgeText}
                      </span>
                    )}
                  </div>
                )}

                {card.subText && (
                  <p className="mt-3 text-[11px] font-medium text-[#64748B] dark:text-[#7B9A89]">
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

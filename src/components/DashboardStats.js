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
      actionHint: isRTL ? "انقر لعرض مشاريعك ↓" : "Click to view projects ↓",
    },
    {
      label: t("dashboard.totalTasks") || "Total Tasks",
      value: stats?.totalTasks ?? 0,
      icon: ListTodo,
    },
    {
      label: t("dashboard.inProgress") || "In Progress",
      value: stats?.inProgressTasks ?? 0,
      icon: Clock,
    },
    {
      label: t("dashboard.completed") || "Completed Tasks",
      value: stats?.doneTasks ?? 0,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const isFirst = idx === 0;
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
            className={`relative overflow-hidden rounded-2xl p-5 shadow-xs transition-all duration-200 ${
              isClickable
                ? "cursor-pointer select-none active:scale-[0.98] hover:shadow-md hover:-translate-y-0.5"
                : ""
            } ${
              isFirst
                ? "bg-[#166534] text-white border border-[#14532D] shadow-sm hover:bg-[#14532D]"
                : "bg-white dark:bg-[#17221C] border border-[#E5EBE5] dark:border-[#26372D] text-[#26332B] dark:text-[#FAF9F6] hover:border-[#86A789]/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-semibold ${
                    isFirst ? "text-emerald-100" : "text-[#5E7164] dark:text-[#8EA393]"
                  }`}
                >
                  {card.label}
                </p>
                <p
                  className={`mt-2 text-3xl font-black tracking-tight ${
                    isFirst ? "text-white" : "text-[#26332B] dark:text-[#FAF9F6]"
                  }`}
                >
                  {card.value}
                </p>
                {card.actionHint && (
                  <p className="mt-1.5 text-[11px] font-medium text-emerald-100/90 flex items-center gap-1 group-hover:underline">
                    <span>{card.actionHint}</span>
                  </p>
                )}
              </div>

              {/* Icon Emblem */}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 shadow-2xs transition-transform duration-200 ${
                  isClickable ? "hover:scale-105" : ""
                } ${
                  isFirst
                    ? "bg-white/15 text-white"
                    : idx === 1
                    ? "bg-[#E8EFE9] dark:bg-[#1E2E24] text-[#166534] dark:text-[#86A789]"
                    : idx === 2
                    ? "bg-[#FEF3C7] dark:bg-amber-950/30 text-[#B45309] dark:text-[#FCD34D]"
                    : "bg-[#E8F0EC] dark:bg-emerald-950/30 text-[#166534] dark:text-[#4ADE80]"
                }`}
              >
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

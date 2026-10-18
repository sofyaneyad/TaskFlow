"use client";

import { useLanguage } from "@/context/LanguageContext";
import { FolderKanban, ListTodo, Clock, CheckCircle2, TrendingUp } from "lucide-react";

export default function DashboardStats({ stats }) {
  const { lang, t } = useLanguage();
  const isRTL = lang === "ar";

  const cards = [
    {
      label: t("dashboard.totalProjects") || "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: t("dashboard.totalTasks") || "Total Tasks",
      value: stats?.totalTasks ?? 0,
      icon: ListTodo,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: t("dashboard.inProgress") || "In Progress",
      value: stats?.inProgressTasks ?? 0,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: t("dashboard.completed") || "Completed Tasks",
      value: stats?.doneTasks ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        return (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#16161C] p-5 shadow-xs transition hover:border-slate-300 dark:hover:border-[#353545]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-[#8E8E9F]">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </p>
              </div>

              {/* Icon Emblem in sleek squircle matching design colors */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} ${card.color} shadow-xs shrink-0`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

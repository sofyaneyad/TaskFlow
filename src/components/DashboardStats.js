"use client";

import { FolderKanban, CheckCircle2, ListTodo, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardStats({ stats }) {
  const { t } = useLanguage();

  const cards = [
    {
      label: t("dashboard.totalProjects"),
      value: stats?.totalProjects ?? 0,
      subtext: `+2 ${t("dashboard.thisWeek")}`,
      icon: FolderKanban,
      color: "text-[#4F46E5]",
      bgColor: "bg-[#EEF2FF]",
    },
    {
      label: t("dashboard.activeTasks"),
      value: (stats?.todoTasks ?? 0) + (stats?.inProgressTasks ?? 0),
      subtext: `+4 ${t("dashboard.thisWeek")}`,
      icon: ListTodo,
      color: "text-[#2563EB]",
      bgColor: "bg-[#EFF6FF]",
    },
    {
      label: t("dashboard.completedTasks"),
      value: stats?.doneTasks ?? 0,
      subtext: `+6 ${t("dashboard.thisWeek")}`,
      icon: CheckCircle2,
      color: "text-[#15803D]",
      bgColor: "bg-[#ECFDF5]",
    },
    {
      label: t("dashboard.teamMembers"),
      value: stats?.totalProjects > 0 ? stats.totalProjects * 2 + 1 : 1,
      subtext: `+1 ${t("dashboard.thisWeek")}`,
      icon: Users,
      color: "text-[#0F172A]",
      bgColor: "bg-[#F1F5F9]",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs transition hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">{card.label}</span>
              <div className={`rounded-xl p-2 ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
                {card.value}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#15803D]">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

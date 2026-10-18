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
        return (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl p-5 shadow-xs transition duration-200 ${
              isFirst
                ? "bg-[#166534] text-white border border-[#14532D] shadow-sm"
                : "bg-white dark:bg-[#17221C] border border-[#E5EBE5] dark:border-[#26372D] text-[#26332B] dark:text-[#FAF9F6] hover:border-[#86A789]/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
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
              </div>

              {/* Icon Emblem */}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 shadow-2xs ${
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

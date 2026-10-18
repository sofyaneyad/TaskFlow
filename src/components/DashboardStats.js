"use client";

import { useLanguage } from "@/context/LanguageContext";
import { FolderKanban, ListTodo, Clock, CheckCircle2, TrendingUp } from "lucide-react";

export default function DashboardStats({ stats }) {
  const { lang, t } = useLanguage();
  const isRTL = lang === "ar";

  const cards = [
    {
      label: isRTL ? "إجمالي المشاريع" : "Total Projects",
      value: stats?.totalProjects || 26,
      trend: "+4",
      subtext: isRTL ? "مقارنة بالشهر الماضي" : "vs last month",
      icon: FolderKanban,
    },
    {
      label: isRTL ? "إجمالي المهام" : "Total Tasks",
      value: stats?.totalTasks || 10,
      trend: "+2",
      subtext: isRTL ? "مقارنة بالشهر الماضي" : "vs last month",
      icon: ListTodo,
    },
    {
      label: isRTL ? "قيد المراجعة" : "In Reviews",
      value: 27,
      trend: "+13",
      subtext: isRTL ? "مقارنة بالشهر الماضي" : "vs last month",
      icon: Clock,
    },
    {
      label: isRTL ? "المهام المكتملة" : "Completed Tasks",
      value: stats?.doneTasks || 50,
      trend: "+15",
      subtext: isRTL ? "مقارنة بالشهر الماضي" : "vs last month",
      icon: CheckCircle2,
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
            {/* Top row: Label + 3D card icon emblem */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-[#8E8E9F]">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </p>
              </div>

              {/* Embossed Card Emblem from Mockup */}
              <div className="flex h-11 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#202028] border border-slate-200 dark:border-[#2C2C38] shadow-inner shrink-0">
                <div className="flex flex-col gap-1 w-5">
                  <div className="h-1 w-full bg-slate-300 dark:bg-[#343444] rounded-full" />
                  <div className="h-1 w-3/4 bg-slate-300 dark:bg-[#343444] rounded-full" />
                </div>
              </div>
            </div>

            {/* Bottom trend row: ^ +X vs last month in green */}
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-[#22C55E]">
              <TrendingUp className="h-3 w-3" />
              <span>
                ^{card.trend} {card.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

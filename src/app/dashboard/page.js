"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardStats from "@/components/DashboardStats";
import { getUserProjects } from "@/services/projects";
import { getUserDashboardStats } from "@/services/tasks";
import {
  Plus,
  Download,
  Filter,
  Search,
  CheckSquare,
  Square,
  Clock,
  ArrowRight,
  TrendingUp,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const { lang, t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskSearch, setTaskSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);
      const calculatedStats = await getUserDashboardStats(userProjects);
      setStats(calculatedStats);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const userName =
    userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Saif";
  const isRTL = lang === "ar";

  // Today's Tasks matching exact mockup rows
  const todayTasksList = useMemo(() => {
    return [
      {
        id: "t1",
        name: isRTL ? "إنهاء تصميم الصفحة الرئيسية" : "Finalize Home Page Design",
        project: "SAAS Project",
        color: "bg-blue-600",
        due: "21 AUG 2025",
        completed: false,
      },
      {
        id: "t2",
        name: isRTL ? "مراجعة صفحة التواصل" : "Review contact page design",
        project: "Fintech Project",
        color: "bg-purple-600",
        due: "21 AUG 2025",
        completed: false,
      },
      {
        id: "t3",
        name: isRTL ? "إنهاء تصميم صفحة الأسعار" : "Finalize Pricing Page Design",
        project: "Agency Project",
        color: "bg-cyan-500",
        due: "21 AUG 2025",
        completed: false,
      },
      {
        id: "t4",
        name: isRTL ? "العمل على نظام التصميم" : "Working on Design System",
        project: "HR Dashboard Project",
        color: "bg-emerald-600",
        due: "21 AUG 2025",
        completed: false,
      },
      {
        id: "t5",
        name: isRTL ? "تجهيز تقرير الدعم الفني" : "Prepare Support Report",
        project: "Website Project",
        color: "bg-blue-500",
        due: "21 AUG 2025",
        completed: false,
      },
      {
        id: "t6",
        name: isRTL ? "إنهاء الهيكل العام للتطبيق" : "Finalize Home Page Design",
        project: "HealthTech Project",
        color: "bg-amber-600",
        due: "21 AUG 2025",
        completed: false,
      },
    ];
  }, [isRTL]);

  const filteredTasks = useMemo(() => {
    if (!taskSearch.trim()) return todayTasksList;
    return todayTasksList.filter(
      (t) =>
        t.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.project.toLowerCase().includes(taskSearch.toLowerCase())
    );
  }, [todayTasksList, taskSearch]);

  // List of Projects matching mockup data table
  const listProjectsData = useMemo(() => {
    const defaultList = [
      {
        id: "p1",
        name: "SAAS Project",
        color: "bg-blue-600",
        status: "In Progress",
        statusKey: "in_progress",
        progress: 75,
        totalTasks: "15 / 20",
        dueDate: "03 AUG 2025",
        ownerName: "Michael Johnson",
        ownerAvatar: "MJ",
      },
      {
        id: "p2",
        name: "Fintech Project",
        color: "bg-purple-600",
        status: "Completed",
        statusKey: "done",
        progress: 100,
        totalTasks: "32 / 32",
        dueDate: "10 AUG 2025",
        ownerName: "Fatima Zainab Ali",
        ownerAvatar: "FZ",
      },
      {
        id: "p3",
        name: "HR Dashboard Project",
        color: "bg-emerald-600",
        status: "On Hold",
        statusKey: "on_hold",
        progress: 43,
        totalTasks: "6 / 15",
        dueDate: "06 AUG 2025",
        ownerName: "Ananya Das Gupta",
        ownerAvatar: "AD",
      },
    ];

    if (projects.length === 0) return defaultList;

    // Merge real user projects with demo structure
    return projects.map((p, idx) => ({
      id: p.id,
      name: p.name,
      color: idx % 3 === 0 ? "bg-blue-600" : idx % 3 === 1 ? "bg-purple-600" : "bg-emerald-600",
      status: "In Progress",
      statusKey: "in_progress",
      progress: p.progressPercent || 65,
      totalTasks: "8 / 12",
      dueDate: "25 AUG 2025",
      ownerName: userName,
      ownerAvatar: userName.slice(0, 2).toUpperCase(),
    }));
  }, [projects, userName]);

  const filteredProjects = useMemo(() => {
    if (!projectSearch.trim()) return listProjectsData;
    return listProjectsData.filter((p) =>
      p.name.toLowerCase().includes(projectSearch.toLowerCase())
    );
  }, [listProjectsData, projectSearch]);

  // Performance Equalizer Bar Data (Mon - Fri from mockup)
  const performanceDays = [
    { day: "Mon", score: "+81", bars: 7 },
    { day: "Tue", score: "+56", bars: 5 },
    { day: "Wed", score: "+90", bars: 9 },
    { day: "Thu", score: "+34", bars: 3 },
    { day: "Fri", score: "+76", bars: 7 },
  ];

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* 1. Greeting Banner with Metric Pills + Export & New Buttons */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isRTL ? `مرحباً بعودتك، ${userName}!` : `Welcome Back, ${userName}!`}</span>
              <span className="text-2xl">👋</span>
            </h1>

            {/* Quick Summary Badges / Pills from Mockup */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#16161C] px-3 py-1 font-semibold text-slate-700 dark:text-[#A1A1B2]">
                {isRTL ? "5 مهام تستحق اليوم" : "5 Tasks Due Today"}
              </span>
              <span className="rounded-xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#16161C] px-3 py-1 font-semibold text-rose-600 dark:text-rose-400">
                {isRTL ? "2 مهام متأخرة" : "2 Overdue Tasks"}
              </span>
              <span className="rounded-xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#16161C] px-3 py-1 font-semibold text-slate-700 dark:text-[#A1A1B2]">
                {isRTL ? "9 مواعيد نهائية قادمة" : "9 Upcoming Deadlines"}
              </span>
            </div>
          </div>

          {/* Action Buttons: Export + New */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => alert(isRTL ? "جاري تصدير التقرير..." : "Exporting report...")}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#2A2A38] bg-white dark:bg-[#16161C] px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#202028] transition shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>{isRTL ? "تصدير" : "Export"}</span>
            </button>

            <Link
              href="/projects/new"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>{isRTL ? "مشروع جديد" : "+ New"}</span>
            </Link>
          </div>
        </div>

        {/* 2. Top 4 Stat Cards */}
        <section aria-label="Metrics Cards">
          <DashboardStats stats={stats} />
        </section>

        {/* 3. Middle Row: Today's Tasks (Left 2/3) + Performance (Right 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Today's Tasks */}
          <section className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#16161C] p-5 shadow-xs">
            {/* Header with Title + Search + Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#22222B]">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isRTL ? "مهام اليوم" : "Today's Tasks"}
              </h2>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder={isRTL ? "بحث هنا..." : "Search here..."}
                    className="rounded-xl border border-slate-200 dark:border-[#262632] bg-slate-50 dark:bg-[#111116] py-1.5 pl-8 pr-3 rtl:pr-8 rtl:pl-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition w-36 sm:w-44"
                  />
                </div>

                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#262632] bg-slate-50 dark:bg-[#16161C] px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202028] transition"
                >
                  <Filter className="h-3 w-3" />
                  <span>{isRTL ? "تصفية" : "Filter"}</span>
                </button>
              </div>
            </div>

            {/* Table Header */}
            <div className="mt-3 grid grid-cols-12 text-[11px] font-semibold text-slate-400 dark:text-[#8E8E9F] px-3 pb-2 border-b border-slate-100 dark:border-[#1E1E26]">
              <span className="col-span-6">{isRTL ? "اسم المهمة" : "Task Name"}</span>
              <span className="col-span-3">{isRTL ? "المشروع" : "Project"}</span>
              <span className="col-span-3 text-right rtl:text-left">{isRTL ? "الاستحقاق" : "Due"}</span>
            </div>

            {/* Task Rows List */}
            <div className="divide-y divide-slate-100 dark:divide-[#1C1C24]">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-12 items-center py-3 px-3 hover:bg-slate-50 dark:hover:bg-[#1A1A22] rounded-xl transition text-xs"
                >
                  {/* Task Name */}
                  <div className="col-span-6 flex items-center gap-2.5 min-w-0 pr-2 rtl:pr-0 rtl:pl-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-300 dark:border-[#333342] bg-slate-100 dark:bg-[#202028] text-slate-400">
                      <Square className="h-3 w-3" />
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200 truncate">
                      {t.name}
                    </span>
                  </div>

                  {/* Project Tag with Colored Pill */}
                  <div className="col-span-3 flex items-center gap-1.5 min-w-0">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded ${t.color}`} />
                    <span className="text-[11px] font-medium text-slate-600 dark:text-[#A1A1B2] truncate">
                      {t.project}
                    </span>
                  </div>

                  {/* Due Date */}
                  <div className="col-span-3 text-right rtl:text-left text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {t.due}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right Card: Performance Segmented Equalizer */}
          <section className="rounded-2xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#16161C] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#22222B]">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isRTL ? "مستوى الأداء" : "Performance"}
                </h2>
              </div>

              {/* Huge Percentage + Trend */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">90%</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-[#22C55E] flex items-center">
                  ^ +15 {isRTL ? "عن الشهر الماضي" : "vs last month"}
                </span>
              </div>

              {/* Segmented Equalizer Bar Chart (Mon - Fri from Mockup) */}
              <div className="mt-6 grid grid-cols-5 gap-3 items-end pt-4">
                {performanceDays.map((item) => (
                  <div key={item.day} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      {item.score}
                    </span>

                    {/* Stacked Blue Segment Bars */}
                    <div className="flex flex-col-reverse gap-1 h-36 w-full max-w-[28px] justify-start items-center">
                      {[...Array(10)].map((_, i) => {
                        const isFilled = i < item.bars;
                        return (
                          <div
                            key={i}
                            className={`h-2 w-full rounded-sm transition-all duration-300 ${
                              isFilled
                                ? "bg-blue-600 dark:bg-blue-500 shadow-xs"
                                : "bg-slate-100 dark:bg-[#202028]"
                            }`}
                          />
                        );
                      })}
                    </div>

                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-[#22222B] text-center">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                {isRTL ? "كفاءة إنجاز المهام الأسبوعية" : "Weekly Team Deliverable Velocity"}
              </span>
            </div>
          </section>
        </div>

        {/* 4. Bottom Row: List Projects Data Table */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#16161C] p-5 shadow-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#22222B]">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isRTL ? "قائمة المشاريع" : "List Projects"}
            </h2>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder={isRTL ? "بحث هنا..." : "Search here..."}
                  className="rounded-xl border border-slate-200 dark:border-[#262632] bg-slate-50 dark:bg-[#111116] py-1.5 pl-8 pr-3 rtl:pr-8 rtl:pl-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition w-36 sm:w-44"
                />
              </div>

              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#262632] bg-slate-50 dark:bg-[#16161C] px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202028] transition"
              >
                <Filter className="h-3 w-3" />
                <span>{isRTL ? "تصفية" : "Filter"}</span>
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#1E1E26] text-[11px] font-semibold text-slate-400 dark:text-[#8E8E9F]">
                  <th className="py-2.5 px-3">{isRTL ? "اسم المشروع" : "Project Name"}</th>
                  <th className="py-2.5 px-3">{isRTL ? "الحالة" : "Status"}</th>
                  <th className="py-2.5 px-3">{isRTL ? "نسبة الإنجاز" : "Progress"}</th>
                  <th className="py-2.5 px-3">{isRTL ? "إجمالي المهام" : "Total Tasks"}</th>
                  <th className="py-2.5 px-3">{isRTL ? "الموعد النهائي" : "Due Date"}</th>
                  <th className="py-2.5 px-3">{isRTL ? "المالك" : "Owner"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1C1C24]">
                {filteredProjects.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#1A1A22] transition group"
                    >
                      {/* Project Name + Color Box */}
                      <td className="py-3 px-3">
                        <Link
                          href={`/projects/${p.id}`}
                          className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white hover:text-blue-500 transition"
                        >
                          <span className={`h-3 w-3 rounded ${p.color} shrink-0`} />
                          <span className="truncate">{p.name}</span>
                        </Link>
                      </td>

                      {/* Status Outline Pill */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            p.statusKey === "done"
                              ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                              : p.statusKey === "on_hold"
                              ? "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                              : "border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {p.status}
                        </span>
                      </td>

                      {/* Segmented Progress Indicator (|||||||||| 75%) from mockup */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(10)].map((_, i) => {
                              const activeSegments = Math.round((p.progress / 100) * 10);
                              const isFilled = i < activeSegments;
                              return (
                                <span
                                  key={i}
                                  className={`h-3.5 w-1 rounded-xs ${
                                    isFilled
                                      ? "bg-blue-600 dark:bg-blue-500"
                                      : "bg-slate-200 dark:bg-[#252530]"
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {p.progress}%
                          </span>
                        </div>
                      </td>

                      {/* Total Tasks */}
                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {p.totalTasks}
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {p.dueDate}
                      </td>

                      {/* Owner with Avatar */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-[#282836] text-[10px] font-bold text-slate-800 dark:text-white shrink-0">
                            {p.ownerAvatar}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {p.ownerName}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}

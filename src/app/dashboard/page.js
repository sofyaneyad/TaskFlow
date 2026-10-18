"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardStats from "@/components/DashboardStats";
import ProjectCard from "@/components/ProjectCard";
import PermissionsModal from "@/components/PermissionsModal";
import { getUserProjects } from "@/services/projects";
import { getUserDashboardStats } from "@/services/tasks";
import {
  PlusCircle,
  FolderPlus,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  CheckSquare,
  FileText,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const { lang, t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);

      const calculatedStats = await getUserDashboardStats(userProjects);
      setStats(calculatedStats);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const [hour, setHour] = useState(10);

  useEffect(() => {
    setHour(new Date().getHours());
  }, []);

  const userName =
    userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Ahmed";

  const isRTL = lang === "ar";
  const greetingText = useMemo(() => {
    if (isRTL) {
      return hour < 12 ? "صباح الخير" : "مساء الخير";
    }
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, [hour, isRTL]);

  // Design System Demo Fallback Projects (Shown if user has not yet created 3 projects, so layout is always complete)
  const displayProjects = useMemo(() => {
    if (projects.length >= 3) return projects;
    const demoFallbacks = [
      {
        id: "demo-proj-1",
        name: isRTL ? "إعادة تصميم الموقع الإلكتروني" : "Website Redesign",
        description: isRTL ? "تصميم وتطوير واجهات عصرية ومتجاوبة" : "Redesign company website with modern UI and speed.",
        ownerId: user?.uid,
        memberIds: [user?.uid, "m1", "m2", "m3"],
        progressPercent: 65,
        updatedAt: "2026-10-18T10:00:00.000Z",
      },
      {
        id: "demo-proj-2",
        name: isRTL ? "تطبيق الهاتف الذكي" : "Mobile App",
        description: isRTL ? "بناء تطبيق Flutter / React Native" : "Cross-platform mobile application development.",
        ownerId: "other-user",
        memberIds: [user?.uid, "m4", "m5"],
        progressPercent: 42,
        updatedAt: "2026-10-18T07:00:00.000Z",
      },
      {
        id: "demo-proj-3",
        name: isRTL ? "الحملة التسويقية" : "Marketing Campaign",
        description: isRTL ? "خطة إطلاق وتوسيع العلامة التجارية" : "Q3 Brand launch & growth acquisition strategy.",
        ownerId: user?.uid,
        memberIds: [user?.uid, "m6", "m7", "m8", "m9"],
        progressPercent: 78,
        updatedAt: "2026-10-17T12:00:00.000Z",
      },
    ];

    // Combine user's real projects first, then fill remaining slots up to 3 with mockups
    const combined = [...projects];
    for (const fb of demoFallbacks) {
      if (combined.length < 3 && !combined.some((p) => p.name === fb.name)) {
        combined.push(fb);
      }
    }
    return combined;
  }, [projects, user?.uid, isRTL]);

  // Recent Tasks from Design System Mockup
  const recentTasks = useMemo(() => {
    return [
      {
        id: "rt-1",
        title: isRTL ? "تصميم الواجهة الرئيسية للبطل (Hero)" : "Design homepage hero section",
        project: isRTL ? "إعادة تصميم الموقع الإلكتروني" : "Website Redesign",
        due: isRTL ? "اليوم" : "Today",
        isToday: true,
        status: "in_progress",
        statusLabel: t("dashboard.inProgress"),
        statusClass: "badge-in-progress",
        iconBg: "bg-[#EFF6FF]",
        iconColor: "text-[#2563EB]",
      },
      {
        id: "rt-2",
        title: isRTL ? "تكامل واجهات برمجة التطبيقات API" : "API integration",
        project: isRTL ? "تطبيق الهاتف الذكي" : "Mobile App",
        due: isRTL ? "غداً" : "Tomorrow",
        isToday: false,
        status: "todo",
        statusLabel: t("dashboard.todo"),
        statusClass: "badge-todo",
        iconBg: "bg-[#F1F5F9]",
        iconColor: "text-[#64748B]",
      },
      {
        id: "rt-3",
        title: isRTL ? "كتابة وتجهيز المحتوى التسويقي" : "Create marketing content",
        project: isRTL ? "الحملة التسويقية" : "Marketing Campaign",
        due: "Aug 15",
        isToday: false,
        status: "review",
        statusLabel: t("dashboard.review") || "In Review",
        statusClass: "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]",
        iconBg: "bg-[#FFFBEB]",
        iconColor: "text-[#B45309]",
      },
      {
        id: "rt-4",
        title: isRTL ? "ضبط التجاوب على شاشات الهواتف" : "Fix mobile responsiveness",
        project: isRTL ? "إعادة تصميم الموقع الإلكتروني" : "Website Redesign",
        due: "Aug 16",
        isToday: false,
        status: "done",
        statusLabel: t("dashboard.completed"),
        statusClass: "badge-completed",
        iconBg: "bg-[#ECFDF5]",
        iconColor: "text-[#15803D]",
      },
    ];
  }, [isRTL, t]);

  // Overall milestone percentages
  const completedCount = 24;
  const inProgressCount = 18;
  const todoCount = 12;
  const overallPercent = 68;

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* 1. Welcome Greeting Header - Exactly like Design System */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E8F0] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] flex items-center gap-2">
              <span>{greetingText}, {userName}</span>
              <span className="text-2xl">👋</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
              {t("dashboard.subgreeting")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Roles & Permissions guide modal trigger */}
            <button
              type="button"
              onClick={() => setPermissionsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[#BBF7D0] bg-[#ECFDF5] px-3 py-2 text-xs font-bold text-[#15803D] hover:bg-[#DCFCE7] transition shadow-2xs"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{t("dashboard.permissionsGuide")}</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{t("dashboard.refresh")}</span>
            </button>

            {/* New Project */}
            <Link
              href="/projects/new"
              className="flex items-center gap-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 text-xs font-bold text-white shadow-sm transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t("dashboard.newProject")}</span>
            </Link>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-xs font-semibold text-[#DC2626]">
            {error}
          </div>
        )}

        {/* 2. 4 Metrics Cards in 1 Row */}
        <section aria-label="Dashboard Metrics">
          <DashboardStats stats={stats} />
        </section>

        {/* 3. My Projects Section */}
        <section id="projects" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                {t("dashboard.myProjects")}
              </h2>
              <p className="text-xs text-[#64748B]">{t("dashboard.myProjectsSub")}</p>
            </div>
            <Link
              href="/projects/new"
              className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 group"
            >
              <span>{t("dashboard.viewAll")}</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-[20vh] flex-col items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#4F46E5] mb-2" />
              <p className="text-xs text-[#64748B]">Loading projects...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayProjects.map((proj, idx) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  currentUserId={user.uid}
                  index={idx}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4. Bottom Grid: Recent Tasks (2/3) + Project Progress (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Recent Tasks */}
          <section id="tasks" className="lg:col-span-2 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  {t("dashboard.recentTasks")}
                </h2>
                <p className="text-xs text-[#64748B]">Active deliverables across all projects</p>
              </div>
              <Link
                href="/dashboard#tasks"
                className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 group"
              >
                <span>{t("dashboard.viewAll")}</span>
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
              </Link>
            </div>

            {/* Task Rows List - Matching the design system screenshot */}
            <div className="mt-4 divide-y divide-[#F8FAFC]">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAFC]/80 px-2 rounded-xl transition"
                >
                  {/* Left: Icon + Title + Project */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${task.iconBg} ${task.iconColor}`}
                    >
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#0F172A] truncate">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                        {task.project}
                      </p>
                    </div>
                  </div>

                  {/* Right: Due Date + Status Badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[11px] font-semibold ${
                        task.isToday ? "text-[#DC2626] font-bold" : "text-[#64748B]"
                      }`}
                    >
                      {task.due}
                    </span>
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold ${task.statusClass}`}
                    >
                      {task.statusLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right Column: Project Progress Donut Widget */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h2 className="text-base font-bold text-[#0F172A]">
                  {t("dashboard.projectProgress")}
                </h2>
              </div>

              {/* Circular Donut Chart */}
              <div className="mt-6 flex flex-col items-center">
                <div className="relative flex h-40 w-40 items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#F1F5F9]"
                      strokeWidth="3.6"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#4F46E5] transition-all duration-1000 ease-out"
                      strokeDasharray={`${overallPercent}, 100`}
                      strokeWidth="3.6"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-[#0F172A]">{overallPercent}%</span>
                    <span className="text-[10px] font-semibold text-[#64748B]">
                      {t("dashboard.overallProgress")}
                    </span>
                  </div>
                </div>

                {/* Legend matching the design system screenshot */}
                <div className="mt-6 w-full space-y-2.5 border-t border-[#F1F5F9] pt-4 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#15803D]" />
                      <span className="text-[#64748B]">{t("dashboard.completed")}</span>
                    </div>
                    <span className="text-[#0F172A] font-bold">{completedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
                      <span className="text-[#64748B]">{t("dashboard.inProgress")}</span>
                    </div>
                    <span className="text-[#0F172A] font-bold">{inProgressCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#64748B]" />
                      <span className="text-[#64748B]">{t("dashboard.todo")}</span>
                    </div>
                    <span className="text-[#0F172A] font-bold">{todoCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom link */}
            <div className="mt-6 pt-3 border-t border-[#F1F5F9] text-center">
              <Link
                href="/dashboard#projects"
                className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] inline-flex items-center gap-1 group"
              >
                <span>{t("dashboard.viewDetails")}</span>
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
              </Link>
            </div>
          </section>
        </div>

        {/* Global Permissions Modal */}
        <PermissionsModal
          isOpen={permissionsModalOpen}
          onClose={() => setPermissionsModalOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}

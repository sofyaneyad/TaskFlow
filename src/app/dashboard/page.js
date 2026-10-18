"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardStats from "@/components/DashboardStats";
import ProjectCard from "@/components/ProjectCard";
import { getUserProjects, syncRemoteProjects } from "@/services/projects";
import { getUserDashboardStats } from "@/services/tasks";
import {
  Plus,
  Search,
  FolderKanban,
  AlertTriangle,
  Clock,
  ArrowRight,
  ListTodo,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const { lang, t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectSearch, setProjectSearch] = useState("");

  useEffect(() => {
    try {
      const rawProjects = localStorage.getItem("taskflow_local_projects");
      if (rawProjects) {
        const parsed = JSON.parse(rawProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
          setLoading(false);
        }
      }
      const rawStats = localStorage.getItem("taskflow_dashboard_stats");
      if (rawStats) {
        const parsedStats = JSON.parse(rawStats);
        if (parsedStats) setStats(parsedStats);
      }
    } catch {}
  }, []);

  const scrollToProjects = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    setProjectSearch("");
    const el = document.getElementById("projects");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-2", "ring-[#059669]", "rounded-2xl", "transition-all", "duration-500");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-[#059669]");
      }, 1200);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Fetch user projects immediately (returns cached at 0ms, or fetches remote)
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);
      setLoading(false);

      // Background remote sync in case of updates on other sessions/devices
      syncRemoteProjects(user.uid)
        .then((latest) => {
          if (latest && latest.length > 0) {
            const userOnly = latest.filter((p) => p.memberIds && p.memberIds.includes(user.uid));
            setProjects(userOnly);
          }
        })
        .catch(() => {});

      // 2. Compute task stats asynchronously without blocking project rendering
      getUserDashboardStats(userProjects)
        .then((calculatedStats) => {
          setStats(calculatedStats);
          try {
            localStorage.setItem("taskflow_dashboard_stats", JSON.stringify(calculatedStats));
          } catch {}
        })
        .catch((err) => {
          console.error("Dashboard stats error:", err);
        });
    } catch (err) {
      console.error("Dashboard error:", err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle hash navigation to #projects on mount or hash change
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#projects") {
        setTimeout(() => {
          const el = document.getElementById("projects");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 80);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Filter user's real projects (Hooks must be called unconditionally)
  const filteredProjects = useMemo(() => {
    if (!projectSearch.trim()) return projects;
    return projects.filter((p) =>
      p.name?.toLowerCase().includes(projectSearch.toLowerCase().trim())
    );
  }, [projects, projectSearch]);

  const recentTasks = useMemo(() => {
    return stats?.allTasks?.slice(0, 8) || [];
  }, [stats]);

  const userName =
    userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "User";
  const isRTL = lang === "ar";

  if (!user) {
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* 1. Header: Enclosed Welcome Banner Card */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Action on Left (in RTL left side) */}
          <div className="order-2 md:order-1 shrink-0">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap shadow-xs bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#0E2A1B] dark:hover:bg-[#133B26] dark:text-[#00D084] dark:border dark:border-[#17432B]"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>{t("dashboard.newProject")}</span>
            </Link>
          </div>

          {/* User Info & Avatar on Right */}
          <div className="order-1 md:order-2 flex items-center gap-4 min-w-0">
            <div className="min-w-0 text-right rtl:text-right ltr:text-left">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172A] dark:text-[#FFFFFF] truncate">
                {t("dashboard.welcomeUser") || "مرحباً بك،"}{" "}
                <span className="text-[#059669] dark:text-[#00D084]">{userName}</span>
              </h1>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#7B9A89] line-clamp-1">
                {t("dashboard.dashboardSub") || "لوحة التحكم المركزية لمتابعة مشاريعك وإنجاز مهام فريقك بكفاءة وسلاسة."}
              </p>
            </div>

            <div className="relative shrink-0">
              {user?.photoURL || userProfile?.photoURL ? (
                <img
                  src={user?.photoURL || userProfile?.photoURL}
                  alt={userName}
                  referrerPolicy="no-referrer"
                  className="h-13 w-13 rounded-2xl object-cover ring-2 ring-[#CBD5E1] dark:ring-[#17432B] shadow-xs shrink-0"
                />
              ) : (
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#059669] dark:bg-[#00A86B] text-base font-bold text-white shadow-xs shrink-0 ring-2 ring-[#CBD5E1] dark:ring-[#17432B]">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Status Verification Badge */}
              <div className="absolute -bottom-1 -right-1 rtl:-right-1 rtl:-left-auto ltr:-left-1 ltr:-right-auto flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#059669] dark:bg-[#00D084] text-white ring-2 ring-white dark:ring-[#0B1F14]">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Top Metric Cards (Driven by 100% Real User Data) */}
        <section aria-label="Metrics Cards">
          <DashboardStats
            stats={stats}
            projectsCount={projects.length}
            onProjectsClick={scrollToProjects}
          />
        </section>

        {/* 3. Overdue Tasks Alert */}
        {stats?.overdueTasks && stats.overdueTasks.length > 0 && (
          <section className="rounded-2xl border border-amber-300 dark:border-[#423612] bg-amber-50/80 dark:bg-[#272210]/40 p-5 shadow-xs">
            <div className="flex items-center gap-2.5 text-amber-900 dark:text-[#FBBF24] font-bold text-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-[#F59E0B]" />
              <h2>{t("dashboard.overdueAlertTitle") || "مهام متأخرة تتطلب انتباهك"} ({stats.overdueTasks.length})</h2>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.overdueTasks.map((t) => (
                <Link
                  key={t.id}
                  href={`/projects/${t.projectId}`}
                  className="rounded-xl border border-amber-200 dark:border-[#423612] bg-white dark:bg-[#0B1F14] p-3 text-xs hover:border-amber-400 dark:hover:border-[#F59E0B] transition flex flex-col justify-between"
                >
                  <div>
                    <span className="font-bold text-[#0F172A] dark:text-[#FFFFFF] line-clamp-1">{t.title}</span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#7B9A89] mt-0.5 block">{t.projectName}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-amber-700 dark:text-[#FBBF24] font-semibold">
                    <span>{t.dueDate || "Overdue"}</span>
                    <span className="uppercase">{t.priority}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 4. My Projects Section */}
        <section id="projects" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight text-[#0F172A] dark:text-[#FFFFFF]">
                {t("dashboard.myProjects")}
              </h2>
              <span className="rounded-full bg-[#ECFDF5] dark:bg-[#0E2E1D] px-2.5 py-0.5 text-xs font-bold text-[#059669] dark:text-[#00D084]">
                {projects.length}
              </span>
              <Link
                href="/projects"
                className="text-xs font-bold text-[#059669] dark:text-[#00D084] hover:underline flex items-center gap-0.5 ml-2 rtl:ml-0 rtl:mr-2"
              >
                <span>{t("dashboard.viewAll") || "عرض الكل"}</span>
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </Link>
            </div>

            {/* Projects Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B] dark:text-[#7B9A89]" />
              <input
                type="text"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder={t("dashboard.searchProjectsPlaceholder") || "بحث في المشاريع..."}
                className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#06130B] py-2 pl-8 pr-3 rtl:pl-3 rtl:pr-8 text-xs text-[#0F172A] dark:text-[#FFFFFF] placeholder-[#64748B]/60 dark:placeholder-[#7B9A89]/60 focus:border-[#059669] dark:focus:border-[#00D084] focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Projects Rendering */}
          {loading && filteredProjects.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] p-5 shadow-2xs animate-pulse space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-[#F1F5F9] dark:bg-[#0E2E1D]" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 rounded bg-[#F1F5F9] dark:bg-[#0E2E1D]" />
                      <div className="h-3 w-1/3 rounded bg-[#F1F5F9] dark:bg-[#0E2E1D]" />
                    </div>
                  </div>
                  <div className="h-3 w-full rounded bg-[#F1F5F9] dark:bg-[#0E2E1D]" />
                  <div className="h-2 w-full rounded-full bg-[#F1F5F9] dark:bg-[#0E2E1D]" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] p-12 text-center">
              <FolderKanban className="mx-auto h-12 w-12 text-[#64748B]/40 dark:text-[#7B9A89]/40" />
              <h3 className="mt-3 text-sm font-bold text-[#0F172A] dark:text-[#FFFFFF]">
                {projectSearch.trim() ? t("dashboard.noProjectsFound") : t("dashboard.noProjects")}
              </h3>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#7B9A89] max-w-sm mx-auto">
                {projectSearch.trim()
                  ? (t("dashboard.noProjectsFoundSub") || "لم يتم العثور على مشاريع مطابقة للبحث.")
                  : (t("dashboard.noProjectsSub") || "قم بإنشاء أول مشروع لتنظيم المهام ومتابعة الإنجاز.")}
              </p>
              {!projectSearch.trim() && (
                <div className="mt-5">
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] dark:bg-[#00A86B] dark:hover:bg-[#00925D] text-white px-4 py-2 text-xs font-bold shadow-xs transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t("dashboard.newProject")}</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project, idx) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  currentUserId={user?.uid || ""}
                  index={idx}
                />
              ))}
            </div>
          )}
        </section>

        {/* 5. Recent Tasks Section */}
        {recentTasks.length > 0 && (
          <section className="rounded-2xl border border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#133020]">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-[#059669] dark:text-[#00D084]" />
                <h2 className="text-sm font-extrabold text-[#0F172A] dark:text-[#FFFFFF]">
                  {t("dashboard.recentTasksTitle") || "المهام الأخيرة عبر المشاريع"}
                </h2>
              </div>
              <span className="text-xs text-[#64748B] dark:text-[#7B9A89] font-semibold">
                {recentTasks.length} {t("project.total") || "الإجمالي"}
              </span>
            </div>

            <div className="divide-y divide-[#E2E8F0] dark:divide-[#133020]">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-[#F8FAFC] dark:hover:bg-[#0E281A] rounded-xl px-2 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        task.status === "done"
                          ? "bg-[#059669] dark:bg-[#00D084]"
                          : task.status === "in_progress"
                          ? "bg-amber-500"
                          : task.status === "review"
                          ? "bg-indigo-500"
                          : "bg-[#64748B]/40 dark:bg-[#7B9A89]/40"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/projects/${task.projectId}`}
                        className="text-xs font-bold text-[#0F172A] dark:text-[#FFFFFF] hover:text-[#059669] dark:hover:text-[#00D084] transition truncate block"
                      >
                        {task.title}
                      </Link>
                      <p className="text-[11px] text-[#64748B] dark:text-[#7B9A89] truncate">
                        {task.projectName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs shrink-0">
                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B] dark:text-[#7B9A89] whitespace-nowrap shrink-0">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                      </span>
                    )}
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap shrink-0 ${
                        task.priority === "high"
                          ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40"
                          : task.priority === "medium"
                          ? "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] dark:bg-[#272210] dark:text-[#F59E0B] dark:border-[#423612]"
                          : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#0E2E1D] dark:text-[#00D084] dark:border-[#15442A]"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <Link
                      href={`/projects/${task.projectId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition whitespace-nowrap bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] dark:bg-[#0E2A1B] dark:hover:bg-[#133B26] dark:text-[#00D084] dark:border-[#15442A]"
                    >
                      <span>{t("dashboard.openAction") || "فتح"}</span>
                      <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </ProtectedRoute>
  );
}

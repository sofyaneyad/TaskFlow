"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardStats from "@/components/DashboardStats";
import ProjectCard from "@/components/ProjectCard";
import { getUserProjects, syncRemoteProjects } from "@/services/projects";
import { getUserDashboardStats } from "@/services/tasks";
import { formatFriendlyDate } from "@/utils/date";
import {
  Plus,
  Search,
  FolderKanban,
  AlertTriangle,
  Clock,
  ArrowRight,
  ListTodo,
  Calendar,
  Bell,
} from "lucide-react";

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const { lang, t } = useLanguage();
  const [projects, setProjects] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const uid = localStorage.getItem("taskflow_auth_uid");
        if (uid) {
          const raw = localStorage.getItem(`taskflow_projects_${uid}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
          }
        }
      } catch {}
    }
    return [];
  });
  const [stats, setStats] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const uid = localStorage.getItem("taskflow_auth_uid");
        if (uid) {
          const raw = localStorage.getItem(`taskflow_stats_${uid}`);
          if (raw) return JSON.parse(raw);
        }
      } catch {}
    }
    return null;
  });
  const [showOverdueAlert, setShowOverdueAlert] = useState(true);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const uid = localStorage.getItem("taskflow_auth_uid");
        if (uid) {
          const raw = localStorage.getItem(`taskflow_projects_${uid}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return false;
          }
        }
      } catch {}
    }
    return true;
  });
  const [projectSearch, setProjectSearch] = useState("");

  const getPriorityBadgeText = (priority) => {
    if (priority === "high") return t("task.priorityHigh") || t("task.highPriority");
    if (priority === "low") return t("task.priorityLow") || t("task.lowPriority");
    return t("task.priorityMedium") || t("task.mediumPriority");
  };

  const scrollToProjects = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    setProjectSearch("");
    const el = document.getElementById("projects");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  const loadData = useCallback(async (force = false) => {
    if (!user?.uid) return;
    if (isFetchingRef.current) return;

    const now = Date.now();
    // Throttle repeated background calls to at least 4 seconds apart unless forced
    if (!force && now - lastFetchTimeRef.current < 4000) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;

    try {
      // 1. Fetch user projects immediately (returns cached at 0ms, or fetches remote)
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);
      setLoading(false);

      // 2. Compute task stats asynchronously from cache
      const calculatedStats = await getUserDashboardStats(userProjects);
      setStats(calculatedStats);
      try {
        localStorage.setItem(`taskflow_stats_${user.uid}`, JSON.stringify(calculatedStats));
      } catch {}

      // 3. Background remote sync in case of updates on other sessions/devices
      syncRemoteProjects(user.uid)
        .then((latest) => {
          if (Array.isArray(latest)) {
            setProjects(latest);
            getUserDashboardStats(latest)
              .then((updatedStats) => {
                setStats(updatedStats);
                try {
                  localStorage.setItem(`taskflow_stats_${user.uid}`, JSON.stringify(updatedStats));
                } catch {}
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    } catch (err) {
      console.error("Dashboard error:", err);
      setLoading(false);
    } finally {
      isFetchingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      if (isSubscribed) await loadData(true);
    })();

    // Auto-refresh stats smoothly every 20 seconds ONLY if the tab is visible
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadData(false);
      }
    }, 20000);

    const handleFocus = () => {
      loadData(false);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
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
    userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || t("common.user");
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
        <div className="rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* User Info & Avatar (On Right in RTL) */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="shrink-0">
              {user?.photoURL || userProfile?.photoURL ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user?.photoURL || userProfile?.photoURL}
                  alt={userName}
                  referrerPolicy="no-referrer"
                  className="h-13 w-13 rounded-2xl object-cover shadow-xs shrink-0"
                />
              ) : (
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#2563EB] text-base font-bold text-white shadow-xs shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#09090B] dark:text-[#F4F4F5] truncate">
                {t("dashboard.welcomeUser")}{" "}
                <span className="text-[#2563EB] dark:text-[#60A5FA]">{userName}</span>
              </h1>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#A1A1AA] line-clamp-1">
                {t("dashboard.dashboardSub")}
              </p>
            </div>
          </div>

          {/* Action Buttons (On Left in RTL) */}
          <div className="shrink-0 flex items-center gap-2">
            {stats?.overdueTasks && stats.overdueTasks.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowOverdueAlert((prev) => !prev);
                  if (!showOverdueAlert) {
                    setTimeout(() => {
                      document.getElementById("overdue-alerts")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition whitespace-nowrap shadow-xs cursor-pointer ${
                  showOverdueAlert
                    ? "border-amber-400 bg-amber-500/15 text-amber-700 dark:text-[#FDE047] dark:border-amber-500/40"
                    : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141416] text-[#64748B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white"
                }`}
                title={lang === "ar" ? "تنبيهات المهام المتأخرة" : "Overdue task alerts"}
              >
                <Bell className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{lang === "ar" ? "تنبيهات المهام" : "Task Alerts"}</span>
                <span className="inline-flex items-center justify-center h-4.5 min-w-4.5 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white font-sans tabular-nums select-none leading-none shrink-0 text-center">
                  <span className="inline-block leading-none -translate-y-[0.5px]">{stats.overdueTasks.length}</span>
                </span>
              </button>
            )}

            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap shadow-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8]"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>{t("dashboard.newProject")}</span>
            </Link>
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

        {/* 3. Overdue Tasks Alert (Fitted snugly to content with white date text) */}
        {showOverdueAlert && stats?.overdueTasks && stats.overdueTasks.length > 0 && (
          <section id="overdue-alerts" className="w-fit max-w-full rounded-2xl border border-amber-300 dark:border-[#452A12] bg-amber-50/80 dark:bg-[#1F170D]/50 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-[#FDE047] font-bold text-xs sm:text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-[#F59E0B] shrink-0" />
              <h2>{t("dashboard.overdueAlertTitle")} ({stats.overdueTasks.length})</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {stats.overdueTasks.map((t) => (
                <Link
                  key={t.id}
                  href={`/projects/${t.projectId}`}
                  className="rounded-xl border border-amber-200 dark:border-[#452A12] bg-white dark:bg-[#141416] p-3 text-xs hover:border-amber-400 dark:hover:border-[#F59E0B] transition flex flex-col justify-between min-w-[210px] max-w-xs shadow-2xs"
                >
                  <div>
                    <span className="font-bold text-[#09090B] dark:text-[#F4F4F5] line-clamp-1">{t.title}</span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#A1A1AA] mt-0.5 block">{t.projectName}</span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-amber-700 dark:text-[#FDE047] font-semibold gap-3">
                    <span className="text-[#09090B] dark:text-white font-medium">{t.dueDate || t("dashboard.overdueBadge")}</span>
                    <span className="font-bold">{getPriorityBadgeText(t.priority)}</span>
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
              <h2 className="text-lg font-extrabold tracking-tight text-[#09090B] dark:text-[#F4F4F5]">
                {t("dashboard.myProjects")}
              </h2>
              <span className="inline-flex items-center justify-center rounded-full bg-[#EFF6FF] dark:bg-[#18181B] px-2.5 py-0.5 text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] font-sans tabular-nums leading-none select-none text-center">
                <span className="inline-block leading-none -translate-y-[0.5px]">{projects.length}</span>
              </span>
              <Link
                href="/projects"
                className="text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] hover:underline flex items-center gap-0.5 ml-2 rtl:ml-0 rtl:mr-2"
              >
                <span>{t("dashboard.viewAll")}</span>
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </Link>
            </div>

            {/* Projects Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B] dark:text-[#A1A1AA]" />
              <input
                type="text"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder={t("dashboard.searchProjectsPlaceholder")}
                className="w-full rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] py-2 pl-8 pr-3 rtl:pl-3 rtl:pr-8 text-xs text-[#09090B] dark:text-[#F4F4F5] placeholder-[#64748B]/60 dark:placeholder-[#A1A1AA]/60 focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Projects Rendering */}
          {loading && filteredProjects.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-5 shadow-2xs animate-pulse space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-[#F1F3F5] dark:bg-[#1F1F23]" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 rounded bg-[#F1F3F5] dark:bg-[#1F1F23]" />
                      <div className="h-3 w-1/3 rounded bg-[#F1F3F5] dark:bg-[#1F1F23]" />
                    </div>
                  </div>
                  <div className="h-3 w-full rounded bg-[#F1F3F5] dark:bg-[#1F1F23]" />
                  <div className="h-2 w-full rounded-full bg-[#F1F3F5] dark:bg-[#1F1F23]" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-solid border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-12 text-center">
              <FolderKanban className="mx-auto h-12 w-12 text-[#64748B]/40 dark:text-[#A1A1AA]/40" />
              <h3 className="mt-3 text-sm font-bold text-[#09090B] dark:text-[#F4F4F5]">
                {projectSearch.trim() ? t("dashboard.noProjectsFound") : t("dashboard.noProjects")}
              </h3>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#A1A1AA] max-w-sm mx-auto">
                {projectSearch.trim()
                  ? t("dashboard.noProjectsFoundSub")
                  : t("dashboard.noProjectsSub")}
              </p>
              {!projectSearch.trim() && (
                <div className="mt-5">
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 text-xs font-bold shadow-xs transition"
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
          <section className="rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-[#2563EB] dark:text-[#60A5FA]" />
                <h2 className="text-sm font-extrabold text-[#09090B] dark:text-[#F4F4F5]">
                  {t("dashboard.recentTasksTitle")}
                </h2>
              </div>
              <span className="text-xs text-[#64748B] dark:text-[#A1A1AA] font-semibold">
                {recentTasks.length} {t("project.total")}
              </span>
            </div>

            <div className="divide-y divide-[#DCE3DC] dark:divide-[#28332D]">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-[#F8F9FA] dark:hover:bg-[#27272A] rounded-xl px-2 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        task.status === "done"
                          ? "bg-[#2563EB] dark:bg-[#3B82F6]"
                          : task.status === "in_progress"
                          ? "bg-amber-500"
                          : task.status === "review"
                          ? "bg-indigo-500"
                          : "bg-[#5F7367]/40 dark:bg-[#8EA194]/40"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/projects/${task.projectId}`}
                        className="text-xs font-bold text-[#09090B] dark:text-[#F4F4F5] hover:text-[#2563EB] dark:hover:text-[#93C5FD] transition truncate block"
                      >
                        {task.title}
                      </Link>
                      <p className="text-[11px] text-[#64748B] dark:text-[#A1A1AA] truncate">
                        {task.projectName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs shrink-0">
                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#09090B] dark:text-white whitespace-nowrap shrink-0">
                        <Calendar className="h-3 w-3 text-[#2563EB] dark:text-white" />
                        {formatFriendlyDate(task.dueDate, lang)}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[10px] font-bold whitespace-nowrap shrink-0 ${
                        task.priority === "high"
                          ? "bg-red-500/10 text-red-700 border border-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30"
                          : task.priority === "medium"
                          ? "bg-amber-500/10 text-amber-800 border border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30"
                          : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:border-zinc-700/60"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          task.priority === "high"
                            ? "bg-red-500"
                            : task.priority === "medium"
                            ? "bg-amber-500"
                            : "bg-slate-400 dark:bg-zinc-500"
                        }`}
                      />
                      {getPriorityBadgeText(task.priority)}
                    </span>
                    <Link
                      href={`/projects/${task.projectId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition whitespace-nowrap bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE] dark:bg-[#1F1F23] dark:hover:bg-[#27272A] dark:text-[#60A5FA] dark:border-[#27272A]"
                    >
                      <span>{t("dashboard.openAction")}</span>
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

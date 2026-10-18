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
  const [projects, setProjects] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("taskflow_local_projects");
        if (raw) {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        }
      } catch {}
    }
    return [];
  });
  const [stats, setStats] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("taskflow_dashboard_stats");
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("taskflow_local_projects");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return false;
        }
      } catch {}
    }
    return true;
  });
  const [projectSearch, setProjectSearch] = useState("");

  const scrollToProjects = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    setProjectSearch("");
    const el = document.getElementById("projects");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-2", "ring-[#166534]", "rounded-2xl", "transition-all", "duration-500");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-[#166534]");
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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-8">
        {/* 1. Header: Clean Greeting + Avatar + Action */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            {user?.photoURL || userProfile?.photoURL ? (
              <img
                src={user?.photoURL || userProfile?.photoURL}
                alt={userName}
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-2xl object-cover ring-2 ring-[#C8DAC9] dark:ring-[#26372D] shadow-xs shrink-0"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#166534] text-base font-bold text-white shadow-xs shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl sm:text-3xl font-extrabold tracking-tight text-[#26332B] dark:text-[#FAF9F6] truncate">
                {t("dashboard.welcomeUser") || "Welcome back"}, {userName}
              </h1>
              <p className="mt-1 text-xs text-[#5E7164] dark:text-[#8EA393] line-clamp-1">
                {t("dashboard.dashboardSub") || "Centralized dashboard for tracking projects and task milestones."}
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#166534] hover:bg-[#14532D] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition whitespace-nowrap"
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

        {/* 3. Overdue Tasks Alert (Earth Gold Palette) */}
        {stats?.overdueTasks && stats.overdueTasks.length > 0 && (
          <section className="rounded-2xl border border-[#CA8A04]/40 dark:border-[#6B5424] bg-[#FAF5E8]/80 dark:bg-[#6B5424]/20 p-5 shadow-xs">
            <div className="flex items-center gap-2.5 text-[#854D0E] dark:text-[#FACC15] font-bold text-sm">
              <AlertTriangle className="h-5 w-5 text-[#CA8A04]" />
              <h2>{t("dashboard.overdueAlertTitle") || "Overdue Tasks Requiring Attention"} ({stats.overdueTasks.length})</h2>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.overdueTasks.map((t) => (
                <Link
                  key={t.id}
                  href={`/projects/${t.projectId}`}
                  className="rounded-xl border border-[#CA8A04]/30 dark:border-[#6B5424]/40 bg-white dark:bg-[#17221C] p-3 text-xs hover:border-[#CA8A04] transition flex flex-col justify-between"
                >
                  <div>
                    <span className="font-bold text-[#26332B] dark:text-[#FAF9F6] line-clamp-1">{t.title}</span>
                    <span className="text-[11px] text-[#5E7164] dark:text-[#8EA393] mt-0.5 block">{t.projectName}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#854D0E] dark:text-[#FACC15] font-semibold">
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
              <h2 className="text-lg font-extrabold tracking-tight text-[#26332B] dark:text-[#FAF9F6]">
                {t("dashboard.myProjects")}
              </h2>
              <span className="rounded-full bg-[#E8EFE9] dark:bg-[#1E2E24] px-2.5 py-0.5 text-xs font-bold text-[#166534] dark:text-[#86A789]">
                {projects.length}
              </span>
            </div>

            {/* Projects Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5E7164] dark:text-[#8EA393]" />
              <input
                type="text"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder={t("dashboard.searchProjectsPlaceholder") || "Search projects..."}
                className="w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] py-2 pl-8 pr-3 rtl:pl-3 rtl:pr-8 text-xs text-[#26332B] dark:text-[#FAF9F6] placeholder-[#5E7164]/60 dark:placeholder-[#8EA393]/60 focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Projects Rendering */}
          {loading && filteredProjects.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-5 shadow-2xs animate-pulse space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-[#E8EFE9] dark:bg-[#1E2E24]" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 rounded bg-[#E5EBE5] dark:border-[#26372D] bg-[#E8EFE9] dark:bg-[#1E2E24]" />
                      <div className="h-3 w-1/3 rounded bg-[#E5EBE5] dark:border-[#26372D] bg-[#E8EFE9] dark:bg-[#1E2E24]" />
                    </div>
                  </div>
                  <div className="h-3 w-full rounded bg-[#E8EFE9] dark:bg-[#1E2E24]" />
                  <div className="h-2 w-full rounded-full bg-[#E8EFE9] dark:bg-[#1E2E24]" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-12 text-center">
              <FolderKanban className="mx-auto h-12 w-12 text-[#86A789]/60" />
              <h3 className="mt-3 text-sm font-bold text-[#26332B] dark:text-[#FAF9F6]">
                {projectSearch.trim() ? t("dashboard.noProjectsFound") : t("dashboard.noProjects")}
              </h3>
              <p className="mt-1 text-xs text-[#5E7164] dark:text-[#8EA393] max-w-sm mx-auto">
                {projectSearch.trim()
                  ? (t("dashboard.noProjectsFoundSub") || "No projects matched your search keyword.")
                  : (t("dashboard.noProjectsSub") || "Create your first project to organize tasks, track deadlines, and collaborate with your team.")}
              </p>
              {!projectSearch.trim() && (
                <div className="mt-5">
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#166534] hover:bg-[#14532D] px-4 py-2 text-xs font-bold text-white shadow-xs transition"
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
          <section className="rounded-2xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5] dark:border-[#26372D]">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-[#166534] dark:text-[#86A789]" />
                <h2 className="text-sm font-extrabold text-[#26332B] dark:text-[#FAF9F6]">
                  {t("dashboard.recentTasksTitle") || "Recent Tasks Across Projects"}
                </h2>
              </div>
              <span className="text-xs text-[#5E7164] dark:text-[#8EA393] font-semibold">
                {recentTasks.length} {t("project.total")}
              </span>
            </div>

            <div className="divide-y divide-[#E5EBE5] dark:divide-[#26372D]">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26] rounded-xl px-2 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        task.status === "done"
                          ? "bg-[#166534]"
                          : task.status === "in_progress"
                          ? "bg-[#86A789]"
                          : task.status === "review"
                          ? "bg-amber-500"
                          : "bg-[#5E7164]/40"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/projects/${task.projectId}`}
                        className="text-xs font-bold text-[#26332B] dark:text-[#FAF9F6] hover:text-[#166534] dark:hover:text-[#86A789] transition truncate block"
                      >
                        {task.title}
                      </Link>
                      <p className="text-[11px] text-[#5E7164] dark:text-[#8EA393] truncate">
                        {task.projectName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs shrink-0">
                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#5E7164] dark:text-[#8EA393] whitespace-nowrap shrink-0">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap shrink-0 ${
                        task.priority === "high"
                          ? "bg-[#FAF5E8] dark:bg-[#6B5424]/30 text-[#854D0E] dark:text-[#FACC15] border border-[#CA8A04]/40 dark:border-[#6B5424]"
                          : task.priority === "medium"
                          ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
                          : "bg-[#E8EFE9] dark:bg-[#1E2E24] text-[#166534] dark:text-[#86A789]"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <Link
                      href={`/projects/${task.projectId}`}
                      className="text-xs font-bold text-[#166534] dark:text-[#86A789] hover:underline flex items-center gap-0.5 whitespace-nowrap shrink-0"
                    >
                      <span>{t("dashboard.openAction") || "Open"}</span>
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

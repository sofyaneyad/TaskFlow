"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardStats from "@/components/DashboardStats";
import ProjectCard from "@/components/ProjectCard";
import { getUserProjects } from "@/services/projects";
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
    userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "User";
  const isRTL = lang === "ar";

  // Filter user's real projects
  const filteredProjects = useMemo(() => {
    if (!projectSearch.trim()) return projects;
    return projects.filter((p) =>
      p.name?.toLowerCase().includes(projectSearch.toLowerCase().trim())
    );
  }, [projects, projectSearch]);

  const recentTasks = useMemo(() => {
    return stats?.allTasks?.slice(0, 8) || [];
  }, [stats]);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-8">
        {/* 1. Header: Clean Greeting + Action (No duplicate pills) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#26332B] dark:text-[#FAF9F6]">
              {isRTL ? `مرحباً بك، ${userName}` : `Welcome back, ${userName}`}
            </h1>
            <p className="mt-1 text-xs text-[#5E7164] dark:text-[#8EA393]">
              {isRTL
                ? "لوحة التحكم المركزية لمتابعة مشاريعك وإنجاز مهام فريقك."
                : "Your centralized dashboard for tracking projects and task milestones."}
            </p>
          </div>

          {/* Primary Action Button */}
          <div>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#166534] hover:bg-[#14532D] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition"
            >
              <Plus className="h-4 w-4" />
              <span>{t("dashboard.newProject")}</span>
            </Link>
          </div>
        </div>

        {/* 2. Top Metric Cards (Driven by 100% Real User Data) */}
        <section aria-label="Metrics Cards">
          <DashboardStats stats={stats} />
        </section>

        {/* 3. Overdue Tasks Alert (Visible only if user actually has overdue tasks) */}
        {stats?.overdueTasks && stats.overdueTasks.length > 0 && (
          <section className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-5 shadow-xs">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertTriangle className="h-5 w-5" />
              <h2>{isRTL ? "مهام متأخرة تحتاج إلى اتخاذ إجراء" : "Overdue Tasks Requiring Attention"} ({stats.overdueTasks.length})</h2>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.overdueTasks.map((t) => (
                <Link
                  key={t.id}
                  href={`/projects/${t.projectId}`}
                  className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#16161C] p-3 text-xs hover:border-rose-400 transition flex flex-col justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{t.title}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">{t.projectName}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
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
                placeholder={isRTL ? "بحث في المشاريع..." : "Search projects..."}
                className="w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] py-2 pl-8 pr-3 rtl:pl-3 rtl:pr-8 text-xs text-[#26332B] dark:text-[#FAF9F6] placeholder-[#5E7164]/60 dark:placeholder-[#8EA393]/60 focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Projects Rendering */}
          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-12 text-center">
              <FolderKanban className="mx-auto h-12 w-12 text-[#86A789]/60" />
              <h3 className="mt-3 text-sm font-bold text-[#26332B] dark:text-[#FAF9F6]">
                {projectSearch.trim() ? t("dashboard.noProjectsFound") : (isRTL ? "لا توجد مشاريع حتى الآن" : "No projects created yet")}
              </h3>
              <p className="mt-1 text-xs text-[#5E7164] dark:text-[#8EA393] max-w-sm mx-auto">
                {projectSearch.trim()
                  ? (isRTL ? "لم يتم العثور على أي مشروع يطابق بحثك." : "No projects matched your search keyword.")
                  : (isRTL ? "ابدأ بإنشاء أول مشروع لك لإدارة المهام ومشاركتها مع فريقك." : "Create your first project to organize tasks, track deadlines, and collaborate with your team.")}
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
                  currentUserId={user.uid}
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
                  {isRTL ? "المهام الأخيرة عبر المشاريع" : "Recent Tasks Across Projects"}
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
                  <div className="flex items-center gap-3">
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
                    <div>
                      <Link
                        href={`/projects/${task.projectId}`}
                        className="text-xs font-bold text-[#26332B] dark:text-[#FAF9F6] hover:text-[#166534] dark:hover:text-[#86A789] transition line-clamp-1"
                      >
                        {task.title}
                      </Link>
                      <p className="text-[11px] text-[#5E7164] dark:text-[#8EA393]">
                        {task.projectName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 text-xs">
                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#5E7164] dark:text-[#8EA393]">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        task.priority === "high"
                          ? "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
                          : task.priority === "medium"
                          ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
                          : "bg-[#E8EFE9] dark:bg-[#1E2E24] text-[#166534] dark:text-[#86A789]"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <Link
                      href={`/projects/${task.projectId}`}
                      className="text-xs font-bold text-[#166534] dark:text-[#86A789] hover:underline flex items-center gap-0.5"
                    >
                      <span>{isRTL ? "فتح" : "Open"}</span>
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

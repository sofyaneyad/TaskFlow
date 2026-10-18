"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardStats from "@/components/DashboardStats";
import ProjectCard from "@/components/ProjectCard";
import { getUserProjects } from "@/services/projects";
import { getUserDashboardStats } from "@/services/tasks";
import { PlusCircle, FolderPlus, AlertTriangle, ArrowRight, Loader2, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

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

  const userName = userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "there";

  // Calculate overall progress percentage
  const totalTasks = stats?.totalTasks || 0;
  const completedTasks = stats?.doneTasks || 0;
  const inProgressTasks = stats?.inProgressTasks || 0;
  const todoTasks = stats?.todoTasks || 0;
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 68;

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header from TaskFlow Design System */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E8F0] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] flex items-center gap-2">
              Good morning, {userName} <span className="text-2xl">👋</span>
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Here&apos;s what&apos;s happening with your projects today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <Link
              href="/projects/new"
              className="flex items-center gap-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 text-xs font-semibold text-white shadow-sm transition"
            >
              <PlusCircle className="h-4 w-4" /> New Project
            </Link>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-xs font-semibold text-[#DC2626]">
            {error}
          </div>
        )}

        {/* 4 Metrics Cards */}
        <section aria-label="Dashboard Metrics">
          <DashboardStats stats={stats} />
        </section>

        {/* Main Content Grid: Projects on Left, Progress Widget on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Column (Takes 2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">My Projects</h2>
                <p className="text-xs text-[#64748B]">Projects you own or participate in</p>
              </div>
              <Link
                href="/projects/new"
                className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1"
              >
                <span>Create new</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="flex min-h-[30vh] flex-col items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-[#4F46E5] mb-2" />
                <p className="text-xs text-[#64748B]">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-white p-12 text-center">
                <FolderPlus className="mx-auto h-12 w-12 text-[#94A3B8]" />
                <h3 className="mt-3 text-base font-bold text-[#0F172A]">No projects yet</h3>
                <p className="mt-1 text-xs text-[#64748B] max-w-sm mx-auto">
                  Get started by creating your first project, or have a teammate add your email.
                </p>
                <div className="mt-5">
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 text-xs font-semibold text-white shadow-sm"
                  >
                    <PlusCircle className="h-4 w-4" /> Create First Project
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <ProjectCard
                    key={proj.id}
                    project={proj}
                    currentUserId={user.uid}
                  />
                ))}
              </div>
            )}

            {/* Overdue Tasks Alert (if any) */}
            {stats?.overdueTasks && stats.overdueTasks.length > 0 && (
              <section aria-label="Overdue Tasks Warning" className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2]/60 p-5">
                <div className="flex items-center gap-2 text-[#DC2626] font-bold text-sm mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Action Needed: {stats.overdueTasks.length} Overdue {stats.overdueTasks.length === 1 ? "Task" : "Tasks"}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stats.overdueTasks.map((ot) => (
                    <div key={ot.id} className="rounded-xl border border-[#FECACA] bg-white p-3.5 shadow-2xs flex flex-col justify-between">
                      <div>
                        <span className="badge-overdue text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          {ot.projectName}
                        </span>
                        <h4 className="mt-1 font-bold text-[#0F172A] text-xs line-clamp-1">{ot.title}</h4>
                        <p className="text-[11px] text-[#DC2626] font-medium mt-1">
                          Deadline: {ot.dueDate ? new Date(ot.dueDate).toLocaleDateString() : "Overdue"}
                        </p>
                      </div>
                      <Link
                        href={`/projects/${ot.projectId}`}
                        className="mt-3 flex items-center justify-between text-xs font-semibold text-[#DC2626] hover:text-rose-700"
                      >
                        <span>Fix in project</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Project Progress Sidebar Widget (from TaskFlow Design System) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs">
              <h2 className="text-base font-bold text-[#0F172A]">Project Progress</h2>
              <p className="text-xs text-[#64748B]">Overall milestone completion rate</p>

              {/* Circular Chart Representation */}
              <div className="mt-6 flex flex-col items-center">
                <div className="relative flex h-36 w-36 items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#F1F5F9]"
                      strokeWidth="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#4F46E5] transition-all duration-1000 ease-out"
                      strokeDasharray={`${overallPercent}, 100`}
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-[#0F172A]">{overallPercent}%</span>
                    <span className="text-[10px] font-semibold text-[#64748B]">Overall Progress</span>
                  </div>
                </div>

                {/* Progress Breakdown Legend */}
                <div className="mt-6 w-full space-y-2.5 border-t border-[#F1F5F9] pt-4 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#15803D]" />
                      <span className="text-[#64748B]">Completed</span>
                    </div>
                    <span className="text-[#0F172A]">{completedTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
                      <span className="text-[#64748B]">In Progress</span>
                    </div>
                    <span className="text-[#0F172A]">{inProgressTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#64748B]" />
                      <span className="text-[#64748B]">To Do</span>
                    </div>
                    <span className="text-[#0F172A]">{todoTasks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

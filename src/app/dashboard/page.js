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
  const { user } = useAuth();
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
      // 1. Fetch user projects
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);

      // 2. Fetch stats across accessible projects
      const calculatedStats = await getUserDashboardStats(userProjects);
      setStats(calculatedStats);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError("Failed to load dashboard data. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Workspace Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of your active projects, team deliverables, and overdue tasks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none"
              title="Refresh dashboard data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <Link
              href="/projects/new"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition"
            >
              <PlusCircle className="h-4 w-4" /> New Project
            </Link>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading workspace metrics...</p>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {/* Stats Overview */}
            <section aria-label="Dashboard Metrics">
              <DashboardStats stats={stats} />
            </section>

            {/* Overdue Tasks Section (if any) */}
            {stats?.overdueTasks && stats.overdueTasks.length > 0 && (
              <section aria-label="Overdue Tasks Warning" className="rounded-xl border border-rose-200 bg-rose-50/60 p-5">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-3">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span>Attention Required: {stats.overdueTasks.length} Overdue {stats.overdueTasks.length === 1 ? "Task" : "Tasks"}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {stats.overdueTasks.map((ot) => (
                    <div key={ot.id} className="rounded-lg border border-rose-200 bg-white p-3.5 shadow-xs flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          {ot.projectName}
                        </span>
                        <h4 className="mt-1 font-semibold text-slate-900 text-sm line-clamp-1">{ot.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Deadline: {ot.dueDate ? new Date(ot.dueDate).toLocaleDateString() : "Passed"}
                        </p>
                      </div>
                      <Link
                        href={`/projects/${ot.projectId}`}
                        className="mt-3 flex items-center justify-between text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        <span>Resolve in project</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects Section */}
            <section aria-label="Your Projects">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Your Projects ({projects.length})</h2>
              </div>

              {projects.length === 0 ? (
                /* Empty State (FR-15) */
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                  <FolderPlus className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-3 text-base font-semibold text-slate-900">No projects yet</h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    Get started by creating your first project, or have a project owner add your email to their team.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/projects/new"
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none"
                    >
                      <PlusCircle className="h-4 w-4" /> Create First Project
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((proj) => (
                    <ProjectCard
                      key={proj.id}
                      project={proj}
                      currentUserId={user.uid}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

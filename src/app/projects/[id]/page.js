"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import FilterBar from "@/components/FilterBar";
import TaskCard from "@/components/TaskCard";
import TaskModal from "@/components/TaskModal";
import { getProjectById, getProjectMembersDetails } from "@/services/projects";
import {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
  isTaskOverdue,
} from "@/services/tasks";
import {
  Folder,
  Settings,
  Plus,
  Users,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  ListTodo,
  AlertOctagon,
  ShieldAlert,
  Kanban,
  LayoutGrid,
} from "lucide-react";

function ProjectDetailsContent() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [project, setProject] = useState(() => {
    if (typeof window !== "undefined" && projectId) {
      try {
        const raw = localStorage.getItem("taskflow_local_projects");
        if (raw) {
          const list = JSON.parse(raw);
          return list.find((p) => p.id === projectId) || null;
        }
      } catch {}
    }
    return null;
  });
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState(() => {
    if (typeof window !== "undefined" && projectId) {
      try {
        const raw = localStorage.getItem("taskflow_tasks_" + projectId);
        return raw ? JSON.parse(raw) : [];
      } catch {}
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // View Mode: 'kanban' or 'grid'
  const [viewMode, setViewMode] = useState("kanban");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalDefaultStatus, setModalDefaultStatus] = useState("todo");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Load project, members, and tasks
  const loadProjectData = useCallback(async () => {
    if (!projectId || !user) return;
    if (!project) setLoading(true);
    setError("");
    setAccessDenied(false);
    setNotFound(false);

    try {
      const proj = await getProjectById(projectId);
      if (!proj) {
        setNotFound(true);
        return;
      }

      if ((!proj.memberIds || !proj.memberIds.includes(user?.uid)) && proj.ownerId !== user?.uid) {
        setAccessDenied(true);
        return;
      }

      setProject(proj);

      const memberDetails = await getProjectMembersDetails(proj.memberIds);
      setMembers(memberDetails);

      const projectTasks = await getProjectTasks(projectId);
      setTasks(projectTasks);
    } catch (err) {
      console.error("Error loading project:", err);
      setError("errLoadProject");
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  // Handle Create or Update Task (Instant optimistic UI)
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const updated = {
          ...editingTask,
          ...taskData,
          updatedAt: new Date().toISOString(),
          isOverdue: isTaskOverdue(taskData.dueDate, taskData.status),
        };
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
        updateTask(projectId, editingTask.id, taskData).catch((err) =>
          console.warn("Background updateTask error:", err)
        );
      } else {
        const tempId = "t_" + Date.now();
        const newTask = {
          id: tempId,
          ...taskData,
          projectId,
          createdBy: user?.uid || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isOverdue: isTaskOverdue(taskData.dueDate, taskData.status),
        };
        setTasks((prev) => [newTask, ...prev]);
        createTask(projectId, taskData, user?.uid || "")
          .then((actual) => {
            if (actual && actual.id) {
              setTasks((prev) => prev.map((t) => (t.id === tempId ? actual : t)));
            }
          })
          .catch((err) => console.warn("Background createTask error:", err));
      }
    } catch (err) {
      console.error("Save task error:", err);
      throw err;
    }
  };

  // Handle Quick Status Change from card (Instant optimistic UI)
  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            isOverdue: isTaskOverdue(t.dueDate, newStatus),
          };
        }
        return t;
      })
    );
    updateTask(projectId, taskId, { status: newStatus }).catch((err) => {
      console.warn("Status update background error:", err);
    });
  };

  // Handle Task Deletion (Instant optimistic UI)
  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteTask(projectId, taskId).catch((err) => {
      console.warn("Delete task background error:", err);
    });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setOverdueOnly(false);
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase().trim();
        if (!task.title.toLowerCase().includes(queryLower)) {
          return false;
        }
      }

      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }

      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }

      if (assigneeFilter === "unassigned") {
        if (task.assigneeId) return false;
      } else if (assigneeFilter !== "all") {
        if (assigneeFilter === project?.ownerId) {
          if (task.assigneeId !== project?.ownerId) return false;
        } else {
          if (task.assigneeId === project?.ownerId) return false;
        }
      }

      if (overdueOnly) {
        if (!task.isOverdue) return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, overdueOnly]);

  const todoTasks = useMemo(() => filteredTasks.filter((t) => t.status === "todo"), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter((t) => t.status === "in_progress"), [filteredTasks]);
  const reviewTasks = useMemo(() => filteredTasks.filter((t) => t.status === "review" || t.status === "in_review"), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter((t) => t.status === "done"), [filteredTasks]);

  const isOwner = project?.ownerId === user?.uid;

  if (!user) {
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );
  }

  if (loading && !project) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#059669] dark:text-[#00D084] mb-2" />
          <p className="text-xs text-[#64748B] dark:text-[#7B9A89] font-medium">{t("common.loadingWorkspace") || "Loading project workspace..."}</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (notFound) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <AlertOctagon className="mx-auto h-12 w-12 text-[#64748B] dark:text-[#7B9A89]/60" />
          <h2 className="mt-3 text-lg font-bold text-[#0F172A] dark:text-[#FFFFFF]">{t("project.projectNotFound")}</h2>
          <p className="mt-1 text-xs text-[#64748B] dark:text-[#7B9A89]">
            {t("project.projectNotFoundSub")}
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#059669] hover:bg-[#047857] dark:bg-[#00A86B] dark:hover:bg-[#00D084] dark:hover:text-[#06130B] px-4 py-2 text-xs font-semibold text-white shadow-xs transition"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("project.returnToDashboard")}
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (accessDenied) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-[#D97706] dark:text-[#F59E0B]" />
          <h2 className="mt-3 text-lg font-bold text-[#0F172A] dark:text-[#FFFFFF]">{t("project.accessDenied")}</h2>
          <p className="mt-1 text-xs text-[#64748B] dark:text-[#7B9A89]">
            {t("project.accessDeniedSub")}
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#059669] hover:bg-[#047857] dark:bg-[#00A86B] dark:hover:bg-[#00D084] dark:hover:text-[#06130B] px-4 py-2 text-xs font-semibold text-white shadow-xs transition"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("project.returnToDashboard")}
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] dark:text-[#7B9A89] hover:text-[#059669] dark:hover:text-[#00D084] transition"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("project.backToDashboard")}
        </Link>

        {/* Project Header Banner */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669] dark:bg-[#0D281A] dark:text-[#00D084] shrink-0 mt-0.5">
                  <Folder className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#FFFFFF] break-words">
                      {project.name}
                    </h1>
                    {isOwner ? (
                      <span className="badge-owner inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold shrink-0">
                        <ShieldCheck className="h-3.5 w-3.5" /> {t("project.owner")}
                      </span>
                    ) : (
                      <span className="badge-member inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold shrink-0">
                        {t("project.member")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#7B9A89] mt-1 max-w-2xl leading-relaxed">
                    {project.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Members Pill List */}
              <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#133020]">
                <span className="flex items-center gap-1 text-xs font-semibold text-[#64748B] dark:text-[#7B9A89] mr-1 rtl:mr-0 rtl:ml-1 shrink-0">
                  <Users className="h-3.5 w-3.5 text-[#059669] dark:text-[#00D084]" /> {t("project.teamMembers")}:
                </span>
                <span className="inline-flex items-center rounded-lg bg-[#F1F5F9] dark:bg-[#133020] px-2.5 py-1 text-xs font-medium text-[#0F172A] dark:text-[#FFFFFF] shrink-0">
                  عضو (مالك)
                </span>
                <span className="inline-flex items-center rounded-lg bg-[#F1F5F9] dark:bg-[#133020] px-2.5 py-1 text-xs font-medium text-[#0F172A] dark:text-[#FFFFFF] shrink-0">
                  عضو
                </span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
              {isOwner && (
                <Link
                  href={`/projects/${project.id}/settings`}
                  className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#06130B] px-3.5 py-2 text-xs font-semibold text-[#0F172A] dark:text-[#FFFFFF] hover:bg-[#F1F5F9] dark:hover:bg-[#133020] transition shadow-xs whitespace-nowrap"
                >
                  <Settings className="h-3.5 w-3.5 text-[#64748B] dark:text-[#7B9A89]" /> {t("project.settings")}
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setModalDefaultStatus("todo");
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] dark:bg-[#00A86B] dark:hover:bg-[#00D084] dark:hover:text-[#06130B] px-4 py-2 text-xs font-bold text-white shadow-xs transition whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> {t("project.createTask")}
              </button>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="rounded-xl border border-[#F59E0B]/30 bg-[#FEF3C7] dark:bg-[#242211] p-4 text-xs font-semibold text-[#92400E] dark:text-[#F59E0B]">
            {t(`project.${error}`) || error}
          </div>
        )}

        {/* Filter Bar with Search and View Mode Switcher */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* View Mode Toggle: Kanban Board vs Grid List */}
            <div className="inline-flex items-center rounded-xl bg-[#F8FAFC] dark:bg-[#06130B] p-1 border border-[#E2E8F0] dark:border-[#133020] shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                  viewMode === "kanban"
                    ? "bg-[#FFFFFF] dark:bg-[#0B1F14] text-[#059669] dark:text-[#00D084] shadow-xs"
                    : "text-[#64748B] dark:text-[#7B9A89] hover:text-[#0F172A] dark:hover:text-[#FFFFFF]"
                }`}
              >
                <Kanban className="h-3.5 w-3.5" />
                <span>{t("project.kanbanView")}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                  viewMode === "grid"
                    ? "bg-[#FFFFFF] dark:bg-[#0B1F14] text-[#059669] dark:text-[#00D084] shadow-xs"
                    : "text-[#64748B] dark:text-[#7B9A89] hover:text-[#0F172A] dark:hover:text-[#FFFFFF]"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>{t("project.gridView")}</span>
              </button>
            </div>

            <span className="text-xs font-semibold text-[#64748B] dark:text-[#7B9A89] shrink-0">
              {t("project.total")}: {filteredTasks.length}
            </span>
          </div>

          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            assigneeFilter={assigneeFilter}
            setAssigneeFilter={setAssigneeFilter}
            overdueOnly={overdueOnly}
            setOverdueOnly={setOverdueOnly}
            members={members}
            ownerId={project?.ownerId}
            onReset={handleResetFilters}
          />
        </div>

        {/* Task Board Rendering */}
        {viewMode === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {/* 1. To Do Column */}
            <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#07160D] border border-[#E2E8F0] dark:border-[#133020] p-3.5 sm:p-4 flex flex-col min-h-[350px] sm:min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#133020]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#64748B] dark:bg-[#7B9A89]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A] dark:text-[#FFFFFF]">{t("dashboard.todo")}</h3>
                </div>
                <span className="badge-todo rounded-full px-2.5 py-0.5 text-xs font-bold">
                  {todoTasks.length}
                </span>
              </div>

              <div className="mt-3.5 space-y-3 flex-1">
                {todoTasks.length === 0 ? (
                  <p className="text-center text-xs text-[#64748B] dark:text-[#7B9A89] py-8">{t("project.noTasksInCol")}</p>
                ) : (
                  todoTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={members}
                      ownerId={project?.ownerId}
                      currentUserId={user?.uid || ""}
                      isProjectOwner={isOwner}
                      onStatusChange={handleStatusChange}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsModalOpen(true);
                      }}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setModalDefaultStatus("todo");
                  setIsModalOpen(true);
                }}
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] py-2 text-xs font-semibold text-[#64748B] dark:text-[#7B9A89] hover:text-[#059669] dark:hover:text-[#00D084] hover:border-[#059669] dark:hover:border-[#00D084] transition"
              >
                <Plus className="h-3.5 w-3.5" /> {t("project.addTask")}
              </button>
            </div>

            {/* 2. In Progress Column */}
            <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#07160D] border border-[#E2E8F0] dark:border-[#133020] p-3.5 sm:p-4 flex flex-col min-h-[350px] sm:min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#133020]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#059669] dark:bg-[#00D084]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A] dark:text-[#FFFFFF]">{t("dashboard.inProgress")}</h3>
                </div>
                <span className="badge-inprogress rounded-full px-2.5 py-0.5 text-xs font-bold">
                  {inProgressTasks.length}
                </span>
              </div>

              <div className="mt-3.5 space-y-3 flex-1">
                {inProgressTasks.length === 0 ? (
                  <p className="text-center text-xs text-[#64748B] dark:text-[#7B9A89] py-8">{t("project.noTasksInCol")}</p>
                ) : (
                  inProgressTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={members}
                      ownerId={project?.ownerId}
                      currentUserId={user?.uid || ""}
                      isProjectOwner={isOwner}
                      onStatusChange={handleStatusChange}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsModalOpen(true);
                      }}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setModalDefaultStatus("in_progress");
                  setIsModalOpen(true);
                }}
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] py-2 text-xs font-semibold text-[#64748B] dark:text-[#7B9A89] hover:text-[#059669] dark:hover:text-[#00D084] hover:border-[#059669] dark:hover:border-[#00D084] transition"
              >
                <Plus className="h-3.5 w-3.5" /> {t("project.addTask")}
              </button>
            </div>

            {/* 3. Review Column */}
            <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#07160D] border border-[#E2E8F0] dark:border-[#133020] p-3.5 sm:p-4 flex flex-col min-h-[350px] sm:min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#133020]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D97706] dark:bg-[#F59E0B]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A] dark:text-[#FFFFFF]">
                    {t("dashboard.review") || "Review"}
                  </h3>
                </div>
                <span className="badge-review rounded-full px-2.5 py-0.5 text-xs font-bold">
                  {reviewTasks.length}
                </span>
              </div>

              <div className="mt-3.5 space-y-3 flex-1">
                {reviewTasks.length === 0 ? (
                  <p className="text-center text-xs text-[#64748B] dark:text-[#7B9A89] py-8">{t("project.noTasksInCol")}</p>
                ) : (
                  reviewTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={members}
                      ownerId={project?.ownerId}
                      currentUserId={user?.uid || ""}
                      isProjectOwner={isOwner}
                      onStatusChange={handleStatusChange}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsModalOpen(true);
                      }}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setModalDefaultStatus("review");
                  setIsModalOpen(true);
                }}
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] py-2 text-xs font-semibold text-[#64748B] dark:text-[#7B9A89] hover:text-[#D97706] dark:hover:text-[#F59E0B] hover:border-[#D97706] dark:hover:border-[#F59E0B] transition"
              >
                <Plus className="h-3.5 w-3.5" /> {t("project.addTask")}
              </button>
            </div>

            {/* 4. Done Column */}
            <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#07160D] border border-[#E2E8F0] dark:border-[#133020] p-3.5 sm:p-4 flex flex-col min-h-[350px] sm:min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#133020]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#059669] dark:bg-[#00D084]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A] dark:text-[#FFFFFF]">{t("dashboard.completed")}</h3>
                </div>
                <span className="badge-done rounded-full px-2.5 py-0.5 text-xs font-bold">
                  {doneTasks.length}
                </span>
              </div>

              <div className="mt-3.5 space-y-3 flex-1">
                {doneTasks.length === 0 ? (
                  <p className="text-center text-xs text-[#64748B] dark:text-[#7B9A89] py-8">{t("project.noTasksInCol")}</p>
                ) : (
                  doneTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={members}
                      ownerId={project?.ownerId}
                      currentUserId={user?.uid || ""}
                      isProjectOwner={isOwner}
                      onStatusChange={handleStatusChange}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsModalOpen(true);
                      }}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setModalDefaultStatus("done");
                  setIsModalOpen(true);
                }}
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] py-2 text-xs font-semibold text-[#64748B] dark:text-[#7B9A89] hover:text-[#059669] dark:hover:text-[#00D084] hover:border-[#059669] dark:hover:border-[#00D084] transition"
              >
                <Plus className="h-3.5 w-3.5" /> {t("project.addTask")}
              </button>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.length === 0 ? (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] p-12 text-center">
                <ListTodo className="mx-auto h-10 w-10 text-[#64748B] dark:text-[#7B9A89]" />
                <h3 className="mt-2 text-sm font-bold text-[#0F172A] dark:text-[#FFFFFF]">{t("project.noTasksFound")}</h3>
                <p className="mt-1 text-xs text-[#64748B] dark:text-[#7B9A89]">{t("project.noTasksSub")}</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  members={members}
                  ownerId={project?.ownerId}
                  currentUserId={user?.uid || ""}
                  isProjectOwner={isOwner}
                  onStatusChange={handleStatusChange}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </div>
        )}

        {/* Task Creation & Edit Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          onSubmit={handleSaveTask}
          task={editingTask}
          initialData={editingTask ? editingTask : { status: modalDefaultStatus }}
          defaultStatus={modalDefaultStatus}
          members={members}
          ownerId={project?.ownerId}
        />
      </div>
    </ProtectedRoute>
  );
}

export default function ProjectDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#059669] dark:text-[#00D084] mb-2" />
          <p className="text-xs text-[#64748B] dark:text-[#7B9A89] font-medium">Loading project workspace...</p>
        </div>
      }
    >
      <ProjectDetailsContent />
    </Suspense>
  );
}

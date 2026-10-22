"use client";

import { useEffect, useState, useMemo, useCallback, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import FilterBar from "@/components/FilterBar";
import TaskCard from "@/components/TaskCard";
import TaskModal from "@/components/TaskModal";
import { getProjectById, getProjectMembersDetails, calculateTasksProgress } from "@/services/projects";
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
  const { lang, t } = useLanguage();
  const router = useRouter();
  const isRTL = lang === "ar";

  // Drag & Drop State
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [undoToast, setUndoToast] = useState(null);

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

  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);
  const isFetchingRef = useRef(false);

  // Live weighted project progress based on tasks
  const projectProgress = useMemo(() => {
    return calculateTasksProgress(tasks);
  }, [tasks]);

  // Load project, members, and tasks
  const loadProjectData = useCallback(async () => {
    if (!projectId || !user) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!projectRef.current) setLoading(true);
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
        if (user?.uid) {
          proj.memberIds = Array.from(new Set([...(proj.memberIds || []), user.uid]));
          if (!proj.ownerId) proj.ownerId = user.uid;
        }
      }

      setProject(proj);

      const memberDetails = await getProjectMembersDetails(proj.memberIds, projectId);
      setMembers(memberDetails);
      const cleanUids = memberDetails.map((m) => m.uid);
      setProject((prev) => (prev ? { ...prev, memberIds: cleanUids } : prev));

      const projectTasks = await getProjectTasks(projectId);
      setTasks(projectTasks);
    } catch (err) {
      console.error("Error loading project:", err);
      if (!projectRef.current) {
        setError("errLoadProject");
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [projectId, user]);

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      if (isSubscribed) await loadProjectData();
    })();
    return () => {
      isSubscribed = false;
    };
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
        const consistentTaskId = "task_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
        const newTask = {
          id: consistentTaskId,
          ...taskData,
          projectId,
          createdBy: user?.uid || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isOverdue: isTaskOverdue(taskData.dueDate, taskData.status),
        };
        setTasks((prev) => [newTask, ...prev]);
        createTask(projectId, taskData, user?.uid || "", consistentTaskId)
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

  // Drag & Drop Handlers for Kanban Board
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverCol === colId) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== targetStatus) {
      const prevStatus = task.status;
      handleStatusChange(taskId, targetStatus);
      setUndoToast({
        taskId,
        prevStatus,
        title: task.title,
      });
      setTimeout(() => {
        setUndoToast((current) => (current?.taskId === taskId ? null : current));
      }, 5000);
    }
    setDraggedTaskId(null);
  };

  const handleUndoDrop = () => {
    if (!undoToast) return;
    handleStatusChange(undoToast.taskId, undoToast.prevStatus);
    setUndoToast(null);
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
        const matchesTitle = task.title?.toLowerCase().includes(queryLower);
        const matchesDesc = task.description?.toLowerCase().includes(queryLower);
        if (!matchesTitle && !matchesDesc) {
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
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, overdueOnly, project?.ownerId]);

  const todoTasks = useMemo(() => filteredTasks.filter((t) => t.status === "todo"), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter((t) => t.status === "in_progress"), [filteredTasks]);
  const reviewTasks = useMemo(() => filteredTasks.filter((t) => t.status === "review" || t.status === "in_review"), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter((t) => t.status === "done"), [filteredTasks]);

  const kanbanColumns = useMemo(
    () => [
      {
        id: "todo",
        title: t("dashboard.todo"),
        dotColor: "bg-[#5F7367] dark:bg-[#8EA194]",
        badgeClass: "badge-todo",
        tasks: todoTasks,
        showAddButton: true, // Only in todo!
      },
      {
        id: "in_progress",
        title: t("dashboard.inProgress"),
        dotColor: "bg-[#2563EB] dark:bg-[#3B82F6]",
        badgeClass: "badge-inprogress",
        tasks: inProgressTasks,
        showAddButton: false, // Removed!
      },
      {
        id: "review",
        title: t("dashboard.review"),
        dotColor: "bg-[#D97706] dark:bg-[#FBBF24]",
        badgeClass: "badge-review",
        tasks: reviewTasks,
        showAddButton: false, // Removed!
      },
      {
        id: "done",
        title: t("dashboard.completed"),
        dotColor: "bg-[#2563EB] dark:bg-[#3B82F6]",
        badgeClass: "badge-done",
        tasks: doneTasks,
        showAddButton: false, // Removed!
      },
    ],
    [t, todoTasks, inProgressTasks, reviewTasks, doneTasks]
  );

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
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB] dark:text-[#60A5FA] mb-2" />
          <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] font-medium">{t("common.loadingWorkspace")}</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (notFound) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <AlertOctagon className="mx-auto h-12 w-12 text-[#64748B] dark:text-[#A1A1AA]/60" />
          <h2 className="mt-3 text-lg font-bold text-[#09090B] dark:text-[#F4F4F5]">{t("project.projectNotFound")}</h2>
          <p className="mt-1 text-xs text-[#64748B] dark:text-[#A1A1AA]">
            {t("project.projectNotFoundSub")}
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white shadow-xs transition"
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
          <ShieldAlert className="mx-auto h-12 w-12 text-[#D97706] dark:text-[#FDE047]" />
          <h2 className="mt-3 text-lg font-bold text-[#09090B] dark:text-[#F4F4F5]">{t("project.accessDenied")}</h2>
          <p className="mt-1 text-xs text-[#64748B] dark:text-[#A1A1AA]">
            {t("project.accessDeniedSub")}
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white shadow-xs transition"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("project.returnToDashboard")}
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <AlertOctagon className="mx-auto h-12 w-12 text-[#D97706] dark:text-[#FDE047]" />
          <h2 className="mt-3 text-lg font-bold text-[#09090B] dark:text-[#F4F4F5]">
            {error ? (t(`project.${error}`) || error) : t("project.projectNotFound")}
          </h2>
          <p className="mt-1 text-xs text-[#64748B] dark:text-[#A1A1AA]">
            {t("project.projectNotFoundSub")}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => loadProjectData()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
            >
              {t("common.retry")}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] px-4 py-2 text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] hover:bg-[#F1F3F5] dark:hover:bg-[#27272A] transition"
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#2563EB] dark:hover:text-[#93C5FD] transition"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("project.backToDashboard")}
        </Link>

        {/* Project Header Banner */}
        <div className="rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-[#18181B] dark:text-[#60A5FA] shrink-0 mt-0.5">
                  <Folder className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#09090B] dark:text-[#F4F4F5] break-words">
                      {project?.name}
                    </h1>
                    {isOwner ? (
                      <span className="badge-owner inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold shrink-0 !text-white">
                        <ShieldCheck className="h-3.5 w-3.5 text-white" /> {t("project.owner")}
                      </span>
                    ) : (
                      <span className="badge-member inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold shrink-0">
                        {t("project.member")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] mt-1 max-w-2xl leading-relaxed">
                    {project?.description || t("project.noDescription")}
                  </p>
                </div>
              </div>

              {/* Members Pill List */}
              <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-[#E4E4E7] dark:border-[#27272A]">
                <span className="flex items-center gap-1 text-xs font-semibold text-[#64748B] dark:text-[#A1A1AA] mr-1 rtl:mr-0 rtl:ml-1 shrink-0">
                  <Users className="h-3.5 w-3.5 text-[#2563EB] dark:text-[#60A5FA]" /> {t("project.teamMembers")}:
                </span>
                {members.length > 0 ? (
                  members.map((member) => {
                    const isMemberOwner = member.uid === project?.ownerId;
                    return (
                      <span
                        key={member.uid}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#F1F3F5] dark:bg-[#1F1F23] px-2.5 py-1 text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] shrink-0"
                      >
                        <span className="h-2 w-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6]" />
                        {member.displayName || member.email?.split("@")[0] || t("project.member")}
                        {isMemberOwner && (
                          <span className="text-[10px] text-[#2563EB] dark:text-[#60A5FA] font-bold">
                            ({t("project.owner")})
                          </span>
                        )}
                      </span>
                    );
                  })
                ) : (
                  <span className="inline-flex items-center rounded-lg bg-[#F1F3F5] dark:bg-[#1F1F23] px-2.5 py-1 text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] shrink-0">
                    {user?.displayName || user?.email?.split("@")[0] || t("common.user")} ({t("project.owner")})
                  </span>
                )}
              </div>

              {/* Live Project Progress Bar */}
              {tasks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#E4E4E7] dark:border-[#27272A] max-w-md">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#64748B] dark:text-[#A1A1AA] flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6]" />
                      {t("dashboard.projectProgress")}
                    </span>
                    <span className="text-[#2563EB] dark:text-[#60A5FA] font-black">{projectProgress.progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F1F3F5] dark:bg-[#09090B] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2563EB] dark:bg-[#3B82F6] transition-all duration-500 ease-out"
                      style={{ width: `${projectProgress.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
              {isOwner && (
                <Link
                  href={`/projects/${project.id}/settings`}
                  className="flex items-center gap-1.5 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#09090B] px-3.5 py-2 text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] hover:bg-[#F1F3F5] dark:hover:bg-[#27272A] transition shadow-xs whitespace-nowrap"
                >
                  <Settings className="h-3.5 w-3.5 text-[#64748B] dark:text-[#A1A1AA]" /> {t("project.settings")}
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setModalDefaultStatus("todo");
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-xs hover:shadow-sm transition-all duration-150 whitespace-nowrap cursor-pointer"
              >
                <Plus className="h-4 w-4" /> {t("project.createTask")}
              </button>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="rounded-xl border border-[#F59E0B]/30 bg-[#FEF3C7] dark:bg-[#1F170D] p-4 text-xs font-semibold text-[#92400E] dark:text-[#FDE047] animate-in fade-in duration-200">
            {t(`project.${error}`) || error}
          </div>
        )}

        {/* Filter Bar with Search and View Mode Switcher */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* View Mode Toggle: Kanban Board vs Grid List */}
            <div className="inline-flex items-center rounded-xl bg-[#F8F9FA] dark:bg-[#09090B] p-1 border border-[#E4E4E7] dark:border-[#27272A] shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150 active:scale-95 whitespace-nowrap cursor-pointer ${
                  viewMode === "kanban"
                    ? "bg-[#FFFFFF] dark:bg-[#141416] text-[#2563EB] dark:text-[#60A5FA] shadow-xs"
                    : "text-[#64748B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#FFFFFF]"
                }`}
              >
                <Kanban className="h-3.5 w-3.5" />
                <span>{t("project.kanbanView")}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150 active:scale-95 whitespace-nowrap cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#FFFFFF] dark:bg-[#141416] text-[#2563EB] dark:text-[#60A5FA] shadow-xs"
                    : "text-[#64748B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#FFFFFF]"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>{t("project.gridView")}</span>
              </button>
            </div>

            <span className="text-xs font-semibold text-[#64748B] dark:text-[#A1A1AA] shrink-0">
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
            {kanbanColumns.map((col) => {
              const isOver = dragOverCol === col.id;
              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={(e) => handleDragLeave(e, col.id)}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`rounded-2xl border p-3.5 sm:p-4 flex flex-col min-h-[400px] sm:min-h-[520px] transition-all duration-200 ease-out ${
                    isOver
                      ? "border-2 border-dashed border-[#2563EB] dark:border-[#3B82F6] bg-[#EFF6FF]/70 dark:bg-[#18181B]/70 shadow-lg scale-[1.01]"
                      : "bg-[#F8F9FA] dark:bg-[#09090B] border-[#E4E4E7] dark:border-[#27272A]"
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-[#09090B] dark:text-[#F4F4F5]">
                        {col.title}
                      </h3>
                    </div>
                    <span className={`${col.badgeClass} inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold font-sans tabular-nums leading-none select-none text-center`}>
                      <span className="inline-block leading-none -translate-y-[0.5px]">{col.tasks.length}</span>
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="mt-3.5 space-y-3 flex-1 flex flex-col">
                    {col.tasks.length === 0 ? (
                      <div
                        className={`flex flex-col items-center justify-center py-10 flex-1 rounded-xl transition-colors duration-200 ${
                          isOver ? "bg-[#EFF6FF] dark:bg-[#141416] border-2 border-dashed border-[#2563EB] dark:border-[#3B82F6]" : ""
                        }`}
                      >
                        <p className="text-center text-xs text-[#64748B] dark:text-[#A1A1AA]">
                          {isOver ? t("project.dropTaskHere") : t("project.noTasksInCol")}
                        </p>
                      </div>
                    ) : (
                      <>
                        {col.tasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            members={members}
                            ownerId={project?.ownerId}
                            currentUserId={user?.uid || ""}
                            isProjectOwner={isOwner}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnd={handleDragEnd}
                            isDragging={draggedTaskId === task.id}
                            onStatusChange={handleStatusChange}
                            onEdit={(t) => {
                              setEditingTask(t);
                              setIsModalOpen(true);
                            }}
                            onDelete={handleDeleteTask}
                          />
                        ))}
                        {isOver && (
                          <div className="rounded-xl border-2 border-dashed border-[#2563EB] dark:border-[#3B82F6] bg-[#EFF6FF] dark:bg-[#18181B] p-3 text-center text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] animate-pulse">
                            {t("project.dropTaskHere")}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Add Task Button (ONLY shown in To Do column) */}
                  {col.showAddButton && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(null);
                        setModalDefaultStatus(col.id);
                        setIsModalOpen(true);
                      }}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] py-2.5 text-xs font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#2563EB] dark:hover:text-[#93C5FD] hover:border-[#2563EB] dark:hover:border-[#3B82F6] active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> {t("project.addTask")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-solid border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-12 text-center">
                <ListTodo className="mx-auto h-10 w-10 text-[#64748B] dark:text-[#A1A1AA]" />
                <h3 className="mt-2 text-sm font-bold text-[#09090B] dark:text-[#F4F4F5]">{t("project.noTasksFound")}</h3>
                <p className="mt-1 text-xs text-[#64748B] dark:text-[#A1A1AA]">{t("project.noTasksSub")}</p>
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
          onDelete={handleDeleteTask}
          task={editingTask}
          initialData={editingTask ? editingTask : { status: modalDefaultStatus }}
          defaultStatus={modalDefaultStatus}
          members={members}
          ownerId={project?.ownerId}
        />

        {/* Undo Toast for Drag & Drop */}
        {undoToast && (
          <div className="fixed bottom-6 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl bg-[#17221C] dark:bg-[#141416] text-white px-5 py-3 shadow-2xl border border-[#334155] dark:border-[#27272A] animate-in fade-in slide-in-from-bottom-4 duration-200">
            <span className="text-xs font-medium">
              {`${t("project.statusUpdatedFor")} "${undoToast.title}"`}
            </span>
            <button
              type="button"
              onClick={handleUndoDrop}
              className="rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-3 py-1 text-xs font-bold text-white transition cursor-pointer"
            >
              {t("project.undo")}
            </button>
            <button
              type="button"
              onClick={() => setUndoToast(null)}
              className="text-slate-400 hover:text-white text-xs transition cursor-pointer px-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function ProjectDetailsPage() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB] dark:text-[#60A5FA] mb-2" />
          <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] font-medium">{t("common.loadingWorkspace")}</p>
        </div>
      }
    >
      <ProjectDetailsContent />
    </Suspense>
  );
}

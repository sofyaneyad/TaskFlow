"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
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
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // View Mode: 'kanban' or 'grid' (matching Design System)
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
    setLoading(true);
    setError("");
    setAccessDenied(false);
    setNotFound(false);

    try {
      // 1. Fetch Project
      const proj = await getProjectById(projectId);
      if (!proj) {
        setNotFound(true);
        return;
      }

      // Check membership
      if (!proj.memberIds || !proj.memberIds.includes(user.uid)) {
        setAccessDenied(true);
        return;
      }

      setProject(proj);

      // 2. Fetch Members Details
      const memberDetails = await getProjectMembersDetails(proj.memberIds);
      setMembers(memberDetails);

      // 3. Fetch Tasks
      const projectTasks = await getProjectTasks(projectId);
      setTasks(projectTasks);
    } catch (err) {
      console.error("Error loading project:", err);
      setError("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  // Handle Create or Update Task
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await updateTask(projectId, editingTask.id, taskData);
      } else {
        await createTask(projectId, taskData, user.uid);
      }
      await loadProjectData();
    } catch (err) {
      console.error("Save task error:", err);
      throw err;
    }
  };

  // Handle Quick Status Change from card
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(projectId, taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Status update error:", err);
      setError("Failed to update status. Ensure you are authorized.");
    }
  };

  // Handle Task Deletion
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(projectId, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Delete task error:", err);
      setError("Failed to delete task.");
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setOverdueOnly(false);
  };

  // Client-Side Filtered Tasks
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
        if (task.assigneeId !== assigneeFilter) return false;
      }

      if (overdueOnly) {
        if (!task.isOverdue) return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, overdueOnly]);

  // Group tasks by status for Kanban Board
  const todoTasks = useMemo(() => filteredTasks.filter((t) => t.status === "todo"), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter((t) => t.status === "in_progress"), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter((t) => t.status === "done"), [filteredTasks]);

  const isOwner = project?.ownerId === user?.uid;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5] mb-2" />
          <p className="text-xs text-[#64748B] font-medium">Loading project workspace...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (notFound) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <AlertOctagon className="mx-auto h-12 w-12 text-[#94A3B8]" />
          <h2 className="mt-3 text-lg font-bold text-[#0F172A]">Project Not Found</h2>
          <p className="mt-1 text-xs text-[#64748B]">
            The project you are trying to view does not exist or has been deleted.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Dashboard
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
          <ShieldAlert className="mx-auto h-12 w-12 text-[#DC2626]" />
          <h2 className="mt-3 text-lg font-bold text-[#0F172A]">Access Denied</h2>
          <p className="mt-1 text-xs text-[#64748B]">
            You are not a member of this project and do not have permission to view its tasks.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Dashboard
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#4F46E5]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        {/* Project Header Banner */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <Folder className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
                      {project.name}
                    </h1>
                    {isOwner ? (
                      <span className="badge-owner inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold">
                        <ShieldCheck className="h-3.5 w-3.5" /> Owner
                      </span>
                    ) : (
                      <span className="badge-member inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold">
                        Member
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mt-1 max-w-2xl leading-relaxed">
                    {project.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Members Pill List */}
              <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-[#F1F5F9]">
                <span className="flex items-center gap-1 text-xs font-semibold text-[#64748B] mr-1">
                  <Users className="h-3.5 w-3.5" /> Team Members ({members.length}):
                </span>
                {members.map((m) => (
                  <span
                    key={m.uid}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-medium text-[#0F172A]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    {m.displayName || m.email}
                    {m.uid === project.ownerId && " (Owner)"}
                  </span>
                ))}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2.5">
              {isOwner && (
                <Link
                  href={`/projects/${project.id}/settings`}
                  className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition shadow-2xs"
                >
                  <Settings className="h-3.5 w-3.5" /> Settings
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setModalDefaultStatus("todo");
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 text-xs font-semibold text-white shadow-sm transition"
              >
                <Plus className="h-4 w-4" /> Create Task
              </button>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-xs font-semibold text-[#DC2626]">
            {error}
          </div>
        )}

        {/* Filter Bar with Search and View Mode Switcher */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {/* View Mode Toggle: Kanban Board vs Grid List */}
            <div className="inline-flex items-center rounded-xl bg-[#F1F5F9] p-1 border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "kanban"
                    ? "bg-white text-[#4F46E5] shadow-2xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Kanban className="h-3.5 w-3.5" />
                <span>لوحة المهام (Kanban)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "grid"
                    ? "bg-white text-[#4F46E5] shadow-2xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Grid View</span>
              </button>
            </div>

            <span className="text-xs font-semibold text-[#64748B]">
              Total: {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
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
            onReset={handleResetFilters}
          />
        </div>

        {/* Task Board Rendering */}
        {viewMode === "kanban" ? (
          /* Kanban Board View (Exact match to TaskFlow Design System) */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* 1. To Do Column */}
            <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#64748B]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A]">To Do</h3>
                </div>
                <span className="badge-todo rounded-full px-2.5 py-0.5 text-xs font-bold">
                  {todoTasks.length}
                </span>
              </div>

              <div className="mt-3.5 space-y-3 flex-1">
                {todoTasks.length === 0 ? (
                  <p className="text-center text-xs text-[#94A3B8] py-8">No tasks in To Do</p>
                ) : (
                  todoTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={members}
                      currentUserId={user.uid}
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

              {/* Column Add Task Button */}
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setModalDefaultStatus("todo");
                  setIsModalOpen(true);
                }}
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#CBD5E1] bg-white py-2 text-xs font-semibold text-[#64748B] hover:text-[#4F46E5] hover:border-[#4F46E5] transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add task
              </button>
            </div>

            {/* 2. In Progress Column */}
            <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A]">In Progress</h3>
                </div>
                <span className="badge-inprogress rounded-full px-2.5 py-0.5 text-xs font-bold">
                  {inProgressTasks.length}
                </span>
              </div>

              <div className="mt-3.5 space-y-3 flex-1">
                {inProgressTasks.length === 0 ? (
                  <p className="text-center text-xs text-[#94A3B8] py-8">No tasks in progress</p>
                ) : (
                  inProgressTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={members}
                      currentUserId={user.uid}
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
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#CBD5E1] bg-white py-2 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] hover:border-[#2563EB] transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add task
              </button>
            </div>

            {/* 3. Done Column */}
            <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#15803D]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A]">Done</h3>
                </div>
                <span className="badge-done rounded-full px-2.5 py-0.5 text-xs font-bold">
                  {doneTasks.length}
                </span>
              </div>

              <div className="mt-3.5 space-y-3 flex-1">
                {doneTasks.length === 0 ? (
                  <p className="text-center text-xs text-[#94A3B8] py-8">No completed tasks yet</p>
                ) : (
                  doneTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={members}
                      currentUserId={user.uid}
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
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#CBD5E1] bg-white py-2 text-xs font-semibold text-[#64748B] hover:text-[#15803D] hover:border-[#15803D] transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add task
              </button>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.length === 0 ? (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-white p-12 text-center">
                <ListTodo className="mx-auto h-10 w-10 text-[#94A3B8]" />
                <h3 className="mt-2 text-sm font-bold text-[#0F172A]">No tasks found</h3>
                <p className="mt-1 text-xs text-[#64748B]">Try resetting the filters or creating a new task.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  members={members}
                  currentUserId={user.uid}
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
          onSubmit={handleSaveTask}
          initialData={editingTask ? editingTask : { status: modalDefaultStatus }}
          members={members}
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
          <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5] mb-2" />
          <p className="text-xs text-[#64748B] font-medium">Loading project workspace...</p>
        </div>
      }
    >
      <ProjectDetailsContent />
    </Suspense>
  );
}

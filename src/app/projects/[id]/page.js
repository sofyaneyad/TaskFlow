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
  CheckCircle2,
  ListTodo,
  AlertOctagon,
  ShieldAlert,
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filters State (Client-Side Filtering per Section 10.2)
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

      // Check membership (Section 4 & 13 direct URL protection)
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
        // FR-09: Update Task
        await updateTask(projectId, editingTask.id, taskData);
      } else {
        // FR-08: Create Task
        await createTask(projectId, taskData, user.uid);
      }
      await loadProjectData();
    } catch (err) {
      console.error("Save task error:", err);
      throw err;
    }
  };

  // Handle Quick Status Change from card (US-06, TC-10)
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

  // Handle Task Deletion (FR-10)
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

  // Client-Side Filtered Tasks (FR-13, TC-11, TC-12 & Live Exercise Section 18)
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search Query on Title
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase().trim();
        if (!task.title.toLowerCase().includes(queryLower)) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }

      // 3. Priority Filter (TC-11)
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }

      // 4. Assignee Filter
      if (assigneeFilter === "unassigned") {
        if (task.assigneeId) return false;
      } else if (assigneeFilter !== "all") {
        if (task.assigneeId !== assigneeFilter) return false;
      }

      // 5. Section 18 Live Exercise: Overdue Tasks Filter
      // "shows incomplete tasks with a due date before today"
      if (overdueOnly) {
        if (!task.isOverdue) return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, overdueOnly]);

  const isOwner = project?.ownerId === user?.uid;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading project workspace...</p>
        </div>
      </ProtectedRoute>
    );
  }

  // Section 13: Project not found edge case
  if (notFound) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <AlertOctagon className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">Project Not Found</h2>
          <p className="mt-1 text-xs text-slate-500">
            The project you are trying to view does not exist or has been deleted.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Section 4 & 13: Direct URL visit by non-member (Access Denied)
  if (accessDenied) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">Access Denied</h2>
          <p className="mt-1 text-xs text-slate-500">
            You are not a member of this project and do not have permission to view its tasks.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        {/* Project Header Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {project.name}
                </h1>
                {isOwner && (
                  <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                    <ShieldCheck className="h-3.5 w-3.5" /> Owner
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 max-w-2xl">
                {project.description || "No description provided."}
              </p>

              {/* Members Pill List */}
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2">
                <span className="flex items-center gap-1 text-xs font-medium text-slate-500 mr-1">
                  <Users className="h-3.5 w-3.5" /> Team Members ({members.length}):
                </span>
                {members.map((m) => (
                  <span
                    key={m.uid}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                  >
                    {m.displayName || m.email}
                    {m.uid === project.ownerId && " (Owner)"}
                  </span>
                ))}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {isOwner && (
                <Link
                  href={`/projects/${project.id}/settings`}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none"
                >
                  <Settings className="h-3.5 w-3.5" /> Settings
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition"
              >
                <Plus className="h-4 w-4" /> Create Task
              </button>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Filter Bar (FR-13 & Section 18) */}
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

        {/* Task Cards Grid or Empty State */}
        <section aria-label="Tasks List">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Tasks ({filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"})
            </h2>
          </div>

          {filteredTasks.length === 0 ? (
            /* Empty State (FR-15, US-07) */
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <ListTodo className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-2 text-sm font-semibold text-slate-800">No tasks found</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                {tasks.length === 0
                  ? "This project doesn't have any tasks yet. Create the first task to get started."
                  : "No tasks matched your current filter criteria. Try resetting the filters."}
              </p>
              <div className="mt-5">
                {tasks.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    <Plus className="h-4 w-4" /> Add Task
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
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
              ))}
            </div>
          )}
        </section>

        {/* Task Creation & Edit Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleSaveTask}
          initialData={editingTask}
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
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading project workspace...</p>
        </div>
      }
    >
      <ProjectDetailsContent />
    </Suspense>
  );
}


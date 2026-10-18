"use client";

import { Calendar, User, AlertCircle, Trash2, Edit2, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { useState } from "react";

const PRIORITY_STYLES = {
  high: { label: "High", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  medium: { label: "Medium", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  low: { label: "Low", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
};

export default function TaskCard({
  task,
  members = [],
  currentUserId,
  isProjectOwner,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const assignee = members.find((m) => m.uid === task.assigneeId);
  const priorityInfo = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

  // Permissions based on Authorization Matrix (Section 4)
  const canEdit = isProjectOwner || task.createdBy === currentUserId || task.assigneeId === currentUserId;
  const canDelete = isProjectOwner || task.createdBy === currentUserId;
  const canChangeStatus = isProjectOwner || task.assigneeId === currentUserId || task.createdBy === currentUserId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div
      className={`relative flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
        task.isOverdue ? "border-rose-300 ring-1 ring-rose-200" : "border-slate-200"
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          {/* Priority Badge */}
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}
          >
            Priority: {priorityInfo.label}
          </span>

          {/* Overdue Alert Badge */}
          {task.isOverdue && (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 animate-pulse">
              <AlertCircle className="h-3 w-3" /> Overdue
            </span>
          )}

          {/* Status Quick Select (FR-09, FR-11) */}
          <div className="flex items-center gap-1">
            <select
              value={task.status}
              disabled={!canChangeStatus}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              className={`rounded-md border text-xs font-semibold py-1 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                task.status === "done"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : task.status === "in_progress"
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : "bg-slate-50 text-slate-700 border-slate-300"
              }`}
              aria-label={`Change status for ${task.title}`}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        {/* Task Title */}
        <h4 className={`mt-3 font-semibold text-slate-900 ${task.status === "done" ? "line-through text-slate-400" : ""}`}>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="mt-1 text-xs text-slate-600 line-clamp-3">
            {task.description}
          </p>
        )}
      </div>

      {/* Meta Footer */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          {/* Due date */}
          <div className="flex items-center gap-1">
            <Calendar className={`h-3.5 w-3.5 ${task.isOverdue ? "text-rose-600 font-bold" : "text-slate-400"}`} />
            <span className={task.isOverdue ? "text-rose-600 font-semibold" : ""}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}
            </span>
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-1 max-w-[130px] truncate" title={assignee?.email || "Unassigned"}>
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">
              {assignee?.displayName || assignee?.email?.split("@")[0] || "Unassigned"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-50 pt-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="flex items-center gap-1 rounded p-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-indigo-600 focus:outline-none"
              aria-label={`Edit task ${task.title}`}
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1 rounded p-1 text-xs text-slate-500 hover:bg-rose-50 hover:text-rose-600 focus:outline-none"
              aria-label={`Delete task ${task.title}`}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal (FR-10) */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-white/95 p-4 text-center backdrop-blur-xs">
          <p className="text-xs font-semibold text-slate-800">
            Delete this task?
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            This action cannot be undone.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(false)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Confirm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

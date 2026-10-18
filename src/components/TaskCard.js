"use client";

import { Calendar, User, AlertCircle, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function TaskCard({
  task,
  members = [],
  currentUserId,
  isProjectOwner,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  const { t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const assignee = members.find((m) => m.uid === task.assigneeId);

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high":
        return {
          label: t("task.highPriority"),
          bg: "bg-red-50 dark:bg-red-950/40",
          text: "text-red-600 dark:text-red-400",
          border: "border-red-200 dark:border-red-900/50",
        };
      case "low":
        return {
          label: t("task.lowPriority"),
          bg: "bg-slate-100 dark:bg-[#202028]",
          text: "text-slate-600 dark:text-slate-400",
          border: "border-slate-200 dark:border-[#2C2C3A]",
        };
      default:
        return {
          label: t("task.mediumPriority"),
          bg: "bg-amber-50 dark:bg-amber-950/40",
          text: "text-amber-600 dark:text-amber-400",
          border: "border-amber-200 dark:border-amber-900/50",
        };
    }
  };

  const priorityInfo = getPriorityStyle(task.priority);

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
      className={`relative flex flex-col justify-between rounded-xl border bg-white dark:bg-[#16161C] p-4 shadow-xs hover:border-slate-300 dark:hover:border-[#38384A] transition ${
        task.isOverdue
          ? "border-red-300 dark:border-red-900/60 ring-1 ring-red-300 dark:ring-red-900/50"
          : "border-slate-200 dark:border-[#262632]"
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          {/* Priority Badge */}
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}
          >
            {priorityInfo.label}
          </span>

          {/* Overdue Badge */}
          {task.isOverdue && (
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              <AlertCircle className="h-3 w-3" /> {t("task.overdue")}
            </span>
          )}

          {/* Status Quick Switcher */}
          <select
            value={task.status}
            disabled={!canChangeStatus}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className={`rounded-md border text-[10px] font-bold py-0.5 px-2 focus:outline-none cursor-pointer transition ${
              task.status === "done"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
                : task.status === "in_progress"
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
                : task.status === "review" || task.status === "in_review"
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
                : "bg-slate-100 dark:bg-[#202028] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#2C2C3A]"
            }`}
            aria-label={`Change status for ${task.title}`}
          >
            <option value="todo">{t("dashboard.todo")}</option>
            <option value="in_progress">{t("dashboard.inProgress")}</option>
            <option value="review">{t("dashboard.review") || "In Review"}</option>
            <option value="done">{t("dashboard.completed")}</option>
          </select>
        </div>

        {/* Task Title */}
        <h4
          className={`mt-3 font-bold text-xs sm:text-sm text-slate-900 dark:text-white ${
            task.status === "done" ? "line-through text-slate-400 dark:text-slate-500" : ""
          }`}
        >
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="mt-1 text-xs text-slate-500 dark:text-[#8E8E9F] line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Meta Footer */}
      <div className="mt-4 border-t border-slate-100 dark:border-[#22222C] pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          {/* Due date */}
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#8E8E9F]">
            <Calendar
              className={`h-3.5 w-3.5 ${
                task.isOverdue ? "text-red-500 dark:text-red-400" : "text-slate-400"
              }`}
            />
            <span className={task.isOverdue ? "text-red-500 dark:text-red-400 font-bold" : ""}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : t("task.noDeadline")}
            </span>
          </div>

          {/* Assignee Avatar */}
          <div
            className="flex items-center gap-1 text-slate-600 dark:text-[#A1A1B2] max-w-[120px] truncate"
            title={assignee?.email || t("task.unassigned")}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shrink-0">
              {assignee?.displayName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span className="truncate">
              {assignee?.displayName || assignee?.email?.split("@")[0] || t("task.unassigned")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-[#202028] pt-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="flex items-center gap-1 rounded p-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-[#202028]"
            >
              <Edit2 className="h-3 w-3" /> {t("task.edit")}
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1 rounded p-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-3 w-3" /> {t("task.delete")}
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-white/95 dark:bg-[#16161C]/95 p-4 text-center backdrop-blur-2xs border border-red-300 dark:border-red-900/60">
          <p className="text-xs font-bold text-slate-900 dark:text-white">{t("task.deleteConfirmTitle")}</p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{t("task.deleteConfirmSub")}</p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(false)}
              className="rounded-lg border border-slate-200 dark:border-[#2C2C3A] bg-white dark:bg-[#202028] px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#282836]"
            >
              {t("task.cancel")}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="rounded-lg bg-red-600 hover:bg-red-500 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
            >
              {isDeleting ? t("task.deleting") : t("task.confirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

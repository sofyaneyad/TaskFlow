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
          bg: "bg-rose-50 dark:bg-rose-950/40",
          text: "text-rose-600 dark:text-rose-400",
          border: "border-rose-200 dark:border-rose-900/50",
        };
      case "low":
        return {
          label: t("task.lowPriority"),
          bg: "bg-[#E8EFE9] dark:bg-[#1E2E24]",
          text: "text-[#166534] dark:text-[#86A789]",
          border: "border-[#C8DAC9] dark:border-[#26372D]",
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
      className={`relative flex flex-col justify-between rounded-xl border bg-[#FFFFFF] dark:bg-[#17221C] p-4 shadow-2xs hover:border-[#86A789]/60 transition duration-200 ${
        task.isOverdue
          ? "border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-300 dark:ring-rose-900/50"
          : "border-[#E5EBE5] dark:border-[#26372D]"
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
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
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
                ? "bg-[#166534] text-white border-[#14532D]"
                : task.status === "in_progress"
                ? "bg-[#E8EFE9] text-[#166534] border-[#C8DAC9] dark:bg-[#1E2E24] dark:text-[#86A789] dark:border-[#26372D]"
                : task.status === "review" || task.status === "in_review"
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
                : "bg-[#FAF9F6] dark:bg-[#131D17] text-[#5E7164] dark:text-[#8EA393] border-[#E5EBE5] dark:border-[#26372D]"
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
          className={`mt-3 font-bold text-xs sm:text-sm text-[#26332B] dark:text-[#FAF9F6] ${
            task.status === "done" ? "line-through text-[#5E7164]/60 dark:text-[#8EA393]/60" : ""
          }`}
        >
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="mt-1 text-xs text-[#5E7164] dark:text-[#8EA393] line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Meta Footer */}
      <div className="mt-4 border-t border-[#E5EBE5] dark:border-[#26372D] pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          {/* Due date */}
          <div className="flex items-center gap-1.5 text-[#5E7164] dark:text-[#8EA393]">
            <Calendar
              className={`h-3.5 w-3.5 ${
                task.isOverdue ? "text-rose-500 dark:text-rose-400" : "text-[#86A789]"
              }`}
            />
            <span className={task.isOverdue ? "text-rose-500 dark:text-rose-400 font-bold" : ""}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : t("task.noDeadline")}
            </span>
          </div>

          {/* Assignee Avatar */}
          <div
            className="flex items-center gap-1 text-[#26332B] dark:text-[#FAF9F6] max-w-[120px] truncate"
            title={assignee?.email || t("task.unassigned")}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#166534] text-[10px] font-bold text-white shrink-0">
              {assignee?.displayName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span className="truncate text-[11px]">
              {assignee?.displayName || assignee?.email?.split("@")[0] || t("task.unassigned")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#E5EBE5] dark:border-[#26372D] pt-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="flex items-center gap-1 rounded p-1 text-[11px] font-medium text-[#5E7164] dark:text-[#8EA393] hover:text-[#166534] dark:hover:text-[#86A789] hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26] transition"
            >
              <Edit2 className="h-3 w-3" /> {t("task.edit")}
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1 rounded p-1 text-[11px] font-medium text-[#5E7164] dark:text-[#8EA393] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            >
              <Trash2 className="h-3 w-3" /> {t("task.delete")}
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-white/95 dark:bg-[#17221C]/95 p-4 text-center backdrop-blur-2xs border border-rose-300 dark:border-rose-900/60">
          <p className="text-xs font-bold text-[#26332B] dark:text-[#FAF9F6]">{t("task.deleteConfirmTitle")}</p>
          <p className="mt-1 text-[11px] text-[#5E7164] dark:text-[#8EA393]">{t("task.deleteConfirmSub")}</p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(false)}
              className="rounded-lg border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#131D17] px-2.5 py-1 text-xs font-semibold text-[#26332B] dark:text-[#FAF9F6] hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26]"
            >
              {t("task.cancel")}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="rounded-lg bg-rose-600 hover:bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
            >
              {isDeleting ? t("task.deleting") : t("task.confirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

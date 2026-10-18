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
        return { label: t("task.highPriority"), bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", border: "border-[#FECACA]" };
      case "low":
        return { label: t("task.lowPriority"), bg: "bg-[#F1F5F9]", text: "text-[#475569]", border: "border-[#E2E8F0]" };
      default:
        return { label: t("task.mediumPriority"), bg: "bg-[#FFFBEB]", text: "text-[#D97706]", border: "border-[#FDE68A]" };
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
      className={`relative flex flex-col justify-between rounded-xl border bg-white p-4 shadow-2xs hover:shadow-xs transition ${
        task.isOverdue ? "border-[#FECACA] ring-1 ring-[#FECACA]" : "border-[#E2E8F0]"
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          {/* Priority Badge */}
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}
          >
            {priorityInfo.label}
          </span>

          {/* Overdue Badge */}
          {task.isOverdue && (
            <span className="badge-overdue inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold">
              <AlertCircle className="h-3 w-3" /> {t("task.overdue")}
            </span>
          )}

          {/* Status Quick Switcher */}
          <select
            value={task.status}
            disabled={!canChangeStatus}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className={`rounded-md border text-[11px] font-bold py-1 px-2 focus:outline-none cursor-pointer ${
              task.status === "done"
                ? "bg-[#ECFDF5] text-[#15803D] border-[#BBF7D0]"
                : task.status === "in_progress"
                ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                : task.status === "review" || task.status === "in_review"
                ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                : "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"
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
        <h4 className={`mt-3 font-semibold text-sm text-[#0F172A] ${task.status === "done" ? "line-through text-[#94A3B8]" : ""}`}>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="mt-1 text-xs text-[#64748B] line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Meta Footer */}
      <div className="mt-4 border-t border-[#F1F5F9] pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          {/* Due date */}
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <Calendar className={`h-3.5 w-3.5 ${task.isOverdue ? "text-[#DC2626]" : "text-[#64748B]"}`} />
            <span className={task.isOverdue ? "text-[#DC2626] font-bold" : ""}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : t("task.noDeadline")}
            </span>
          </div>

          {/* Assignee Avatar */}
          <div className="flex items-center gap-1 text-[#64748B] max-w-[120px] truncate" title={assignee?.email || t("task.unassigned")}>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EEF2FF] text-[10px] font-bold text-[#4F46E5]">
              {assignee?.displayName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span className="truncate">
              {assignee?.displayName || assignee?.email?.split("@")[0] || t("task.unassigned")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#F8FAFC] pt-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="flex items-center gap-1 rounded p-1 text-[11px] font-medium text-[#64748B] hover:text-[#4F46E5] hover:bg-[#F1F5F9]"
            >
              <Edit2 className="h-3 w-3" /> {t("task.edit")}
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1 rounded p-1 text-[11px] font-medium text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
            >
              <Trash2 className="h-3 w-3" /> {t("task.delete")}
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-white/95 p-4 text-center backdrop-blur-2xs border border-[#FECACA]">
          <p className="text-xs font-bold text-[#0F172A]">{t("task.deleteConfirmTitle")}</p>
          <p className="mt-1 text-[11px] text-[#64748B]">{t("task.deleteConfirmSub")}</p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(false)}
              className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9]"
            >
              {t("task.cancel")}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="rounded-lg bg-[#DC2626] hover:bg-rose-700 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
            >
              {isDeleting ? t("task.deleting") : t("task.confirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

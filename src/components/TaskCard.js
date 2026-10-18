"use client";

import { Calendar, User, AlertCircle, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function TaskCard({
  task,
  members = [],
  ownerId = null,
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
  const isAssigneeOwner =
    task.assigneeId === ownerId ||
    (ownerId && assignee?.uid === ownerId) ||
    (!task.assigneeId && isProjectOwner);
  const cleanAssigneeName = isAssigneeOwner ? "عضو (مالك)" : "عضو";

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high":
        return {
          label: t("task.highPriority"),
          bg: "bg-red-50 dark:bg-red-950/40",
          text: "text-red-700 dark:text-red-400",
          border: "border-red-200 dark:border-red-900/40",
        };
      case "low":
        return {
          label: t("task.lowPriority"),
          bg: "bg-slate-100 dark:bg-[#0E2E1D]",
          text: "text-slate-700 dark:text-[#00D084]",
          border: "border-slate-200 dark:border-[#15442A]",
        };
      default:
        return {
          label: t("task.mediumPriority"),
          bg: "bg-[#FEF3C7] dark:bg-[#272210]",
          text: "text-[#B45309] dark:text-[#F59E0B]",
          border: "border-[#FDE68A] dark:border-[#423612]",
        };
    }
  };

  const priorityInfo = getPriorityStyle(task.priority);

  const canEdit = isProjectOwner || task.createdBy === currentUserId || task.assigneeId === currentUserId;
  const canDelete = isProjectOwner || task.createdBy === currentUserId;
  const canChangeStatus = isProjectOwner || task.assigneeId === currentUserId || task.createdBy === currentUserId;

  const handleDelete = () => {
    setShowConfirmDelete(false);
    onDelete(task.id);
  };

  return (
    <div
      className={`relative flex flex-col justify-between rounded-xl border bg-[#FFFFFF] dark:bg-[#0B1F14] p-4 shadow-2xs hover:border-[#059669]/60 dark:hover:border-[#00D084]/60 transition duration-200 ${
        task.isOverdue
          ? "border-amber-400 dark:border-[#F59E0B] ring-1 ring-amber-400/40 dark:ring-[#F59E0B]/40"
          : "border-[#E2E8F0] dark:border-[#133020]"
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}
            >
              {priorityInfo.label}
            </span>

            {/* Overdue Badge */}
            {task.isOverdue && (
              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold bg-[#FEF3C7] dark:bg-[#272210] text-[#B45309] dark:text-[#F59E0B] border border-[#FDE68A] dark:border-[#423612] whitespace-nowrap">
                <AlertCircle className="h-3 w-3 text-amber-600 dark:text-[#F59E0B]" /> {t("task.overdue")}
              </span>
            )}
          </div>

          {/* Static Status Badge (Editing only allowed via Edit button) */}
          <span
            className={`rounded-md border text-[10px] font-bold py-0.5 px-2 shrink-0 ${
              task.status === "done"
                ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#0E2E1D] dark:text-[#00D084] dark:border-[#15442A]"
                : task.status === "in_progress"
                ? "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] dark:bg-[#272210] dark:text-[#F59E0B] dark:border-[#423612]"
                : task.status === "review" || task.status === "in_review"
                ? "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE] dark:bg-[#1A1E36] dark:text-[#818CF8] dark:border-[#2E365E]"
                : "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0] dark:bg-[#0E2518] dark:text-[#7B9A89] dark:border-[#133020]"
            }`}
          >
            {task.status === "done"
              ? t("dashboard.completed")
              : task.status === "in_progress"
              ? t("dashboard.inProgress")
              : task.status === "review" || task.status === "in_review"
              ? (t("dashboard.review") || "In Review")
              : t("dashboard.todo")}
          </span>
        </div>

        {/* Task Title */}
        <h4
          className={`mt-2.5 font-bold text-xs sm:text-sm text-[#0F172A] dark:text-[#FFFFFF] break-words ${
            task.status === "done" ? "line-through text-[#64748B]/60 dark:text-[#7B9A89]/60" : ""
          }`}
        >
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="mt-1 text-xs text-[#64748B] dark:text-[#7B9A89] line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Meta Footer */}
      <div className="mt-4 border-t border-[#E2E8F0] dark:border-[#133020] pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          {/* Due date */}
          <div className="flex items-center gap-1.5 text-[#64748B] dark:text-[#7B9A89] shrink-0 whitespace-nowrap">
            <Calendar
              className={`h-3.5 w-3.5 shrink-0 ${
                task.isOverdue ? "text-amber-600 dark:text-[#F59E0B]" : "text-[#059669] dark:text-[#00D084]"
              }`}
            />
            <span className={task.isOverdue ? "text-amber-700 dark:text-[#FBBF24] font-bold" : ""}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : t("task.noDeadline")}
            </span>
          </div>

          {/* Assignee Name (Clean text, no picture/circle, no second word) */}
          <div
            className="flex items-center text-[#0F172A] dark:text-[#FFFFFF] max-w-[130px] truncate shrink-0"
            title={assignee?.email || cleanAssigneeName}
          >
            <span className="truncate text-[11px] font-medium text-[#64748B] dark:text-[#7B9A89]">
              {cleanAssigneeName}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#E2E8F0] dark:border-[#133020] pt-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="flex items-center gap-1 rounded p-1 text-[11px] font-medium text-[#64748B] dark:text-[#7B9A89] hover:text-[#059669] dark:hover:text-[#00D084] hover:bg-[#F1F5F9] dark:hover:bg-[#0E281A] transition whitespace-nowrap cursor-pointer"
            >
              <Edit2 className="h-3 w-3" /> {t("task.edit")}
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1 rounded p-1 text-[11px] font-medium text-[#64748B] dark:text-[#7B9A89] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition whitespace-nowrap cursor-pointer"
            >
              <Trash2 className="h-3 w-3" /> {t("task.delete")}
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-white/95 dark:bg-[#0B1F14]/95 p-4 text-center backdrop-blur-2xs border border-red-200 dark:border-red-900/50">
          <p className="text-xs font-bold text-[#0F172A] dark:text-[#FFFFFF]">{t("task.deleteConfirmTitle")}</p>
          <p className="mt-1 text-[11px] text-[#64748B] dark:text-[#7B9A89]">{t("task.deleteConfirmSub")}</p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(false)}
              className="rounded-lg border border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#06130B] px-2.5 py-1 text-xs font-semibold text-[#0F172A] dark:text-[#FFFFFF] hover:bg-[#F1F5F9] dark:hover:bg-[#0E281A] cursor-pointer"
            >
              {t("task.cancel")}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="rounded-lg bg-red-600 hover:bg-red-700 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50 transition cursor-pointer"
            >
              {isDeleting ? t("task.deleting") : t("task.confirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

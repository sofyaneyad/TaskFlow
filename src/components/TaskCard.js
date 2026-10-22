"use client";

import { Calendar, User, AlertCircle, Trash2, Edit2, GripVertical } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/context/ToastContext";
import { formatFriendlyDate } from "@/utils/date";
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
  draggable = false,
  onDragStart,
  onDragEnd,
  isDragging = false,
}) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const assignee = members.find((m) => m.uid === task.assigneeId);
  const isAssigneeOwner =
    task.assigneeId === ownerId ||
    (ownerId && assignee?.uid === ownerId) ||
    (!task.assigneeId && isProjectOwner);
  const cleanAssigneeName = isAssigneeOwner ? t("project.owner") : t("project.member");

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high":
        return {
          label: t("task.highPriority"),
          dotColor: "bg-red-500",
          bg: "bg-red-500/10 dark:bg-red-500/15",
          text: "text-red-700 dark:text-red-400",
          border: "border-red-500/20 dark:border-red-500/30",
        };
      case "low":
        return {
          label: t("task.lowPriority"),
          dotColor: "bg-slate-400 dark:bg-zinc-500",
          bg: "bg-slate-100 dark:bg-zinc-800/80",
          text: "text-slate-600 dark:text-zinc-400",
          border: "border-slate-200 dark:border-zinc-700/60",
        };
      default:
        return {
          label: t("task.mediumPriority"),
          dotColor: "bg-amber-500",
          bg: "bg-amber-500/10 dark:bg-amber-500/15",
          text: "text-amber-800 dark:text-amber-400",
          border: "border-amber-500/20 dark:border-amber-500/30",
        };
    }
  };

  const priorityInfo = getPriorityStyle(task.priority);

  // Edit and Delete are always available on every task in any project
  const canEdit = Boolean(onEdit);
  const canDelete = Boolean(onDelete);
  const canChangeStatus = Boolean(onStatusChange);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete?.(task.id);
      showToast({
        type: "info",
        title: t("task.delete"),
        message: task.title,
      });
    } catch (err) {
      console.error("Task delete error:", err);
      showToast({
        type: "error",
        title: t("common.retry") || "Error",
        message: t("project.errDeleteTask"),
      });
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) return;
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(e, task.id);
      }}
      onDragEnd={(e) => {
        onDragEnd?.(e);
      }}
      className={`group relative flex flex-col justify-between rounded-xl border bg-[#FFFFFF] dark:bg-[#141416] p-4 shadow-2xs transition-all duration-200 ease-out ${
        draggable ? "cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]" : ""
      } ${
        isDragging
          ? "opacity-40 scale-95 border-2 border-dashed border-[#2563EB] rotate-1 shadow-lg"
          : "hover:border-[#2563EB]/60 dark:hover:border-[#3B82F6]/60"
      } ${
        task.isOverdue
          ? "border-amber-400 dark:border-[#F59E0B]"
          : "border-[#E4E4E7] dark:border-[#27272A]"
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {draggable && (
              <span className="text-[#64748B]/40 dark:text-[#A1A1AA]/40 group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] group-hover:scale-110 transition-all duration-150 -mr-0.5 rtl:-mr-0 rtl:-ml-0.5" title={t("task.dragHandle")}>
                <GripVertical className="h-3.5 w-3.5" />
              </span>
            )}

            {/* Priority Badge with Precision Dot */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap transition-transform duration-150 hover:scale-[1.03] ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priorityInfo.dotColor}`} />
              {priorityInfo.label}
            </span>

            {/* Overdue Badge */}
            {task.isOverdue && (
              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold bg-[#FEF3C7] dark:bg-[#1F170D] text-[#B45309] dark:text-[#FDE047] border border-[#FDE68A] dark:border-[#452A12] whitespace-nowrap animate-pulse">
                <AlertCircle className="h-3 w-3 text-amber-600 dark:text-[#FDE047]" /> {t("task.overdue")}
              </span>
            )}
          </div>

          {/* Static Status Badge (Editing only allowed via Edit button) */}
          <span
            className={`rounded-md border text-[10px] font-bold py-0.5 px-2 shrink-0 transition-transform duration-150 hover:scale-105 select-none ${
              task.status === "done"
                ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] dark:bg-[#18181B] dark:text-[#60A5FA] dark:border-[#27272A]"
                : task.status === "in_progress"
                ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A] dark:bg-[#1F170D] dark:text-[#FDE047] dark:border-[#452A12]"
                : task.status === "review" || task.status === "in_review"
                ? "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE] dark:bg-[#1A1E36] dark:text-[#818CF8] dark:border-[#2E365E]"
                : "bg-[#F1F3F5] text-[#52525B] border-[#E4E4E7] dark:bg-[#18181B] dark:text-[#A1A1AA] dark:border-[#27272A]"
            }`}
          >
            {task.status === "done"
              ? t("dashboard.completed")
              : task.status === "in_progress"
              ? t("dashboard.inProgress")
              : task.status === "review" || task.status === "in_review"
              ? t("dashboard.review")
              : t("dashboard.todo")}
          </span>
        </div>

        {/* Task Title */}
        <h4
          className={`mt-2.5 font-bold text-xs sm:text-sm text-[#09090B] dark:text-[#F4F4F5] break-words ${
            task.status === "done" ? "line-through text-[#64748B]/60 dark:text-[#A1A1AA]/60" : ""
          }`}
        >
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="mt-1 text-xs text-[#64748B] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Meta Footer */}
      <div className="mt-4 border-t border-[#E4E4E7] dark:border-[#27272A] pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          {/* Due date */}
          <div className="flex items-center gap-1.5 text-[#09090B] dark:text-white shrink-0 whitespace-nowrap">
            <Calendar
              className={`h-3.5 w-3.5 shrink-0 ${
                task.isOverdue ? "text-amber-600 dark:text-amber-400" : "text-[#2563EB] dark:text-white"
              }`}
            />
            <span className={task.isOverdue ? "text-amber-700 dark:text-amber-300 font-bold" : "text-[#09090B] dark:text-white font-medium"}>
              {formatFriendlyDate(task.dueDate, lang) || t("task.noDeadline")}
            </span>
          </div>

          {/* Assignee Name (Clean text, no picture/circle, no second word) */}
          <div
            className="flex items-center text-[#09090B] dark:text-[#F4F4F5] max-w-[130px] truncate shrink-0"
            title={assignee?.email || cleanAssigneeName}
          >
            <span className="truncate text-[11px] font-medium text-[#64748B] dark:text-[#A1A1AA]">
              {cleanAssigneeName}
            </span>
          </div>
        </div>

        {/* Actions (Always visible, prominent Edit & Delete buttons) */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#E4E4E7] dark:border-[#27272A] pt-2.5">
          <span className="text-[10px] text-[#64748B]/60 dark:text-[#A1A1AA]/60 font-mono">
            #{task.id ? String(task.id).slice(-4) : ""}
          </span>

          <div className="flex items-center gap-1.5">
            {canEdit && (
              <button
                type="button"
                draggable={false}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => onEdit(task)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] bg-[#EFF6FF] dark:bg-[#18181B] border border-[#BFDBFE] dark:border-[#27272A] hover:bg-[#DBEAFE] dark:hover:bg-[#27272A] active:scale-95 transition-all duration-150 whitespace-nowrap cursor-pointer shadow-2xs"
                title={t("task.edit")}
                aria-label={t("task.edit")}
              >
                <Edit2 className="h-3 w-3" />
                <span>{t("task.edit")}</span>
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                draggable={false}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setShowConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60 active:scale-95 transition-all duration-150 whitespace-nowrap cursor-pointer shadow-2xs"
                title={t("task.delete")}
                aria-label={t("task.delete")}
              >
                <Trash2 className="h-3 w-3" />
                <span>{t("task.delete")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lucide Confirmation Modal for Task Deletion */}
      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title={t("task.deleteConfirmTitle")}
        description={t("task.deleteConfirmSub")}
        confirmText={t("task.delete")}
        cancelText={t("task.cancel")}
        variant="danger"
        icon={Trash2}
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

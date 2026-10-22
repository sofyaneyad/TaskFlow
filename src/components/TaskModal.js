"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Calendar, User, Tag, AlertCircle, Loader2, Trash2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import DatePicker from "@/components/DatePicker";
import ConfirmDialog from "@/components/ConfirmDialog";
import AppSelect from "@/components/ui/Select";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";

function formatDueDateForInput(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw.split("T")[0];
  if (raw?.seconds) {
    try {
      return new Date(raw.seconds * 1000).toISOString().split("T")[0];
    } catch {
      return "";
    }
  }
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return raw.toISOString().split("T")[0];
  }
  return "";
}

function TaskModalDialog({
  onClose,
  onSave,
  onSubmit,
  onDelete,
  task,
  initialData,
  activeTask,
  members = [],
  ownerId = null,
  defaultStatus = "todo",
}) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fallbackStatus = initialData?.status || defaultStatus || "todo";

  const memberList = useMemo(() => {
    // Only real registered members with valid uids and emails
    let list = members.filter(
      (m) =>
        m &&
        m.uid &&
        !m.uid.startsWith("user_") &&
        !m.uid.startsWith("member_") &&
        m.uid !== "member" &&
        (m.email || m.displayName)
    );
    if (!list.some((m) => m.uid === ownerId || m.isOwner)) {
      list.unshift({ uid: ownerId || "owner", isOwner: true });
    }
    return list;
  }, [members, ownerId]);

  const defaultAssignee = useMemo(() => {
    const ownerMember = memberList.find((m) => m.uid === ownerId);
    return ownerMember ? ownerMember.uid : (memberList[0]?.uid || "");
  }, [memberList, ownerId]);

  const statusOptions = useMemo(
    () => [
      { value: "todo", label: t("dashboard.todo"), colorDot: "bg-[#64748B]" },
      { value: "in_progress", label: t("dashboard.inProgress"), colorDot: "bg-[#2563EB]" },
      { value: "review", label: t("dashboard.review"), colorDot: "bg-[#8B5CF6]" },
      { value: "done", label: t("dashboard.completed"), colorDot: "bg-[#10B981]" },
    ],
    [t]
  );

  const priorityOptions = useMemo(
    () => [
      { value: "low", label: t("task.lowPriority"), colorDot: "bg-[#3B82F6]" },
      { value: "medium", label: t("task.mediumPriority"), colorDot: "bg-[#F59E0B]" },
      { value: "high", label: t("task.highPriority"), colorDot: "bg-[#EF4444]" },
    ],
    [t]
  );

  const assigneeOptions = useMemo(() => {
    return memberList.map((m) => {
      const isMemberOwner = m.uid === ownerId || m.isOwner;
      const roleLabel = isMemberOwner ? t("project.owner") : t("project.member");
      const nameLabel = m.displayName || m.name || m.email;
      const finalLabel = nameLabel ? `${nameLabel} (${roleLabel})` : roleLabel;
      return {
        value: m.uid,
        label: finalLabel,
      };
    });
  }, [memberList, ownerId, t]);

  const [title, setTitle] = useState(() => activeTask?.title || "");
  const [description, setDescription] = useState(() => activeTask?.description || "");
  const [status, setStatus] = useState(() => activeTask?.status || fallbackStatus);
  const [priority, setPriority] = useState(() => activeTask?.priority || "medium");
  const [assigneeId, setAssigneeId] = useState(() => activeTask?.assigneeId || defaultAssignee);
  const [dueDate, setDueDate] = useState(() => formatDueDateForInput(activeTask?.dueDate));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || title.trim().length < 3 || title.trim().length > 120) {
      setError("errTitleRequired");
      return;
    }

    if (description && description.length > 1000) {
      setError("errDescTooLong");
      return;
    }

    setIsSubmitting(true);
    try {
      const saveHandler = onSave || onSubmit;
      if (typeof saveHandler === "function") {
        await saveHandler({
          title: title.trim(),
          description: description ? description.trim() : "",
          status,
          priority,
          assigneeId: assigneeId || defaultAssignee,
          dueDate: dueDate || null,
        });
        showToast({
          type: "success",
          title: activeTask?.id ? t("taskModal.saveChanges") : t("taskModal.createTask"),
          message: title.trim(),
        });
      }
      onClose();
    } catch (err) {
      console.error("Task modal save error:", err);
      setError("errSaveFailed");
      showToast({
        type: "error",
        title: t("common.retry") || "Error",
        message: t("taskModal.errSaveFailed"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog.Root open={!showDeleteConfirm} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-6 shadow-2xl focus:outline-none animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E4E4E7] dark:border-[#27272A] pb-4">
            <Dialog.Title className="text-base font-extrabold text-[#09090B] dark:text-[#F4F4F5]">
              {task ? t("taskModal.editTitle") : t("taskModal.createTitle")}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              {t("taskModal.descPlaceholder")}
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1.5 text-[#64748B] dark:text-[#A1A1AA] hover:bg-[#F1F3F5] dark:hover:bg-[#27272A] hover:text-[#09090B] dark:hover:text-[#FFFFFF] transition cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#FEF3C7] dark:bg-[#1F170D] p-3 text-xs font-semibold text-[#92400E] dark:text-[#FDE047] border border-[#F59E0B]/30">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#D97706] dark:text-[#FDE047]" />
              <span>{t(`taskModal.${error}`) || error}</span>
            </div>
          )}

          {/* Task Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="task-title" className="block text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]">
                {t("taskModal.titleLabel")} *
              </label>
              <input
                id="task-title"
                type="text"
                required
                minLength={3}
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("taskModal.titlePlaceholder")}
                className="mt-1.5 w-full rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#F8F9FA] dark:bg-[#09090B] px-3.5 py-2.5 text-xs text-[#09090B] dark:text-[#F4F4F5] placeholder-[#64748B]/60 dark:placeholder-[#A1A1AA]/60 focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:outline-none transition"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="task-desc" className="block text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]">
                  {t("taskModal.descLabel")}
                </label>
                <span className="text-[10px] text-[#64748B] dark:text-[#A1A1AA]">{description.length}/1000</span>
              </div>
              <textarea
                id="task-desc"
                rows={3}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("taskModal.descPlaceholder")}
                className="mt-1.5 w-full rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#F8F9FA] dark:bg-[#09090B] px-3.5 py-2.5 text-xs text-[#09090B] dark:text-[#F4F4F5] placeholder-[#64748B]/60 dark:placeholder-[#A1A1AA]/60 focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:outline-none transition"
              />
            </div>

            {/* Status & Priority Row with Radix UI Select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="task-status" className="block text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]">
                  {t("taskModal.status")}
                </label>
                <div className="mt-1.5">
                  <AppSelect
                    id="task-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={statusOptions}
                    className="w-full py-2"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="task-priority" className="block text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]">
                  {t("taskModal.priority")}
                </label>
                <div className="mt-1.5">
                  <AppSelect
                    id="task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    options={priorityOptions}
                    className="w-full py-2"
                  />
                </div>
              </div>
            </div>

            {/* Due Date & Assignee Row with Custom Radix + DayPicker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="task-due" className="block text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]">
                  {t("taskModal.dueDate")}
                </label>
                <DatePicker
                  id="task-due"
                  value={dueDate}
                  onChange={setDueDate}
                />
              </div>

              <div>
                <label htmlFor="task-assignee" className="block text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]">
                  {t("taskModal.assignee")}
                </label>
                <div className="mt-1.5">
                  <AppSelect
                    id="task-assignee"
                    value={assigneeId || defaultAssignee}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    options={assigneeOptions}
                    className="w-full py-2"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E4E4E7] dark:border-[#27272A]">
              {activeTask?.id && onDelete ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{t("task.delete")}</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#09090B] px-4 py-2 text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] hover:bg-[#F1F3F5] dark:hover:bg-[#27272A] transition cursor-pointer"
                >
                  {t("taskModal.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] px-5 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {activeTask?.id ? t("taskModal.saveChanges") : t("taskModal.createTask")}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

    {/* Lucide Confirmation Modal for Task Deletion */}
    <ConfirmDialog
      open={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      title={t("task.deleteConfirmTitle")}
      description={t("task.deleteConfirmSub")}
      confirmText={t("task.delete")}
      cancelText={t("task.cancel")}
      variant="danger"
      icon={Trash2}
      onConfirm={async () => {
        try {
          await onDelete(activeTask.id);
          showToast({
            type: "info",
            title: t("task.delete"),
            message: activeTask?.title || title,
          });
          setShowDeleteConfirm(false);
          onClose();
        } catch (err) {
          console.error("Delete task error:", err);
          showToast({
            type: "error",
            title: t("common.retry") || "Error",
            message: t("project.errDeleteTask"),
          });
        }
      }}
    />
  </>
);
}

export default function TaskModal(props) {
  if (!props.isOpen) return null;
  const activeTask = props.task || (props.initialData?.id ? props.initialData : null);
  const modalKey = (activeTask?.id || "new") + "_" + (props.defaultStatus || "todo");
  return <TaskModalDialog key={modalKey} {...props} activeTask={activeTask} />;
}

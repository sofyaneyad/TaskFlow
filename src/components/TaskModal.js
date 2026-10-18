"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Calendar, User, Tag, AlertCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  onSubmit,
  task = null,
  initialData = null,
  members = [],
  ownerId = null,
  defaultStatus = "todo",
}) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTask = task || (initialData?.id ? initialData : null);
  const fallbackStatus = initialData?.status || defaultStatus || "todo";

  const memberList = useMemo(() => {
    let list = [...members];
    // 1. Ensure owner is present
    if (!list.some((m) => m.uid === ownerId || m.isOwner)) {
      list.unshift({ uid: ownerId || "owner", isOwner: true });
    }
    // 2. Ensure regular member is always available
    const hasRegular = list.some((m) => m.uid !== ownerId && !m.isOwner);
    if (!hasRegular) {
      list.push({ uid: "member", isOwner: false });
    }
    return list;
  }, [members, ownerId]);

  const defaultAssignee = useMemo(() => {
    const ownerMember = memberList.find((m) => m.uid === ownerId);
    return ownerMember ? ownerMember.uid : (memberList[0]?.uid || "");
  }, [memberList, ownerId]);

  useEffect(() => {
    if (activeTask) {
      setTitle(activeTask.title || "");
      setDescription(activeTask.description || "");
      setStatus(activeTask.status || fallbackStatus);
      setPriority(activeTask.priority || "medium");
      setAssigneeId(activeTask.assigneeId || defaultAssignee);
      setDueDate(activeTask.dueDate ? activeTask.dueDate.split("T")[0] : "");
    } else {
      setTitle("");
      setDescription("");
      setStatus(fallbackStatus);
      setPriority("medium");
      setAssigneeId(defaultAssignee);
      setDueDate("");
    }
    setError("");
  }, [task, initialData, defaultStatus, isOpen, defaultAssignee]);

  if (!isOpen) return null;

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
      }
      onClose();
    } catch (err) {
      console.error("Task modal save error:", err);
      setError("errSaveFailed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5EBE5] dark:border-[#26372D] pb-4">
          <h3 className="text-base font-extrabold text-[#26332B] dark:text-[#FAF9F6]">
            {task ? t("taskModal.editTitle") : t("taskModal.createTitle")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#5E7164] dark:text-[#8EA393] hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26] hover:text-[#26332B] dark:hover:text-[#FAF9F6] transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert (Earth Gold Palette) */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#FAF5E8] dark:bg-[#6B5424]/30 p-3 text-xs font-semibold text-[#854D0E] dark:text-[#FACC15] border border-[#CA8A04]/40 dark:border-[#6B5424]">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#CA8A04]" />
            <span>{t(`taskModal.${error}`) || error}</span>
          </div>
        )}

        {/* Task Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-bold text-[#26332B] dark:text-[#FAF9F6]">
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
              className="mt-1.5 w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-3.5 py-2.5 text-xs text-[#26332B] dark:text-[#FAF9F6] placeholder-[#5E7164]/60 dark:placeholder-[#8EA393]/60 focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="task-desc" className="block text-xs font-bold text-[#26332B] dark:text-[#FAF9F6]">
                {t("taskModal.descLabel")}
              </label>
              <span className="text-[10px] text-[#5E7164] dark:text-[#8EA393]">{description.length}/1000</span>
            </div>
            <textarea
              id="task-desc"
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("taskModal.descPlaceholder")}
              className="mt-1.5 w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-3.5 py-2.5 text-xs text-[#26332B] dark:text-[#FAF9F6] placeholder-[#5E7164]/60 dark:placeholder-[#8EA393]/60 focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none"
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-status" className="block text-xs font-bold text-[#26332B] dark:text-[#FAF9F6]">
                {t("taskModal.status")}
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-3 py-2 text-xs text-[#26332B] dark:text-[#FAF9F6] focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none"
              >
                <option value="todo">{t("dashboard.todo")}</option>
                <option value="in_progress">{t("dashboard.inProgress")}</option>
                <option value="review">{t("dashboard.review") || "In Review"}</option>
                <option value="done">{t("dashboard.completed")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-xs font-bold text-[#26332B] dark:text-[#FAF9F6]">
                {t("taskModal.priority")}
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-3 py-2 text-xs text-[#26332B] dark:text-[#FAF9F6] focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none"
              >
                <option value="low">{t("task.lowPriority")}</option>
                <option value="medium">{t("task.mediumPriority")}</option>
                <option value="high">{t("task.highPriority")}</option>
              </select>
            </div>
          </div>

          {/* Due Date & Assignee Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-due" className="block text-xs font-bold text-[#26332B] dark:text-[#FAF9F6]">
                {t("taskModal.dueDate")}
              </label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-3 py-2 text-xs text-[#26332B] dark:text-[#FAF9F6] focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="task-assignee" className="block text-xs font-bold text-[#26332B] dark:text-[#FAF9F6]">
                {t("taskModal.assignee")}
              </label>
              <select
                id="task-assignee"
                value={assigneeId || defaultAssignee}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-3 py-2 text-xs text-[#26332B] dark:text-[#FAF9F6] focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none"
              >
                {memberList.map((m) => {
                  const isMemberOwner = m.uid === ownerId || m.isOwner;
                  const label = isMemberOwner ? "عضو (مالك)" : "عضو";
                  return (
                    <option key={m.uid} value={m.uid}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EBE5] dark:border-[#26372D]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#131D17] px-4 py-2 text-xs font-semibold text-[#26332B] dark:text-[#FAF9F6] hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26] transition"
            >
              {t("taskModal.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-[#166534] hover:bg-[#14532D] px-5 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {task ? t("taskModal.saveChanges") : t("taskModal.createTask")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

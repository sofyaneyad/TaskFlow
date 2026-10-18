"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Tag, AlertCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  task = null,
  members = [],
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

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "todo");
      setPriority(task.priority || "medium");
      setAssigneeId(task.assigneeId || "");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    } else {
      setTitle("");
      setDescription("");
      setStatus(defaultStatus);
      setPriority("medium");
      setAssigneeId("");
      setDueDate("");
    }
    setError("");
  }, [task, defaultStatus, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || title.trim().length < 3 || title.trim().length > 120) {
      setError("Task title is required and must be between 3 and 120 characters.");
      return;
    }

    if (description && description.length > 1000) {
      setError("Description cannot exceed 1000 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-[#272736] bg-white dark:bg-[#16161C] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#22222E] pb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {task ? t("taskModal.editTitle") : t("taskModal.createTitle")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#202028] hover:text-slate-900 dark:hover:text-white transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
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
              className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-[#272736] bg-slate-50 dark:bg-[#111116] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="task-desc" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("taskModal.descLabel")}
              </label>
              <span className="text-[10px] text-slate-400">{description.length}/1000</span>
            </div>
            <textarea
              id="task-desc"
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("taskModal.descPlaceholder")}
              className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-[#272736] bg-slate-50 dark:bg-[#111116] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-status" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("taskModal.status")}
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-[#272736] bg-slate-50 dark:bg-[#111116] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="todo">{t("dashboard.todo")}</option>
                <option value="in_progress">{t("dashboard.inProgress")}</option>
                <option value="review">{t("dashboard.review") || "In Review"}</option>
                <option value="done">{t("dashboard.completed")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("taskModal.priority")}
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-[#272736] bg-slate-50 dark:bg-[#111116] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="low">{t("task.lowPriority")}</option>
                <option value="medium">{t("task.mediumPriority")}</option>
                <option value="high">{t("task.highPriority")}</option>
              </select>
            </div>
          </div>

          {/* Due Date & Assignee Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-due" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("taskModal.dueDate")}
              </label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-[#272736] bg-slate-50 dark:bg-[#111116] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="task-assignee" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("taskModal.assignee")}
              </label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-[#272736] bg-slate-50 dark:bg-[#111116] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">{t("taskModal.unassigned")}</option>
                {members.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.displayName || m.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#22222E]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 dark:border-[#2A2A38] bg-white dark:bg-[#1A1A22] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#22222C] transition"
            >
              {t("taskModal.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
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

"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  members = [],
}) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setStatus(initialData.status || "todo");
      setPriority(initialData.priority || "medium");
      setDueDate(initialData.dueDate || "");
      setAssigneeId(initialData.assigneeId || "");
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setDueDate("");
      setAssigneeId("");
    }
    setError("");
  }, [initialData, isOpen]);

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
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate || null,
        assigneeId: assigneeId || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#E2E8F0]">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
          <h3 className="text-lg font-bold text-[#0F172A]">
            {initialData && initialData.id ? t("taskModal.editTitle") : t("taskModal.createTitle")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-[#FEF2F2] p-3 text-xs font-semibold text-[#DC2626] border border-[#FECACA]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="task-title" className="block text-xs font-bold text-[#0F172A]">
                {t("taskModal.titleLabel")} *
              </label>
              <span className="text-[11px] font-medium text-[#64748B]">{title.length}/120</span>
            </div>
            <input
              id="task-title"
              type="text"
              required
              minLength={3}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("taskModal.titlePlaceholder")}
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-xs placeholder-[#94A3B8] focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="task-desc" className="block text-xs font-bold text-[#0F172A]">
                {t("taskModal.descLabel")}
              </label>
              <span className="text-[11px] font-medium text-[#64748B]">{description.length}/1000</span>
            </div>
            <textarea
              id="task-desc"
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("taskModal.descPlaceholder")}
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-xs placeholder-[#94A3B8] focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-status" className="block text-xs font-bold text-[#0F172A]">
                {t("taskModal.status")}
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#4F46E5] focus:outline-none"
              >
                <option value="todo">{t("dashboard.todo")}</option>
                <option value="in_progress">{t("dashboard.inProgress")}</option>
                <option value="review">{t("dashboard.review") || "In Review"}</option>
                <option value="done">{t("dashboard.completed")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-xs font-bold text-[#0F172A]">
                {t("taskModal.priority")}
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#4F46E5] focus:outline-none"
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
              <label htmlFor="task-due" className="block text-xs font-bold text-[#0F172A]">
                {t("taskModal.dueDate")}
              </label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#4F46E5] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="task-assignee" className="block text-xs font-bold text-[#0F172A]">
                {t("taskModal.assignee")}
              </label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#4F46E5] focus:outline-none"
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

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#0F172A] hover:bg-[#F1F5F9]"
            >
              {t("taskModal.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-5 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {initialData && initialData.id ? t("taskModal.saveChanges") : t("taskModal.createTask")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

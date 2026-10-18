"use client";

import { Search, Filter, AlertTriangle, RotateCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  assigneeFilter,
  setAssigneeFilter,
  overdueOnly,
  setOverdueOnly,
  members = [],
  onReset,
}) {
  const { t } = useLanguage();

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    assigneeFilter !== "all" ||
    overdueOnly;

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("filter.searchPlaceholder")}
            className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2 pl-9 rtl:pl-3 rtl:pr-9 pr-3 text-xs placeholder-[#94A3B8] focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            aria-label="Search tasks"
          />
        </div>

        {/* Live Exercise Feature: Overdue Tasks Toggle */}
        <button
          type="button"
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={`flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition border ${
            overdueOnly
              ? "bg-[#DC2626] text-white border-[#DC2626] shadow-sm"
              : "border-[#E2E8F0] bg-white text-[#DC2626] hover:bg-[#FEF2F2]"
          }`}
          aria-pressed={overdueOnly}
        >
          <AlertTriangle className={`h-3.5 w-3.5 ${overdueOnly ? "text-white" : "text-[#DC2626]"}`} />
          {t("filter.overdueOnly")}
        </button>
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F8FAFC]">
        <span className="flex items-center gap-1 text-xs font-semibold text-[#64748B] mr-1 rtl:mr-0 rtl:ml-1">
          <Filter className="h-3.5 w-3.5" /> {t("filter.filters")}:
        </span>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#0F172A] focus:border-[#4F46E5] focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="all">{t("filter.statusAll")}</option>
          <option value="todo">{t("dashboard.todo")}</option>
          <option value="in_progress">{t("dashboard.inProgress")}</option>
          <option value="review">{t("dashboard.review") || "In Review"}</option>
          <option value="done">{t("dashboard.completed")}</option>
        </select>

        {/* Priority */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#0F172A] focus:border-[#4F46E5] focus:outline-none"
          aria-label="Filter by priority"
        >
          <option value="all">{t("filter.priorityAll")}</option>
          <option value="high">{t("task.highPriority")}</option>
          <option value="medium">{t("task.mediumPriority")}</option>
          <option value="low">{t("task.lowPriority")}</option>
        </select>

        {/* Assignee */}
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded-xl border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#0F172A] focus:border-[#4F46E5] focus:outline-none"
          aria-label="Filter by assignee"
        >
          <option value="all">{t("filter.assigneeAll")}</option>
          <option value="unassigned">{t("filter.unassigned")}</option>
          {members.map((m) => (
            <option key={m.uid} value={m.uid}>
              {m.displayName || m.email}
            </option>
          ))}
        </select>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
          >
            <RotateCcw className="h-3 w-3" /> {t("filter.reset")}
          </button>
        )}
      </div>
    </div>
  );
}

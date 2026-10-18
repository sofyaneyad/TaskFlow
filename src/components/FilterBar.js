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

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-4 shadow-2xs">
      {/* Top Search Bar & Overdue Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5E7164] dark:text-[#8EA393]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("filter.searchPlaceholder")}
            className="w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] py-2 pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-xs text-[#26332B] dark:text-[#FAF9F6] placeholder-[#5E7164]/60 dark:placeholder-[#8EA393]/60 focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none transition"
          />
        </div>

        {/* Overdue Button (Earth Gold Palette) */}
        <button
          type="button"
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shrink-0 ${
            overdueOnly
              ? "bg-[#CA8A04] text-white border-[#A16207] shadow-2xs"
              : "border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] text-[#854D0E] dark:text-[#FACC15] hover:bg-[#FAF5E8] dark:hover:bg-[#6B5424]/30"
          }`}
          aria-pressed={overdueOnly}
        >
          <AlertTriangle className={`h-3.5 w-3.5 ${overdueOnly ? "text-white" : "text-[#CA8A04]"}`} />
          <span>{t("filter.overdueOnly")}</span>
        </button>
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5EBE5] dark:border-[#26372D]">
        <span className="flex items-center gap-1 text-xs font-semibold text-[#5E7164] dark:text-[#8EA393] mr-1 rtl:mr-0 rtl:ml-1">
          <Filter className="h-3.5 w-3.5 text-[#166534] dark:text-[#86A789]" /> {t("filter.filters")}:
        </span>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-2.5 py-1.5 text-xs font-medium text-[#26332B] dark:text-[#FAF9F6] focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none"
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
          className="rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-2.5 py-1.5 text-xs font-medium text-[#26332B] dark:text-[#FAF9F6] focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none"
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
          className="rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-2.5 py-1.5 text-xs font-medium text-[#26332B] dark:text-[#FAF9F6] focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none"
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

        {/* Reset button */}
        {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all" || overdueOnly) && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#5E7164] dark:text-[#8EA393] hover:text-[#26332B] dark:hover:text-[#FAF9F6] hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26] transition"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t("filter.reset")}</span>
          </button>
        )}
      </div>
    </div>
  );
}

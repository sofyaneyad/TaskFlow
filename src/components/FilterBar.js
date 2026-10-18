"use client";

import { useMemo } from "react";
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
  ownerId = null,
  onReset,
}) {
  const { t } = useLanguage();

  const memberList = useMemo(() => {
    let list = [...members];
    if (ownerId && !list.some((m) => m.uid === ownerId)) {
      list.unshift({ uid: ownerId, isOwner: true });
    }
    const hasRegular = list.some((m) => m.uid !== ownerId && !m.isOwner);
    if (!hasRegular) {
      list.push({ uid: "member", isOwner: false });
    }
    return list;
  }, [members, ownerId]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] p-4 shadow-sm">
      {/* Top Search Bar & Overdue Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B] dark:text-[#7B9A89]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("filter.searchPlaceholder")}
            className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#133020] bg-[#F8FAFC] dark:bg-[#06130B] py-2 pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-xs text-[#0F172A] dark:text-[#FFFFFF] placeholder-[#64748B]/60 dark:placeholder-[#7B9A89]/60 focus:border-[#059669] dark:focus:border-[#00D084] focus:outline-none transition"
          />
        </div>

        {/* Overdue Button */}
        <button
          type="button"
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shrink-0 ${
            overdueOnly
              ? "bg-[#D97706] dark:bg-[#F59E0B] text-white border-[#B45309] shadow-sm"
              : "border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] text-[#D97706] dark:text-[#F59E0B] hover:bg-[#FEF3C7] dark:hover:bg-[#242211]"
          }`}
          aria-pressed={overdueOnly}
        >
          <AlertTriangle className={`h-3.5 w-3.5 ${overdueOnly ? "text-white" : "text-[#D97706] dark:text-[#F59E0B]"}`} />
          <span>{t("filter.overdueOnly")}</span>
        </button>
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#133020]">
        <span className="flex items-center gap-1 text-xs font-semibold text-[#64748B] dark:text-[#7B9A89] mr-1 rtl:mr-0 rtl:ml-1">
          <Filter className="h-3.5 w-3.5 text-[#059669] dark:text-[#00D084]" /> {t("filter.filters")}:
        </span>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[#E2E8F0] dark:border-[#133020] bg-[#F8FAFC] dark:bg-[#06130B] px-2.5 py-1.5 text-xs font-medium text-[#0F172A] dark:text-[#FFFFFF] focus:border-[#059669] dark:focus:border-[#00D084] focus:outline-none"
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
          className="rounded-xl border border-[#E2E8F0] dark:border-[#133020] bg-[#F8FAFC] dark:bg-[#06130B] px-2.5 py-1.5 text-xs font-medium text-[#0F172A] dark:text-[#FFFFFF] focus:border-[#059669] dark:focus:border-[#00D084] focus:outline-none"
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
          className="rounded-xl border border-[#E2E8F0] dark:border-[#133020] bg-[#F8FAFC] dark:bg-[#06130B] px-2.5 py-1.5 text-xs font-medium text-[#0F172A] dark:text-[#FFFFFF] focus:border-[#059669] dark:focus:border-[#00D084] focus:outline-none"
          aria-label="Filter by assignee"
        >
          <option value="all">{t("filter.assigneeAll")}</option>
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

        {/* Reset button */}
        {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all" || overdueOnly) && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#64748B] dark:text-[#7B9A89] hover:text-[#0F172A] dark:hover:text-[#FFFFFF] hover:bg-[#F1F5F9] dark:hover:bg-[#133020] transition"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t("filter.reset")}</span>
          </button>
        )}
      </div>
    </div>
  );
}

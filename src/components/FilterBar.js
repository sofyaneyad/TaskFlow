"use client";

import { useMemo } from "react";
import { Search, Filter, AlertTriangle, RotateCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AppSelect from "@/components/ui/Select";

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
    if (ownerId && !list.some((m) => m.uid === ownerId)) {
      list.unshift({ uid: ownerId, isOwner: true });
    }
    return list;
  }, [members, ownerId]);

  const statusFilterOptions = useMemo(
    () => [
      { value: "all", label: t("filter.statusAll") },
      { value: "todo", label: t("dashboard.todo"), colorDot: "bg-[#64748B]" },
      { value: "in_progress", label: t("dashboard.inProgress"), colorDot: "bg-[#2563EB]" },
      { value: "review", label: t("dashboard.review"), colorDot: "bg-[#8B5CF6]" },
      { value: "done", label: t("dashboard.completed"), colorDot: "bg-[#10B981]" },
    ],
    [t]
  );

  const priorityFilterOptions = useMemo(
    () => [
      { value: "all", label: t("filter.priorityAll") },
      { value: "high", label: t("task.highPriority"), colorDot: "bg-[#EF4444]" },
      { value: "medium", label: t("task.mediumPriority"), colorDot: "bg-[#F59E0B]" },
      { value: "low", label: t("task.lowPriority"), colorDot: "bg-[#3B82F6]" },
    ],
    [t]
  );

  const assigneeFilterOptions = useMemo(() => {
    const list = [{ value: "all", label: t("filter.assigneeAll") }];
    memberList.forEach((m) => {
      const isMemberOwner = m.uid === ownerId || m.isOwner;
      const roleLabel = isMemberOwner ? t("project.owner") : t("project.member");
      const nameLabel = m.displayName || m.name || m.email;
      const finalLabel = nameLabel ? `${nameLabel} (${roleLabel})` : roleLabel;
      list.push({
        value: m.uid,
        label: finalLabel,
      });
    });
    return list;
  }, [memberList, ownerId, t]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-4 shadow-sm">
      {/* Top Search Bar & Overdue Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B] dark:text-[#A1A1AA]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("filter.searchPlaceholder")}
            className="w-full rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#F8F9FA] dark:bg-[#09090B] py-2 pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-xs text-[#09090B] dark:text-[#F4F4F5] placeholder-[#64748B]/60 dark:placeholder-[#A1A1AA]/60 focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:outline-none transition"
          />
        </div>

        {/* Overdue Button */}
        <button
          type="button"
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shrink-0 ${
            overdueOnly
              ? "bg-[#D97706] dark:bg-[#F59E0B] text-white border-[#B45309] shadow-sm"
              : "border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] text-[#D97706] dark:text-[#FDE047] hover:bg-[#FEF3C7] dark:hover:bg-[#1F170D]"
          }`}
          aria-pressed={overdueOnly}
        >
          <AlertTriangle className={`h-3.5 w-3.5 ${overdueOnly ? "text-white" : "text-[#D97706] dark:text-[#FDE047]"}`} />
          <span>{t("filter.overdueOnly")}</span>
        </button>
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E4E4E7] dark:border-[#27272A]">
        <span className="flex items-center gap-1 text-xs font-semibold text-[#64748B] dark:text-[#A1A1AA] mr-1 rtl:mr-0 rtl:ml-1">
          <Filter className="h-3.5 w-3.5 text-[#2563EB] dark:text-[#60A5FA]" /> {t("filter.filters")}:
        </span>

        {/* Status Radix Select */}
        <AppSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusFilterOptions}
          aria-label="Filter by status"
        />

        {/* Priority Radix Select */}
        <AppSelect
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={priorityFilterOptions}
          aria-label="Filter by priority"
        />

        {/* Assignee Radix Select */}
        <AppSelect
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          options={assigneeFilterOptions}
          aria-label="Filter by assignee"
        />

        {/* Reset button */}
        {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all" || overdueOnly) && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#FFFFFF] hover:bg-[#F1F3F5] dark:hover:bg-[#27272A] transition"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t("filter.reset")}</span>
          </button>
        )}
      </div>
    </div>
  );
}

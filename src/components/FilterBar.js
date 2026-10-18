"use client";

import { Search, Filter, AlertTriangle, RotateCcw } from "lucide-react";

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
  const hasActiveFilters =
    searchQuery ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    assigneeFilter !== "all" ||
    overdueOnly;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Search tasks by title"
          />
        </div>

        {/* Live Exercise Feature: Overdue Tasks Toggle */}
        <button
          type="button"
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition border ${
            overdueOnly
              ? "bg-rose-600 text-white border-rose-600 shadow-sm"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
          aria-pressed={overdueOnly}
        >
          <AlertTriangle className={`h-3.5 w-3.5 ${overdueOnly ? "text-white" : "text-rose-500"}`} />
          Overdue Tasks Only
        </button>
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="flex items-center gap-1 text-xs font-medium text-slate-500 mr-1">
          <Filter className="h-3.5 w-3.5" /> Filters:
        </span>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="all">Status: All</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* Priority */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
          aria-label="Filter by priority"
        >
          <option value="all">Priority: All</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {/* Assignee */}
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
          aria-label="Filter by assignee"
        >
          <option value="all">Assignee: All</option>
          <option value="unassigned">Unassigned</option>
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
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>
    </div>
  );
}

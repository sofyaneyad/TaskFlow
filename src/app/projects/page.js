"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProjectCard from "@/components/ProjectCard";
import { getUserProjects, syncRemoteProjects } from "@/services/projects";
import {
  Plus,
  Search,
  FolderKanban,
} from "lucide-react";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const isRTL = lang === "ar";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("taskflow_local_projects");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
          setLoading(false);
        }
      }
    } catch {}
  }, []);

  const loadProjects = useCallback(async () => {
    if (!user) return;
    try {
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);
      setLoading(false);

      syncRemoteProjects(user.uid)
        .then((latest) => {
          if (latest && latest.length > 0) {
            const userOnly = latest.filter((p) => p.memberIds && p.memberIds.includes(user.uid));
            setProjects(userOnly);
          }
        })
        .catch(() => {});
    } catch (err) {
      console.error("Error loading projects:", err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Filter by ownership
    if (filterType === "owned" && user?.uid) {
      result = result.filter((p) => p.ownerId === user.uid);
    } else if (filterType === "shared" && user?.uid) {
      result = result.filter((p) => p.ownerId !== user.uid && p.memberIds?.includes(user.uid));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "name") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [projects, filterType, searchQuery, sortBy, user]);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#166534] text-white shadow-xs shrink-0">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#26332B] dark:text-[#FAF9F6]">
                    {t("dashboard.myProjects") || "My Projects"}
                  </h1>
                  <span className="rounded-full bg-[#E8EFE9] dark:bg-[#1E2E24] px-2.5 py-0.5 text-xs font-bold text-[#166534] dark:text-[#86A789]">
                    {projects.length}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#5E7164] dark:text-[#8EA393]">
                  {t("dashboard.myProjectsSub") || "Manage, organize, and monitor all your ongoing projects."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] hover:bg-[#14532D] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>{t("dashboard.newProject") || "New Project"}</span>
          </Link>
        </div>

        {/* Toolbar: Search + Filter Tabs + Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl bg-white dark:bg-[#17221C] border border-[#E5EBE5] dark:border-[#26372D] p-3 sm:p-4 shadow-2xs">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5E7164] dark:text-[#8EA393]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("dashboard.searchProjectsPlaceholder") || "Search projects by name..."}
              className="w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#121B16] py-2 pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-xs text-[#26332B] dark:text-[#FAF9F6] placeholder-[#5E7164]/60 dark:placeholder-[#8EA393]/60 focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center rounded-xl bg-[#FAF9F6] dark:bg-[#121B16] p-1 border border-[#E5EBE5] dark:border-[#26372D] text-xs">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
                  filterType === "all"
                    ? "bg-white dark:bg-[#1E2E24] text-[#166534] dark:text-[#86A789] shadow-2xs font-bold"
                    : "text-[#5E7164] dark:text-[#8EA393] hover:text-[#26332B] dark:hover:text-[#FAF9F6]"
                }`}
              >
                {isRTL ? "الكل" : "All"} ({projects.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("owned")}
                className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
                  filterType === "owned"
                    ? "bg-white dark:bg-[#1E2E24] text-[#166534] dark:text-[#86A789] shadow-2xs font-bold"
                    : "text-[#5E7164] dark:text-[#8EA393] hover:text-[#26332B] dark:hover:text-[#FAF9F6]"
                }`}
              >
                {isRTL ? "مشاريعي" : "Owned"}
              </button>
              <button
                type="button"
                onClick={() => setFilterType("shared")}
                className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
                  filterType === "shared"
                    ? "bg-white dark:bg-[#1E2E24] text-[#166534] dark:text-[#86A789] shadow-2xs font-bold"
                    : "text-[#5E7164] dark:text-[#8EA393] hover:text-[#26332B] dark:hover:text-[#FAF9F6]"
                }`}
              >
                {isRTL ? "مشارك بها" : "Shared"}
              </button>
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#121B16] px-3 py-2 text-xs text-[#26332B] dark:text-[#FAF9F6] focus:border-[#166534] dark:focus:border-[#86A789] focus:outline-none transition cursor-pointer"
            >
              <option value="newest">{isRTL ? "الأحدث أولاً" : "Newest first"}</option>
              <option value="name">{isRTL ? "الترتيب الأبجدي" : "Alphabetical (A-Z)"}</option>
            </select>
          </div>
        </div>

        {/* Projects Grid Rendering */}
        {loading && filteredAndSortedProjects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-5 shadow-2xs animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-[#E8EFE9] dark:bg-[#1E2E24]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 rounded bg-[#E8EFE9] dark:bg-[#1E2E24]" />
                    <div className="h-3 w-1/3 rounded bg-[#E8EFE9] dark:bg-[#1E2E24]" />
                  </div>
                </div>
                <div className="h-3 w-full rounded bg-[#E8EFE9] dark:bg-[#1E2E24]" />
                <div className="h-2 w-full rounded-full bg-[#E8EFE9] dark:bg-[#1E2E24]" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedProjects.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-12 text-center">
            <FolderKanban className="mx-auto h-12 w-12 text-[#86A789]/60" />
            <h3 className="mt-3 text-sm font-bold text-[#26332B] dark:text-[#FAF9F6]">
              {searchQuery.trim()
                ? (t("dashboard.noProjectsFound") || "No projects found")
                : (t("dashboard.noProjects") || "No projects yet")}
            </h3>
            <p className="mt-1 text-xs text-[#5E7164] dark:text-[#8EA393] max-w-sm mx-auto">
              {searchQuery.trim()
                ? (t("dashboard.noProjectsFoundSub") || "No projects matched your search keyword.")
                : (t("dashboard.noProjectsSub") || "Create your first project to get started organizing your tasks.")}
            </p>
            {!searchQuery.trim() && (
              <div className="mt-5">
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#166534] hover:bg-[#14532D] px-4 py-2 text-xs font-bold text-white shadow-xs transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t("dashboard.newProject") || "New Project"}</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedProjects.map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                currentUserId={user?.uid || ""}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

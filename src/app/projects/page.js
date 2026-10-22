"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProjectCard from "@/components/ProjectCard";
import { getUserProjects, syncRemoteProjects } from "@/services/projects";
import { getUserDashboardStats } from "@/services/tasks";
import AppSelect from "@/components/ui/Select";
import {
  Plus,
  Search,
  FolderKanban,
} from "lucide-react";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const isRTL = lang === "ar";

  const [projects, setProjects] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("taskflow_local_projects");
        const authRaw = localStorage.getItem("taskflow_auth_cache");
        const cachedUid = authRaw ? JSON.parse(authRaw)?.uid : null;
        if (raw && cachedUid) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter(
              (p) => p.ownerId === cachedUid || (Array.isArray(p.memberIds) && p.memberIds.includes(cachedUid))
            );
          }
        }
      } catch {}
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("taskflow_local_projects");
        const authRaw = localStorage.getItem("taskflow_auth_cache");
        const cachedUid = authRaw ? JSON.parse(authRaw)?.uid : null;
        if (raw && cachedUid) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.some((p) => p.ownerId === cachedUid || (Array.isArray(p.memberIds) && p.memberIds.includes(cachedUid)))) {
            return false;
          }
        }
      } catch {}
    }
    return true;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const sortOptions = useMemo(
    () => [
      { value: "newest", label: t("project.sortNewest") },
      { value: "name", label: t("project.sortName") },
    ],
    [t]
  );

  const isFetchingRef = useRef(false);

  const loadProjects = useCallback(async () => {
    if (!user?.uid) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);
      setLoading(false);

      syncRemoteProjects(user.uid)
        .then((latest) => {
          if (latest && latest.length > 0) {
            const userOnly = latest.filter(
              (p) => p.ownerId === user.uid || (Array.isArray(p.memberIds) && p.memberIds.includes(user.uid))
            );
            setProjects(userOnly);
          }
        })
        .catch(() => {});
    } catch (err) {
      console.error("Error loading projects:", err);
      setLoading(false);
    } finally {
      isFetchingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      if (isSubscribed) await loadProjects();
    })();
    return () => {
      isSubscribed = false;
    };
  }, [loadProjects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Filter by ownership
    if (filterType === "owned" && user?.uid) {
      result = result.filter((p) => p.ownerId === user.uid || !p.ownerId || p.memberIds?.includes(user.uid));
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
      result.sort((a, b) => {
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        return timeB - timeA;
      });
    }

    return result;
  }, [projects, filterType, searchQuery, sortBy, user]);

  if (!user) {
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] dark:bg-[#2563EB] text-white shadow-xs shrink-0">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#09090B] dark:text-[#F4F4F5]">
                    {t("dashboard.myProjects")}
                  </h1>
                  <span className="inline-flex items-center justify-center rounded-full bg-[#EFF6FF] dark:bg-[#18181B] px-2.5 py-0.5 text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] font-sans tabular-nums leading-none select-none text-center">
                    <span className="inline-block leading-none -translate-y-[0.5px]">{projects.length}</span>
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#A1A1AA]">
                  {t("dashboard.myProjectsSub")}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>{t("dashboard.newProject")}</span>
          </Link>
        </div>

        {/* Toolbar: Search + Filter Tabs + Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#141416] border border-[#E4E4E7] dark:border-[#27272A] p-3 sm:p-4 shadow-2xs">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B] dark:text-[#A1A1AA]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("dashboard.searchProjectsPlaceholder")}
              className="w-full rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#F8F9FA] dark:bg-[#09090B] py-2 pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-xs text-[#09090B] dark:text-[#F4F4F5] placeholder-[#64748B]/60 dark:placeholder-[#A1A1AA]/60 focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:outline-none transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center rounded-xl bg-[#F8F9FA] dark:bg-[#09090B] p-1 border border-[#E4E4E7] dark:border-[#27272A] text-xs">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
                  filterType === "all"
                    ? "bg-white dark:bg-[#18181B] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs font-bold"
                    : "text-[#64748B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#FFFFFF]"
                }`}
              >
                {t("project.filterAll")} ({projects.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("owned")}
                className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
                  filterType === "owned"
                    ? "bg-white dark:bg-[#18181B] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs font-bold"
                    : "text-[#64748B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#FFFFFF]"
                }`}
              >
                {t("project.filterOwned")}
              </button>
              <button
                type="button"
                onClick={() => setFilterType("shared")}
                className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
                  filterType === "shared"
                    ? "bg-white dark:bg-[#18181B] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs font-bold"
                    : "text-[#64748B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#FFFFFF]"
                }`}
              >
                {t("project.filterShared")}
              </button>
            </div>

            {/* Sort Radix Select */}
            <AppSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
              className="py-2"
              aria-label="Sort projects"
            />
          </div>
        </div>

        {/* Projects Grid Rendering */}
        {loading && filteredAndSortedProjects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-5 shadow-2xs animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-[#F1F3F5] dark:bg-[#1F1F23]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 rounded bg-[#F1F3F5] dark:bg-[#1F1F23]" />
                    <div className="h-3 w-1/3 rounded bg-[#F1F3F5] dark:bg-[#1F1F23]" />
                  </div>
                </div>
                <div className="h-3 w-full rounded bg-[#F1F3F5] dark:bg-[#1F1F23]" />
                <div className="h-2 w-full rounded-full bg-[#F1F3F5] dark:bg-[#1F1F23]" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedProjects.length === 0 ? (
          <div className="rounded-2xl border border-solid border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-12 text-center">
            <FolderKanban className="mx-auto h-12 w-12 text-[#64748B]/40 dark:text-[#A1A1AA]/40" />
            <h3 className="mt-3 text-sm font-bold text-[#09090B] dark:text-[#F4F4F5]">
              {searchQuery.trim()
                ? t("dashboard.noProjectsFound")
                : t("dashboard.noProjects")}
            </h3>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#A1A1AA] max-w-sm mx-auto">
              {searchQuery.trim()
                ? t("dashboard.noProjectsFoundSub")
                : t("dashboard.noProjectsSub")}
            </p>
            {!searchQuery.trim() && (
              <div className="mt-5">
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white shadow-xs transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t("dashboard.newProject")}</span>
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

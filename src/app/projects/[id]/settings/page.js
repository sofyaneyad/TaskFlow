"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMemberByEmail,
  removeProjectMember,
  getProjectMembersDetails,
} from "@/services/projects";
import {
  ArrowLeft,
  Settings,
  Users,
  UserPlus,
  Trash2,
  ShieldAlert,
  Loader2,
  ShieldCheck,
  UserMinus,
  Check,
  X,
} from "lucide-react";

function ProjectSettingsContent() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const [memberToRemove, setMemberToRemove] = useState(null);
  const router = useRouter();
  const initialLoadedRef = useRef(false);

  const [project, setProject] = useState(() => {
    if (typeof window !== "undefined" && projectId) {
      try {
        const raw = localStorage.getItem("taskflow_local_projects");
        if (raw) {
          const list = JSON.parse(raw);
          return list.find((p) => p.id === projectId) || null;
        }
      } catch {}
    }
    return null;
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(true);

  // Form states
  const [name, setName] = useState(() => project?.name || "");
  const [description, setDescription] = useState(() => project?.description || "");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Member states
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);

  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // Delete project modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // Auto-dismiss notification alerts after 4 seconds
  useEffect(() => {
    if (!memberError) return;
    const timer = setTimeout(() => setMemberError(""), 4000);
    return () => clearTimeout(timer);
  }, [memberError]);

  useEffect(() => {
    if (!memberSuccess) return;
    const timer = setTimeout(() => setMemberSuccess(""), 4000);
    return () => clearTimeout(timer);
  }, [memberSuccess]);

  useEffect(() => {
    if (!updateError) return;
    const timer = setTimeout(() => setUpdateError(""), 4000);
    return () => clearTimeout(timer);
  }, [updateError]);

  useEffect(() => {
    if (!updateSuccess) return;
    const timer = setTimeout(() => setUpdateSuccess(false), 4000);
    return () => clearTimeout(timer);
  }, [updateSuccess]);

  const loadData = useCallback(async () => {
    if (!projectId || !user) return;
    if (!projectRef.current) setLoading(true);

    try {
      const proj = await getProjectById(projectId);
      if (!proj) {
        router.push("/dashboard");
        return;
      }

      const userIsOwner = proj.ownerId === user?.uid || !proj.ownerId;
      setIsOwner(userIsOwner);
      if (!userIsOwner && proj.ownerId && proj.ownerId !== user?.uid) {
        setLoading(false);
        return;
      }

      setProject(proj);
      if (!initialLoadedRef.current) {
        setName(proj.name || "");
        setDescription(proj.description || "");
        initialLoadedRef.current = true;
      }

      const memberDetails = await getProjectMembersDetails(proj.memberIds || [], projectId);
      setMembers(memberDetails);
      const cleanUids = memberDetails.map((m) => m.uid);
      setProject((prev) => (prev ? { ...prev, memberIds: cleanUids } : prev));
    } catch (err) {
      console.error("Settings load error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, user, router]);

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      if (isSubscribed) await loadData();
    })();
    return () => {
      isSubscribed = false;
    };
  }, [loadData]);

  // Update Project Info (Instant optimistic update)
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess(false);

    if (!name || name.trim().length < 3 || name.trim().length > 80) {
      setUpdateError("errNameRequired");
      return;
    }

    setIsUpdating(true);
    try {
      setProject((prev) =>
        prev ? { ...prev, name: name.trim(), description: description.trim() } : prev
      );
      updateProject(projectId, { name: name.trim(), description: description.trim() }).catch(
        (err) => console.warn("Background updateProject error:", err)
      );
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setUpdateError("errUpdateFailed");
    } finally {
      setIsUpdating(false);
    }
  };

  // Add Member by Email (Instant optimistic update)
  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError("");
    setMemberSuccess("");

    if (!newMemberEmail.trim()) {
      setMemberError("errEnterEmail");
      return;
    }

    setIsAddingMember(true);
    try {
      const addedUser = await addProjectMemberByEmail(projectId, newMemberEmail);
      const cleanAddedName = (
        addedUser.displayName ||
        addedUser.email?.split("@")[0] ||
        t("project.member")
      )
        .replace(/\s*\([^)]*\)/g, "")
        .trim() || t("project.member");

      setMembers((prev) => [
        ...prev,
        { ...addedUser, displayName: cleanAddedName },
      ]);
      setProject((prev) =>
        prev
          ? { ...prev, memberIds: [...(prev.memberIds || []), addedUser.uid] }
          : prev
      );
      setNewMemberEmail("");
      setMemberSuccess(
        `${t("settings.memberAddedSuccess")} ${cleanAddedName}`
      );
      setTimeout(() => setMemberSuccess(""), 3000);
    } catch (err) {
      setMemberError(err?.message || "errAddMemberFailed");
    } finally {
      setIsAddingMember(false);
    }
  };

  // Remove Member (Instant optimistic update)
  const handleRemoveMember = async (memberId) => {
    try {
      setMembers((prev) => prev.filter((m) => m.uid !== memberId));
      setProject((prev) =>
        prev
          ? {
              ...prev,
              memberIds: (prev.memberIds || []).filter((id) => id !== memberId),
            }
          : prev
      );
      removeProjectMember(projectId, memberId, user?.uid || "").catch((err) =>
        console.warn("Background removeProjectMember error:", err)
      );
    } catch (err) {
      setMemberError("errRemoveMemberFailed");
    }
  };

  // Delete Project with Confirmation
  const handleDeleteProject = async () => {
    setIsDeletingProject(true);
    try {
      await deleteProject(projectId);
      showToast({
        type: "info",
        title: t("settings.deleteModalTitle"),
        message: project?.name || "",
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Delete project error:", err);
      showToast({
        type: "error",
        title: t("common.retry") || "Error",
        message: t("settings.errDeleteProject"),
      });
      setIsDeletingProject(false);
      setShowDeleteModal(false);
    }
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );
  }

  if (loading && !project) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB] dark:text-[#60A5FA] mb-2" />
          <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] font-medium">{t("common.loadingSettings")}</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isOwner) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-[#D97706] dark:text-[#FDE047]" />
          <h2 className="mt-3 text-lg font-bold text-[#09090B] dark:text-[#F4F4F5]">{t("project.accessDenied")}</h2>
          <p className="mt-1 text-xs text-[#64748B] dark:text-[#A1A1AA]">
            {t("project.accessDeniedSub")}
          </p>
          <div className="mt-6">
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white shadow-xs transition"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("settings.backToTasks")}
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation */}
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#2563EB] dark:hover:text-[#93C5FD] transition"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("settings.backToTasks")}
        </Link>

        {/* Page Header */}
        <div className="border-b border-[#E4E4E7] dark:border-[#27272A] pb-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#09090B] dark:text-[#F4F4F5] flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-[#2563EB] dark:text-[#60A5FA]" /> {t("settings.title")}
          </h1>
          <p className="mt-1 text-xs text-[#64748B] dark:text-[#A1A1AA]">
            {t("settings.subtitle")}
          </p>
        </div>

        {/* 1. General Settings Form */}
        <div className="rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-6 shadow-xs">
          <h2 className="text-base font-bold text-[#09090B] dark:text-[#F4F4F5]">{t("settings.generalInfo")}</h2>
          <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">{t("settings.generalInfoSub")}</p>

          {updateError && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#FEF2F2] dark:bg-[#1C0F0F] p-3 text-xs font-semibold text-[#DC2626] dark:text-[#F87171] border border-[#EF4444]/30 animate-in fade-in duration-200">
              <span>{t(`settings.${updateError}`) || updateError}</span>
              <button
                type="button"
                onClick={() => setUpdateError("")}
                className="text-[#DC2626]/70 hover:text-[#DC2626] dark:text-[#F87171]/70 dark:hover:text-[#F87171] p-0.5 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {updateSuccess && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#EFF6FF] dark:bg-[#18181B] p-3 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] border border-[#2563EB]/30 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4" /> {t("settings.updatedSuccess")}
              </div>
              <button
                type="button"
                onClick={() => setUpdateSuccess(false)}
                className="text-[#2563EB]/70 hover:text-[#2563EB] dark:text-[#60A5FA]/70 dark:hover:text-[#60A5FA] p-0.5 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleUpdateProject} className="mt-4 space-y-4">
            <div>
              <label htmlFor="settings-name" className="block text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]">
                {t("settings.nameLabel")} *
              </label>
              <input
                id="settings-name"
                type="text"
                required
                minLength={3}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#F8F9FA] dark:bg-[#09090B] px-3.5 py-2.5 text-sm text-[#09090B] dark:text-[#F4F4F5] placeholder-[#64748B]/60 dark:placeholder-[#A1A1AA]/60 focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:bg-[#FFFFFF] dark:focus:bg-[#121714] focus:outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="settings-desc" className="block text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]">
                {t("settings.descLabel")}
              </label>
              <textarea
                id="settings-desc"
                rows={3}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#F8F9FA] dark:bg-[#09090B] px-3.5 py-2.5 text-sm text-[#09090B] dark:text-[#F4F4F5] placeholder-[#64748B]/60 dark:placeholder-[#A1A1AA]/60 focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:bg-[#FFFFFF] dark:focus:bg-[#121714] focus:outline-none transition"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition"
              >
                {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {t("settings.saveChanges")}
              </button>
            </div>
          </form>
        </div>

        {/* 2. Team Membership Management */}
        <div className="rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-[#09090B] dark:text-[#F4F4F5] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#2563EB] dark:text-[#60A5FA]" /> {t("settings.teamMembers")} ({members.length})
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">
              {t("settings.teamMembersSub")}
            </p>
          </div>

          <form onSubmit={handleAddMember} className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <input
                type="email"
                placeholder={t("settings.addEmailPlaceholder")}
                value={newMemberEmail}
                onChange={(e) => {
                  setNewMemberEmail(e.target.value);
                  if (memberError) setMemberError("");
                  if (memberSuccess) setMemberSuccess("");
                }}
                className="w-full rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#F8F9FA] dark:bg-[#09090B] px-3.5 py-2 text-sm text-[#09090B] dark:text-[#F4F4F5] placeholder-[#64748B]/60 dark:placeholder-[#A1A1AA]/60 focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:bg-[#FFFFFF] dark:focus:bg-[#121714] focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={isAddingMember}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition"
            >
              {isAddingMember ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              {t("settings.addMember")}
            </button>
          </form>

          {memberError && (
            <div className="mt-3 flex items-start justify-between gap-2.5 rounded-xl bg-[#FEF2F2] dark:bg-[#1C0F0F] p-3 text-xs font-semibold text-[#DC2626] dark:text-[#F87171] border border-[#EF4444]/30 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <ShieldAlert className="h-4 w-4 shrink-0 text-[#DC2626] dark:text-[#F87171] mt-0.5" />
                <span>{t(`settings.${memberError}`) || memberError}</span>
              </div>
              <button
                type="button"
                onClick={() => setMemberError("")}
                className="shrink-0 text-[#DC2626]/70 hover:text-[#DC2626] dark:text-[#F87171]/70 dark:hover:text-[#F87171] p-0.5 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {memberSuccess && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#EFF6FF] dark:bg-[#18181B] p-3 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] border border-[#2563EB]/30 animate-in fade-in duration-200">
              <span>{memberSuccess}</span>
              <button
                type="button"
                onClick={() => setMemberSuccess("")}
                className="shrink-0 text-[#2563EB]/70 hover:text-[#2563EB] dark:text-[#60A5FA]/70 dark:hover:text-[#60A5FA] p-0.5 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Members List */}
          <div className="mt-5 divide-y divide-[#DCE3DC] dark:divide-[#28332D] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#09090B]">
            {members.map((member) => {
              const isMemberOwner = member.uid === project.ownerId;
              const cleanMemberName = (
                member.displayName ||
                member.name ||
                member.email?.split("@")[0] ||
                t("project.member")
              )
                .replace(/\s*\([^)]*\)/g, "")
                .trim() || t("project.member");

              return (
                <div key={member.uid} className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-3.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#09090B] dark:text-[#F4F4F5] flex flex-wrap items-center gap-1.5">
                        <span className="truncate">{cleanMemberName}</span>
                        {isMemberOwner && (
                          <span className="badge-owner inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold shrink-0 !text-white">
                            <ShieldCheck className="h-3 w-3 text-white" /> {t("project.owner")}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#A1A1AA] truncate">{member.email}</p>
                    </div>
                  </div>

                  {!isMemberOwner && (
                    <button
                      type="button"
                      onClick={() => setMemberToRemove(member)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#D97706] dark:text-[#FDE047] hover:bg-[#FEF3C7] dark:hover:bg-[#1F170D] transition shrink-0 whitespace-nowrap cursor-pointer"
                      title={t("settings.remove")}
                    >
                      <UserMinus className="h-3.5 w-3.5" /> {t("settings.remove")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Danger Zone */}
        <div className="rounded-2xl border border-[#EF4444]/30 bg-[#FEF2F2] dark:bg-[#1C0F0F] p-6 shadow-xs">
          <h2 className="text-base font-bold text-[#DC2626] dark:text-[#EF4444]">{t("settings.dangerZone")}</h2>
          <p className="text-xs text-[#DC2626]/80 dark:text-[#EF4444]/80 mt-1">
            {t("settings.dangerZoneSub")}
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] px-4 py-2 text-xs font-bold text-white shadow-xs transition"
            >
              <Trash2 className="h-4 w-4" /> {t("settings.deleteProject")}
            </button>
          </div>
        </div>

        {/* Radix + Lucide Delete Project Confirmation Modal */}
        <ConfirmDialog
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          title={
            lang === "ar"
              ? `${t("settings.deleteModalTitle")} "${project?.name || ""}"؟`
              : `${t("settings.deleteModalTitle")} "${project?.name || ""}"?`
          }
          description={t("settings.deleteModalSub")}
          confirmText={t("settings.confirmDelete")}
          cancelText={t("taskModal.cancel")}
          variant="danger"
          icon={Trash2}
          isLoading={isDeletingProject}
          onConfirm={handleDeleteProject}
        />

        {/* Radix + Lucide Remove Member Confirmation Modal */}
        <ConfirmDialog
          open={Boolean(memberToRemove)}
          onOpenChange={(isOpen) => !isOpen && setMemberToRemove(null)}
          title={t("settings.remove") || "إزالة العضو"}
          description={
            memberToRemove
              ? lang === "ar"
                ? `${memberToRemove.displayName || memberToRemove.email} - هل أنت متأكد من إزالة هذا العضو من المشروع؟`
                : `${memberToRemove.displayName || memberToRemove.email} - Are you sure you want to remove this member from the project?`
              : ""
          }
          confirmText={t("settings.remove") || "إزالة"}
          cancelText={t("taskModal.cancel")}
          variant="warning"
          icon={UserMinus}
          onConfirm={async () => {
            if (memberToRemove) {
              const mem = memberToRemove;
              setMemberToRemove(null);
              await handleRemoveMember(mem.uid);
              showToast({
                type: "info",
                title: t("settings.remove"),
                message: mem.displayName || mem.email,
              });
            }
          }}
        />
      </div>
    </ProtectedRoute>
  );
}

export default function ProjectSettingsPage() {
  const { t, lang } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB] dark:text-[#60A5FA] mb-2" />
          <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] font-medium">
            {t("common.loadingSettings")}
          </p>
        </div>
      }
    >
      <ProjectSettingsContent />
    </Suspense>
  );
}

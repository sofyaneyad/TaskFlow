"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
} from "lucide-react";

function ProjectSettingsContent() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
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

  // Delete project modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  const loadData = useCallback(async () => {
    if (!projectId || !user) return;
    if (!project) setLoading(true);

    try {
      const proj = await getProjectById(projectId);
      if (!proj) {
        router.push("/dashboard");
        return;
      }

      const userIsOwner = proj.ownerId === user?.uid;
      setIsOwner(userIsOwner);
      if (!userIsOwner) {
        setLoading(false);
        return;
      }

      setProject(proj);
      if (!initialLoadedRef.current) {
        setName(proj.name || "");
        setDescription(proj.description || "");
        initialLoadedRef.current = true;
      }

      const memberDetails = await getProjectMembersDetails(proj.memberIds || []);
      setMembers(memberDetails);
    } catch (err) {
      console.error("Settings load error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, user?.uid, router]);

  useEffect(() => {
    loadData();
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
        "عضو"
      )
        .replace(/\s*\([^)]*\)/g, "")
        .trim() || "عضو";

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
        `${t("settings.memberAddedSuccess") || "Added:"} ${cleanAddedName}`
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
      router.push("/dashboard");
    } catch (err) {
      console.error("Delete project error:", err);
      alert("Failed to delete project. Please try again.");
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
          <Loader2 className="h-8 w-8 animate-spin text-[#166534] mb-2" />
          <p className="text-xs text-[#5E7164] dark:text-[#8EA393] font-medium">{t("common.loadingSettings") || "Loading..."}</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isOwner) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-[#CA8A04]" />
          <h2 className="mt-3 text-lg font-bold text-[#26332B] dark:text-[#FAF9F6]">{t("project.accessDenied")}</h2>
          <p className="mt-1 text-xs text-[#5E7164] dark:text-[#8EA393]">
            {t("project.accessDeniedSub")}
          </p>
          <div className="mt-6">
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#166534] hover:bg-[#14532D] px-4 py-2 text-xs font-semibold text-white shadow-xs transition"
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E7164] dark:text-[#8EA393] hover:text-[#166534] dark:hover:text-[#86A789] transition"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("settings.backToTasks")}
        </Link>

        {/* Page Header */}
        <div className="border-b border-[#E5EBE5] dark:border-[#26372D] pb-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#26332B] dark:text-[#FAF9F6] flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-[#166534] dark:text-[#86A789]" /> {t("settings.title")}
          </h1>
          <p className="mt-1 text-xs text-[#5E7164] dark:text-[#8EA393]">
            {t("settings.subtitle")}
          </p>
        </div>

        {/* 1. General Settings Form */}
        <div className="rounded-2xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-6 shadow-xs">
          <h2 className="text-base font-bold text-[#26332B] dark:text-[#FAF9F6]">{t("settings.generalInfo")}</h2>
          <p className="text-xs text-[#5E7164] dark:text-[#8EA393]">{t("settings.generalInfoSub")}</p>

          {updateError && (
            <div className="mt-3 rounded-xl bg-[#FAF5E8] dark:bg-[#6B5424]/30 p-3 text-xs font-semibold text-[#854D0E] dark:text-[#FACC15] border border-[#CA8A04]/40 dark:border-[#6B5424]">
              {t(`settings.${updateError}`) || updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
              <Check className="h-4 w-4" /> {t("settings.updatedSuccess")}
            </div>
          )}

          <form onSubmit={handleUpdateProject} className="mt-4 space-y-4">
            <div>
              <label htmlFor="settings-name" className="block text-xs font-bold text-[#26332B] dark:text-[#FAF9F6]">
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
                className="mt-1.5 w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-3.5 py-2.5 text-sm text-[#26332B] dark:text-[#FAF9F6] placeholder-[#5E7164]/60 dark:placeholder-[#8EA393]/60 focus:border-[#166534] dark:focus:border-[#86A789] focus:bg-[#FFFFFF] dark:focus:bg-[#17221C] focus:outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="settings-desc" className="block text-xs font-bold text-[#26332B] dark:text-[#FAF9F6]">
                {t("settings.descLabel")}
              </label>
              <textarea
                id="settings-desc"
                rows={3}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-3.5 py-2.5 text-sm text-[#26332B] dark:text-[#FAF9F6] placeholder-[#5E7164]/60 dark:placeholder-[#8EA393]/60 focus:border-[#166534] dark:focus:border-[#86A789] focus:bg-[#FFFFFF] dark:focus:bg-[#17221C] focus:outline-none transition"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 rounded-xl bg-[#166534] hover:bg-[#14532D] px-4 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition"
              >
                {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {t("settings.saveChanges")}
              </button>
            </div>
          </form>
        </div>

        {/* 2. Team Membership Management */}
        <div className="rounded-2xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-[#26332B] dark:text-[#FAF9F6] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#166534] dark:text-[#86A789]" /> {t("settings.teamMembers")} ({members.length})
            </h2>
            <p className="text-xs text-[#5E7164] dark:text-[#8EA393]">
              {t("settings.teamMembersSub")}
            </p>
          </div>

          <form onSubmit={handleAddMember} className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <input
                type="email"
                placeholder={t("settings.addEmailPlaceholder")}
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-3.5 py-2 text-sm text-[#26332B] dark:text-[#FAF9F6] placeholder-[#5E7164]/60 dark:placeholder-[#8EA393]/60 focus:border-[#166534] dark:focus:border-[#86A789] focus:bg-[#FFFFFF] dark:focus:bg-[#17221C] focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={isAddingMember}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#166534] hover:bg-[#14532D] px-4 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition"
            >
              {isAddingMember ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              {t("settings.addMember")}
            </button>
          </form>

          {memberError && (
            <div className="mt-3 rounded-xl bg-[#FAF5E8] dark:bg-[#6B5424]/30 p-3 text-xs font-semibold text-[#854D0E] dark:text-[#FACC15] border border-[#CA8A04]/40 dark:border-[#6B5424]">
              {t(`settings.${memberError}`) || memberError}
            </div>
          )}
          {memberSuccess && (
            <div className="mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
              {memberSuccess}
            </div>
          )}

          {/* Members List */}
          <div className="mt-5 divide-y divide-[#E5EBE5] dark:divide-[#26372D] rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#131D17]">
            {members.map((member) => {
              const isMemberOwner = member.uid === project.ownerId;
              const cleanMemberName = (
                member.displayName ||
                member.name ||
                member.email?.split("@")[0] ||
                "عضو"
              )
                .replace(/\s*\([^)]*\)/g, "")
                .trim() || "عضو";

              return (
                <div key={member.uid} className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-3.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#26332B] dark:text-[#FAF9F6] flex flex-wrap items-center gap-1.5">
                        <span className="truncate">{cleanMemberName}</span>
                        {isMemberOwner && (
                          <span className="badge-owner inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold shrink-0">
                            <ShieldCheck className="h-3 w-3" /> {t("project.owner")}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#5E7164] dark:text-[#8EA393] truncate">{member.email}</p>
                    </div>
                  </div>

                  {!isMemberOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.uid)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#854D0E] dark:text-[#FACC15] hover:bg-[#FAF5E8] dark:hover:bg-[#6B5424]/30 transition shrink-0 whitespace-nowrap"
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

        {/* 3. Danger Zone (Earth Gold Palette) */}
        <div className="rounded-2xl border border-[#CA8A04]/40 dark:border-[#6B5424] bg-[#FAF5E8]/60 dark:bg-[#6B5424]/20 p-6 shadow-xs">
          <h2 className="text-base font-bold text-[#854D0E] dark:text-[#FACC15]">{t("settings.dangerZone")}</h2>
          <p className="text-xs text-[#854D0E]/80 dark:text-[#FACC15]/80 mt-1">
            {t("settings.dangerZoneSub")}
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#CA8A04] hover:bg-[#A16207] px-4 py-2 text-xs font-bold text-white shadow-xs transition"
            >
              <Trash2 className="h-4 w-4" /> {t("settings.deleteProject")}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs">
            <div className="w-full max-w-md rounded-2xl bg-[#FFFFFF] dark:bg-[#17221C] p-6 shadow-2xl border border-[#E5EBE5] dark:border-[#26372D] text-center">
              <Trash2 className="mx-auto h-10 w-10 text-[#CA8A04] mb-2" />
              <h3 className="text-lg font-bold text-[#26332B] dark:text-[#FAF9F6]">{t("settings.deleteModalTitle")} &quot;{project.name}&quot;?</h3>
              <p className="mt-2 text-xs text-[#5E7164] dark:text-[#8EA393]">
                {t("settings.deleteModalSub")}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#131D17] px-4 py-2 text-xs font-bold text-[#26332B] dark:text-[#FAF9F6] hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26] transition"
                >
                  {t("taskModal.cancel")}
                </button>
                <button
                  type="button"
                  disabled={isDeletingProject}
                  onClick={handleDeleteProject}
                  className="flex items-center gap-1.5 rounded-xl bg-[#CA8A04] hover:bg-[#A16207] px-4 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition"
                >
                  {isDeletingProject && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {t("settings.confirmDelete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function ProjectSettingsPage() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#166534] dark:text-[#86A789] mb-2" />
          <p className="text-xs text-[#5E7164] dark:text-[#8EA393] font-medium">
            {t("common.loadingSettings") || "Loading project settings..."}
          </p>
        </div>
      }
    >
      <ProjectSettingsContent />
    </Suspense>
  );
}

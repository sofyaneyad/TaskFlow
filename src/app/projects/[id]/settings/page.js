"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
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

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
    setLoading(true);

    try {
      const proj = await getProjectById(projectId);
      if (!proj) {
        router.push("/dashboard");
        return;
      }

      if (proj.ownerId !== user.uid) {
        setIsOwner(false);
        setLoading(false);
        return;
      }

      setIsOwner(true);
      setProject(proj);
      setName(proj.name || "");
      setDescription(proj.description || "");

      const memberDetails = await getProjectMembersDetails(proj.memberIds || []);
      setMembers(memberDetails);
    } catch (err) {
      console.error("Settings load error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, user, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update Project Info
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess(false);

    if (!name || name.trim().length < 3 || name.trim().length > 80) {
      setUpdateError("Project name must be between 3 and 80 characters.");
      return;
    }

    setIsUpdating(true);
    try {
      await updateProject(projectId, { name, description });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setUpdateError(err.message || "Failed to update project.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Add Member by Email
  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError("");
    setMemberSuccess("");

    if (!newMemberEmail.trim()) {
      setMemberError("Please enter an email address.");
      return;
    }

    setIsAddingMember(true);
    try {
      const addedUser = await addProjectMemberByEmail(projectId, newMemberEmail);
      setMemberSuccess(`Successfully added ${addedUser.displayName || addedUser.email} to the project.`);
      setNewMemberEmail("");
      const updatedProj = await getProjectById(projectId);
      setProject(updatedProj);
      const details = await getProjectMembersDetails(updatedProj.memberIds);
      setMembers(details);
    } catch (err) {
      setMemberError(err.message || "Failed to add member.");
    } finally {
      setIsAddingMember(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberId) => {
    try {
      await removeProjectMember(projectId, memberId, user.uid);
      setMembers((prev) => prev.filter((m) => m.uid !== memberId));
    } catch (err) {
      setMemberError(err.message || "Failed to remove member.");
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5] mb-2" />
          <p className="text-xs text-[#64748B] font-medium">Loading...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isOwner) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-[#DC2626]" />
          <h2 className="mt-3 text-lg font-bold text-[#0F172A]">{t("project.accessDenied")}</h2>
          <p className="mt-1 text-xs text-[#64748B]">
            {t("project.accessDeniedSub")}
          </p>
          <div className="mt-6">
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white"
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#4F46E5]"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("settings.backToTasks")}
        </Link>

        {/* Page Header */}
        <div className="border-b border-[#E2E8F0] pb-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-[#4F46E5]" /> {t("settings.title")}
          </h1>
          <p className="mt-1 text-xs text-[#64748B]">
            {t("settings.subtitle")}
          </p>
        </div>

        {/* 1. General Settings Form */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs">
          <h2 className="text-base font-bold text-[#0F172A]">{t("settings.generalInfo")}</h2>
          <p className="text-xs text-[#64748B]">{t("settings.generalInfoSub")}</p>

          {updateError && (
            <div className="mt-3 rounded-xl bg-[#FEF2F2] p-3 text-xs font-semibold text-[#DC2626] border border-[#FECACA]">
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#ECFDF5] p-3 text-xs font-semibold text-[#15803D] border border-[#BBF7D0]">
              <Check className="h-4 w-4" /> {t("settings.updatedSuccess")}
            </div>
          )}

          <form onSubmit={handleUpdateProject} className="mt-4 space-y-4">
            <div>
              <label htmlFor="settings-name" className="block text-xs font-bold text-[#0F172A]">
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
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-sm focus:border-[#4F46E5] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="settings-desc" className="block text-xs font-bold text-[#0F172A]">
                {t("settings.descLabel")}
              </label>
              <textarea
                id="settings-desc"
                rows={3}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-sm focus:border-[#4F46E5] focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition"
              >
                {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {t("settings.saveChanges")}
              </button>
            </div>
          </form>
        </div>

        {/* 2. Team Membership Management */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#4F46E5]" /> {t("settings.teamMembers")} ({members.length})
            </h2>
            <p className="text-xs text-[#64748B]">
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
                className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2 text-sm placeholder-[#94A3B8] focus:border-[#4F46E5] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isAddingMember}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition"
            >
              {isAddingMember ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              {t("settings.addMember")}
            </button>
          </form>

          {memberError && (
            <div className="mt-3 rounded-xl bg-[#FEF2F2] p-3 text-xs font-semibold text-[#DC2626] border border-[#FECACA]">
              {memberError}
            </div>
          )}
          {memberSuccess && (
            <div className="mt-3 rounded-xl bg-[#ECFDF5] p-3 text-xs font-semibold text-[#15803D] border border-[#BBF7D0]">
              {memberSuccess}
            </div>
          )}

          {/* Members List with Design System badges */}
          <div className="mt-5 divide-y divide-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
            {members.map((member) => {
              const isMemberOwner = member.uid === project.ownerId;
              return (
                <div key={member.uid} className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FF] text-xs font-bold text-[#4F46E5]">
                      {member.displayName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
                        <span>{member.displayName || "User"}</span>
                        {isMemberOwner && (
                          <span className="badge-owner inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold">
                            <ShieldCheck className="h-3 w-3" /> {t("project.owner")}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{member.email}</p>
                    </div>
                  </div>

                  {!isMemberOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.uid)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
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
        <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2]/40 p-6 shadow-2xs">
          <h2 className="text-base font-bold text-[#DC2626]">{t("settings.dangerZone")}</h2>
          <p className="text-xs text-[#DC2626]/80 mt-1">
            {t("settings.dangerZoneSub")}
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#DC2626] hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
            >
              <Trash2 className="h-4 w-4" /> {t("settings.deleteProject")}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#E2E8F0] text-center">
              <Trash2 className="mx-auto h-10 w-10 text-[#DC2626] mb-2" />
              <h3 className="text-lg font-bold text-[#0F172A]">{t("settings.deleteModalTitle")} &quot;{project.name}&quot;?</h3>
              <p className="mt-2 text-xs text-[#64748B]">
                {t("settings.deleteModalSub")}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#0F172A] hover:bg-[#F1F5F9]"
                >
                  {t("taskModal.cancel")}
                </button>
                <button
                  type="button"
                  disabled={isDeletingProject}
                  onClick={handleDeleteProject}
                  className="flex items-center gap-1.5 rounded-xl bg-[#DC2626] hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50"
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
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5] mb-2" />
          <p className="text-xs text-[#64748B] font-medium">Loading project settings...</p>
        </div>
      }
    >
      <ProjectSettingsContent />
    </Suspense>
  );
}

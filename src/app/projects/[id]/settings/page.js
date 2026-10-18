"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
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

  // Update Project Info (FR-06)
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

  // Add Member by Email (FR-07, US-04, TC-07, TC-08)
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
      // Refresh members
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

  // Remove Member (FR-07 & Section 13)
  const handleRemoveMember = async (memberId) => {
    try {
      await removeProjectMember(projectId, memberId, user.uid);
      setMembers((prev) => prev.filter((m) => m.uid !== memberId));
    } catch (err) {
      setMemberError(err.message || "Failed to remove member.");
    }
  };

  // Delete Project with Confirmation (FR-06)
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
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading project settings...</p>
        </div>
      </ProtectedRoute>
    );
  }

  // Non-owner rejection (TC-06)
  if (!isOwner) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">Owner Access Only</h2>
          <p className="mt-1 text-xs text-slate-500">
            Only the project owner can access settings, manage team membership, or delete this project.
          </p>
          <div className="mt-6">
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Project
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Project Tasks
        </Link>

        {/* Page Header */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-600" /> Project Settings
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage project details, team membership, and project lifecycle.
          </p>
        </div>

        {/* 1. General Settings Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">General Information</h2>
          <p className="text-xs text-slate-500">Update project name and description.</p>

          {updateError && (
            <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
              <Check className="h-4 w-4" /> Project updated successfully!
            </div>
          )}

          <form onSubmit={handleUpdateProject} className="mt-4 space-y-4">
            <div>
              <label htmlFor="settings-name" className="block text-xs font-semibold text-slate-700">
                Project Name *
              </label>
              <input
                id="settings-name"
                type="text"
                required
                minLength={3}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="settings-desc" className="block text-xs font-semibold text-slate-700">
                Project Description (Optional)
              </label>
              <textarea
                id="settings-desc"
                rows={3}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
              >
                {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* 2. Team Membership Management (FR-07) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" /> Team Members ({members.length})
              </h2>
              <p className="text-xs text-slate-500">
                Add registered teammates by email. Members can view projects and create/update tasks.
              </p>
            </div>
          </div>

          {/* Add member form */}
          <form onSubmit={handleAddMember} className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Enter teammate's registered email..."
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isAddingMember}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {isAddingMember ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              Add Member
            </button>
          </form>

          {memberError && (
            <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {memberError}
            </div>
          )}
          {memberSuccess && (
            <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
              {memberSuccess}
            </div>
          )}

          {/* Current Members List */}
          <div className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {members.map((member) => {
              const isMemberOwner = member.uid === project.ownerId;
              return (
                <div key={member.uid} className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      {member.displayName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {member.displayName || "User"}
                        {isMemberOwner && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                            <ShieldCheck className="h-3 w-3" /> Owner
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500">{member.email}</p>
                    </div>
                  </div>

                  {!isMemberOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.uid)}
                      className="flex items-center gap-1 rounded p-1.5 text-xs text-rose-600 hover:bg-rose-50"
                      title="Remove member from project"
                    >
                      <UserMinus className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Danger Zone: Delete Project (FR-06) */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 shadow-sm">
          <h2 className="text-base font-bold text-rose-900">Danger Zone</h2>
          <p className="text-xs text-rose-700 mt-1">
            Permanently delete this project and all of its associated tasks. This action cannot be reversed.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 focus:outline-none"
            >
              <Trash2 className="h-4 w-4" /> Delete Project
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 text-center">
              <Trash2 className="mx-auto h-10 w-10 text-rose-600 mb-2" />
              <h3 className="text-lg font-bold text-slate-900">Delete Project &quot;{project.name}&quot;?</h3>
              <p className="mt-2 text-xs text-slate-500">
                Are you sure you want to permanently delete this project? All associated tasks will be removed. This operation cannot be undone.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingProject}
                  onClick={handleDeleteProject}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50"
                >
                  {isDeletingProject && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Delete
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
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading project settings...</p>
        </div>
      }
    >
      <ProjectSettingsContent />
    </Suspense>
  );
}


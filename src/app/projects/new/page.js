"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createProject } from "@/services/projects";
import { FolderPlus, ArrowLeft, Loader2 } from "lucide-react";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || name.trim().length < 3 || name.trim().length > 80) {
      setError("Project name is required and must be between 3 and 80 characters.");
      return;
    }

    if (description && description.length > 1000) {
      setError("Description cannot exceed 1000 characters.");
      return;
    }

    setLoading(true);
    try {
      const created = await createProject({
        name: name.trim(),
        description: description.trim(),
        ownerId: user.uid,
      });
      // Instant navigation!
      router.push(`/projects/${created.id}`);
    } catch (err) {
      console.error("Create project error:", err);
      setError(err.message || "Failed to create project. Please try again.");
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#4F46E5] mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-2xs">
          <div className="flex items-center gap-3.5 border-b border-[#F1F5F9] pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
              <FolderPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#0F172A]">Create New Project</h1>
              <p className="text-xs text-[#64748B]">
                You will be the project owner and can add team members.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-[#FEF2F2] p-3 text-xs font-semibold text-[#DC2626] border border-[#FECACA]" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Project Name */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="project-name" className="block text-xs font-bold text-[#0F172A]">
                  Project Name * (3–80 characters)
                </label>
                <span className="text-[11px] font-medium text-[#64748B]">{name.length}/80</span>
              </div>
              <input
                id="project-name"
                type="text"
                required
                minLength={3}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Website Redesign"
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-sm placeholder-[#94A3B8] focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="project-description" className="block text-xs font-bold text-[#0F172A]">
                  Description (Optional, max 1000 characters)
                </label>
                <span className="text-[11px] font-medium text-[#64748B]">{description.length}/1000</span>
              </div>
              <textarea
                id="project-description"
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe project objectives and deliverables..."
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-sm placeholder-[#94A3B8] focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F1F5F9]">
              <Link
                href="/dashboard"
                className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-[#0F172A] hover:bg-[#F1F5F9] transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-5 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

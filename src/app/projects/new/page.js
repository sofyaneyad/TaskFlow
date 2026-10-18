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

    // Validate (Section 10.1)
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
      router.push(`/projects/${created.id}`);
    } catch (err) {
      console.error("Create project error:", err);
      setError(err.message || "Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Create New Project</h1>
              <p className="text-xs text-slate-500">
                You will be the project owner and can add team members.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Project Name */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="project-name" className="block text-xs font-semibold text-slate-700">
                  Project Name * (3–80 characters)
                </label>
                <span className="text-[11px] text-slate-400">{name.length}/80</span>
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
                className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="project-description" className="block text-xs font-semibold text-slate-700">
                  Description (Optional, max 1000 characters)
                </label>
                <span className="text-[11px] text-slate-400">{description.length}/1000</span>
              </div>
              <textarea
                id="project-description"
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe project objectives and deliverables..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link
                href="/dashboard"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 transition"
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

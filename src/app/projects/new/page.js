"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createProject } from "@/services/projects";
import { FolderPlus, ArrowLeft, Loader2 } from "lucide-react";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E7164] dark:text-[#8EA393] hover:text-[#166534] dark:hover:text-[#86A789] transition mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("newProject.backToDashboard")}
        </Link>

        <div className="rounded-2xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3.5 border-b border-[#E5EBE5] dark:border-[#26372D] pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EFE9] text-[#166534] dark:bg-[#1E2E24] dark:text-[#86A789]">
              <FolderPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#26332B] dark:text-[#FAF9F6]">{t("newProject.title")}</h1>
              <p className="text-xs text-[#5E7164] dark:text-[#8EA393]">
                {t("newProject.subtitle")}
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-[#FAF5E8] dark:bg-[#6B5424]/30 p-3 text-xs font-semibold text-[#854D0E] dark:text-[#FACC15] border border-[#CA8A04]/40 dark:border-[#6B5424]" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Project Name */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="project-name" className="block text-xs font-bold text-[#26332B] dark:text-[#FAF9F6]">
                  {t("newProject.nameLabel")} * (3–80)
                </label>
                <span className="text-[11px] font-medium text-[#5E7164] dark:text-[#8EA393]">{name.length}/80</span>
              </div>
              <input
                id="project-name"
                type="text"
                required
                minLength={3}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("newProject.namePlaceholder")}
                className="mt-1.5 w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-3.5 py-2.5 text-sm text-[#26332B] dark:text-[#FAF9F6] placeholder-[#5E7164]/60 dark:placeholder-[#8EA393]/60 focus:border-[#166534] dark:focus:border-[#86A789] focus:bg-[#FFFFFF] dark:focus:bg-[#17221C] focus:outline-none transition"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="project-description" className="block text-xs font-bold text-[#26332B] dark:text-[#FAF9F6]">
                  {t("newProject.descLabel")}
                </label>
                <span className="text-[11px] font-medium text-[#5E7164] dark:text-[#8EA393]">{description.length}/1000</span>
              </div>
              <textarea
                id="project-description"
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("newProject.descPlaceholder")}
                className="mt-1.5 w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] px-3.5 py-2.5 text-sm text-[#26332B] dark:text-[#FAF9F6] placeholder-[#5E7164]/60 dark:placeholder-[#8EA393]/60 focus:border-[#166534] dark:focus:border-[#86A789] focus:bg-[#FFFFFF] dark:focus:bg-[#17221C] focus:outline-none transition"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5EBE5] dark:border-[#26372D]">
              <Link
                href="/dashboard"
                className="rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#131D17] px-4 py-2.5 text-xs font-bold text-[#26332B] dark:text-[#FAF9F6] hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26] transition"
              >
                {t("newProject.cancel")}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#166534] hover:bg-[#14532D] px-5 py-2.5 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? t("newProject.creating") : t("newProject.submit")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

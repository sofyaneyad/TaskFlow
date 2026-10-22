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
      setError("errNameRequired");
      return;
    }

    if (description && description.length > 1000) {
      setError("errDescTooLong");
      return;
    }

    setLoading(true);
    try {
      const created = await createProject({
        name: name.trim(),
        description: description.trim(),
        ownerId: user?.uid,
      });
      router.push(`/projects/${created.id}`);
    } catch (err) {
      console.error("Create project error:", err);
      setError("errCreateFailed");
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#2563EB] dark:hover:text-[#93C5FD] transition mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("newProject.backToDashboard")}
        </Link>

        <div className="rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3.5 border-b border-[#E4E4E7] dark:border-[#27272A] pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-[#18181B] dark:text-[#60A5FA]">
              <FolderPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#09090B] dark:text-[#F4F4F5]">{t("newProject.title")}</h1>
              <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">
                {t("newProject.subtitle")}
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-[#FEF3C7] dark:bg-[#1F170D] p-3 text-xs font-semibold text-[#92400E] dark:text-[#FDE047] border border-[#F59E0B]/30" role="alert">
              {t(`newProject.${error}`) || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Project Name */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="project-name" className="block text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]">
                  {t("newProject.nameLabel")} * (3–80)
                </label>
                <span className="text-[11px] font-medium text-[#64748B] dark:text-[#A1A1AA]">{name.length}/80</span>
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
                className="mt-1.5 w-full rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#F8F9FA] dark:bg-[#09090B] px-3.5 py-2.5 text-sm text-[#09090B] dark:text-[#F4F4F5] placeholder-[#64748B]/60 dark:placeholder-[#A1A1AA]/60 focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:bg-[#FFFFFF] dark:focus:bg-[#121714] focus:outline-none transition"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="project-description" className="block text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]">
                  {t("newProject.descLabel")}
                </label>
                <span className="text-[11px] font-medium text-[#64748B] dark:text-[#A1A1AA]">{description.length}/1000</span>
              </div>
              <textarea
                id="project-description"
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("newProject.descPlaceholder")}
                className="mt-1.5 w-full rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#F8F9FA] dark:bg-[#09090B] px-3.5 py-2.5 text-sm text-[#09090B] dark:text-[#F4F4F5] placeholder-[#64748B]/60 dark:placeholder-[#A1A1AA]/60 focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:bg-[#FFFFFF] dark:focus:bg-[#121714] focus:outline-none transition"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E4E7] dark:border-[#27272A]">
              <Link
                href="/dashboard"
                className="rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#09090B] px-4 py-2.5 text-xs font-bold text-[#09090B] dark:text-[#F4F4F5] hover:bg-[#F1F3F5] dark:hover:bg-[#27272A] transition"
              >
                {t("newProject.cancel")}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] px-5 py-2.5 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition"
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

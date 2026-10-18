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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] dark:text-[#7B9A89] hover:text-[#059669] dark:hover:text-[#00D084] transition mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("newProject.backToDashboard")}
        </Link>

        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#0B1F14] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3.5 border-b border-[#E2E8F0] dark:border-[#133020] pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669] dark:bg-[#0D281A] dark:text-[#00D084]">
              <FolderPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#0F172A] dark:text-[#FFFFFF]">{t("newProject.title")}</h1>
              <p className="text-xs text-[#64748B] dark:text-[#7B9A89]">
                {t("newProject.subtitle")}
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-[#FEF3C7] dark:bg-[#242211] p-3 text-xs font-semibold text-[#92400E] dark:text-[#F59E0B] border border-[#F59E0B]/30" role="alert">
              {t(`newProject.${error}`) || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Project Name */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="project-name" className="block text-xs font-bold text-[#0F172A] dark:text-[#FFFFFF]">
                  {t("newProject.nameLabel")} * (3–80)
                </label>
                <span className="text-[11px] font-medium text-[#64748B] dark:text-[#7B9A89]">{name.length}/80</span>
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
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] dark:border-[#133020] bg-[#F8FAFC] dark:bg-[#06130B] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#FFFFFF] placeholder-[#64748B]/60 dark:placeholder-[#7B9A89]/60 focus:border-[#059669] dark:focus:border-[#00D084] focus:bg-[#FFFFFF] dark:focus:bg-[#06130B] focus:outline-none transition"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="project-description" className="block text-xs font-bold text-[#0F172A] dark:text-[#FFFFFF]">
                  {t("newProject.descLabel")}
                </label>
                <span className="text-[11px] font-medium text-[#64748B] dark:text-[#7B9A89]">{description.length}/1000</span>
              </div>
              <textarea
                id="project-description"
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("newProject.descPlaceholder")}
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] dark:border-[#133020] bg-[#F8FAFC] dark:bg-[#06130B] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#FFFFFF] placeholder-[#64748B]/60 dark:placeholder-[#7B9A89]/60 focus:border-[#059669] dark:focus:border-[#00D084] focus:bg-[#FFFFFF] dark:focus:bg-[#06130B] focus:outline-none transition"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#133020]">
              <Link
                href="/dashboard"
                className="rounded-xl border border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#06130B] px-4 py-2.5 text-xs font-bold text-[#0F172A] dark:text-[#FFFFFF] hover:bg-[#F1F5F9] dark:hover:bg-[#133020] transition"
              >
                {t("newProject.cancel")}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#059669] hover:bg-[#047857] dark:bg-[#00A86B] dark:hover:bg-[#00D084] dark:hover:text-[#06130B] px-5 py-2.5 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition"
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

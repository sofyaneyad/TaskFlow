"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, LayoutDashboard } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const isRTL = lang === "ar";

  return (
    <div className="relative isolate overflow-hidden min-h-[calc(100vh-5rem)] flex items-center">
      {/* Calm subtle Forest & Sage background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#166534]/15 to-[#86A789]/20 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:flex lg:items-center lg:gap-x-10 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
          {/* Calm Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8EFE9] dark:bg-[#1E2E24] border border-[#C8DAC9] dark:border-[#26372D] px-3.5 py-1 text-xs font-semibold text-[#166534] dark:text-[#86A789]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#166534] dark:bg-[#86A789]" />
            <span>{isRTL ? "منصة ذكية وبسيطة لإدارة المهام والمشاريع" : "Simple & Elegant Task & Project Management"}</span>
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-[#26332B] dark:text-[#FAF9F6] sm:text-6xl">
            {isRTL ? (
              <>
                نظّم أعمال فريقك مع <span className="text-[#166534] dark:text-[#86A789]">TaskFlow</span>
              </>
            ) : (
              <>
                Organize your workflow with <span className="text-[#166534] dark:text-[#86A789]">TaskFlow</span>
              </>
            )}
          </h1>

          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#5E7164] dark:text-[#8EA393]">
            {isRTL
              ? "مساحة عمل هادئة ومصممة بعناية لمساعدتك أنت وفريقك على التخطيط، والمتابعة، وإنجاز المشاريع في وقتها. تدعم الوضعين الداكن والفاتح ولغات متعددة مع استجابة فائقة السرعة."
              : "A calm, purposeful workspace designed to help you and your team plan, track, and complete projects with clarity. Supporting dark & light modes and multiple languages seamlessly."}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-[#166534] hover:bg-[#14532D] px-6 py-3.5 text-sm font-bold text-white shadow-xs transition"
              >
                <LayoutDashboard className="h-4 w-4" /> {t("nav.dashboard") || "Go to Dashboard"}
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-xl bg-[#166534] hover:bg-[#14532D] px-6 py-3.5 text-sm font-bold text-white shadow-xs transition"
                >
                  {t("auth.createAccountLink") || "Get Started Free"} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] px-6 py-3.5 text-sm font-bold text-[#26332B] dark:text-[#FAF9F6] shadow-2xs hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26] transition"
                >
                  {t("auth.signInBtn") || "Sign In"}
                </Link>
              </>
            )}
          </div>

          {/* Quick Features List */}
          <div className="mt-12 border-t border-[#E5EBE5] dark:border-[#26372D] pt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5E7164] dark:text-[#8EA393]">
              <CheckCircle2 className="h-4 w-4 text-[#166534] dark:text-[#86A789] shrink-0" />
              <span>{isRTL ? "استجابة فورية وحفظ محلي" : "Instant Local Responsiveness"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5E7164] dark:text-[#8EA393]">
              <ShieldCheck className="h-4 w-4 text-[#166534] dark:text-[#86A789] shrink-0" />
              <span>{isRTL ? "دعم كامل للغات والوضع الداكن" : "Multi-Language & Dark/Light"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5E7164] dark:text-[#8EA393]">
              <Zap className="h-4 w-4 text-[#166534] dark:text-[#86A789] shrink-0" />
              <span>{isRTL ? "لوحة كانبان وإحصائيات دقيقة" : "Kanban Board & Real Stats"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

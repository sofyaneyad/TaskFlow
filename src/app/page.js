"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const isRTL = lang === "ar";

  return (
    <div className="relative isolate overflow-hidden min-h-[calc(100vh-5rem)] flex items-center">
      {/* Background glow decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#059669]/15 to-[#00D084]/20 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:flex lg:items-center lg:gap-x-10 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ECFDF5] dark:bg-[#0D281A] border border-[#A7F3D0] dark:border-[#133020] px-3.5 py-1 text-xs font-semibold text-[#059669] dark:text-[#00D084]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#059669] dark:bg-[#00D084]" />
            <span>{isRTL ? "منصة ذكية وبسيطة لإدارة المهام والمشاريع" : "Simple & Elegant Task & Project Management"}</span>
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#FFFFFF] sm:text-6xl">
            {isRTL ? (
              <>
                نظّم أعمال فريقك مع <span className="text-[#059669] dark:text-[#00D084]">TaskFlow</span>
              </>
            ) : (
              <>
                Organize your workflow with <span className="text-[#059669] dark:text-[#00D084]">TaskFlow</span>
              </>
            )}
          </h1>

          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#64748B] dark:text-[#7B9A89]">
            {isRTL
              ? "مساحة عمل هادئة ومصممة بعناية لمساعدتك أنت وفريقك على التخطيط، والمتابعة، وإنجاز المشاريع في وقتها."
              : "A calm, purposeful workspace designed to help you and your team plan, track, and complete projects with clarity."}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-[#059669] hover:bg-[#047857] dark:bg-[#00A86B] dark:hover:bg-[#00D084] dark:hover:text-[#06130B] px-6 py-3.5 text-sm font-bold text-white shadow-xs transition"
              >
                <LayoutDashboard className="h-4 w-4" /> {t("nav.dashboard") || "Go to Dashboard"}
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-xl bg-[#059669] hover:bg-[#047857] dark:bg-[#00A86B] dark:hover:bg-[#00D084] dark:hover:text-[#06130B] px-6 py-3.5 text-sm font-bold text-white shadow-xs transition"
                >
                  {t("auth.createAccountLink") || "Get Started Free"} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-[#E2E8F0] dark:border-[#133020] bg-[#FFFFFF] dark:bg-[#06130B] px-6 py-3.5 text-sm font-bold text-[#0F172A] dark:text-[#FFFFFF] shadow-xs hover:bg-[#F1F5F9] dark:hover:bg-[#133020] transition"
                >
                  {t("auth.signInBtn") || "Sign In"}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

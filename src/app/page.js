"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, LayoutDashboard, Sparkles } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="relative isolate overflow-hidden min-h-[calc(100vh-5rem)] flex items-center">
      {/* Background glow decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:flex lg:items-center lg:gap-x-10 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Task Management & AI Collaboration</span>
          </div>

          <h1 className="mt-8 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Streamline your workflow with <span className="text-blue-600 dark:text-blue-500">TaskFlow</span>.
          </h1>

          <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            A responsive, high-performance project & task management platform designed for speed, clarity, and modern team collaboration. Switch effortlessly between Dark & Light themes, collaborate across multiple languages, and track deadlines with sub-50ms local responsiveness.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition"
              >
                <LayoutDashboard className="h-4 w-4" /> {t("nav.dashboard") || "Go to Dashboard"}
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition"
                >
                  {t("auth.createAccountLink") || "Get Started Free"} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#16161C] px-6 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-[#202028] transition"
                >
                  {t("auth.signInBtn") || "Sign In"}
                </Link>
              </>
            )}
          </div>

          {/* Quick Features List */}
          <div className="mt-12 border-t border-slate-200 dark:border-[#262632] pt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Instant Local Cache (&lt;50ms)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Multi-Language & Dark/Light Mode</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <Zap className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Kanban Lifecycle & Real-Time Stats</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

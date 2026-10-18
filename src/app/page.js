"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, CheckCircle2, ShieldCheck, Users, Zap, LayoutDashboard } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="relative isolate overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:pb-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-600" />
            7-Day Full-Stack Development Challenge
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Streamline your team&apos;s workflow with <span className="text-indigo-600">TaskFlow</span>.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            A responsive, high-performance project & task management system built with Next.js App Router and Cloud Firestore. Create projects, collaborate with teammates, track task lifecycles, and monitor deadlines effortlessly.
          </p>

          <div className="mt-10 flex items-center gap-x-4">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition"
              >
                <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition"
                >
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Quick Features List */}
          <div className="mt-12 border-t border-slate-200 pt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> End-to-End Firestore Persistence
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <ShieldCheck className="h-4 w-4 text-indigo-600" /> Strict Security Rules & Auth
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Zap className="h-4 w-4 text-amber-600" /> Overdue Alerts & Real-time Filters
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

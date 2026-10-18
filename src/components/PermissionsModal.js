"use client";

import { ShieldCheck, UserCheck, Check, X, Shield, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PermissionsModal({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  if (!isOpen) return null;

  const isRTL = lang === "ar";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#16161C] p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 rounded-xl p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#22222E] hover:text-slate-900 dark:hover:text-white transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pb-5 border-b border-slate-200 dark:border-[#262632]">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {isRTL ? "الفرق بين صلاحيات Owner و Member" : "Owner vs Member Permissions"}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isRTL
              ? "تفاصيل إدارة الأدوار والصلاحيات في مشاريع TaskFlow"
              : "Role-based access control and authority breakdown in TaskFlow"}
          </p>
        </div>

        {/* Comparison Cards Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Owner Card */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">Owner</h4>
                  <p className="text-[11px] font-medium text-emerald-600/80 dark:text-emerald-400/80">
                    {isRTL ? "صلاحيات كاملة لإدارة المشروع" : "Full project management authority"}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-200">
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "إنشاء وتعديل وحذف المشروع" : "Create, edit, & delete project"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "إدارة أعضاء الفريق (إضافة وإزالة)" : "Manage team members (invite/remove)"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "تعيين المهام وتعديلها وحذفها" : "Assign, update, & delete all tasks"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "التحكم في إعدادات المشروع" : "Full access to project settings"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "عرض جميع المهام والتقارير" : "View all tasks, metrics, & reports"}</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 rounded-xl bg-white/90 dark:bg-[#1E1E28] p-2 text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
              {isRTL ? "مخصص لمالك المشروع ومدير الفريق" : "Reserved for Project Creator / Lead"}
            </div>
          </div>

          {/* 2. Member Card */}
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-blue-600 dark:text-blue-400">Member</h4>
                  <p className="text-[11px] font-medium text-blue-600/80 dark:text-blue-400/80">
                    {isRTL ? "صلاحيات محدودة حسب الإضافة" : "Scoped contributor permissions"}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-200">
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "عرض المشروع ولوحة المهام" : "View project & Kanban board"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "تحديث حالة المهام المخصصة له" : "Update status of assigned tasks"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "إنشاء مهام جديدة والتعاون" : "Create new tasks & collaborate"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "عرض أعضاء الفريق المشاركين" : "View participating team members"}</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <X className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "لا يمكن تعديل الإعدادات أو إدارة الأعضاء" : "Cannot edit settings or team members"}</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 rounded-xl bg-white/90 dark:bg-[#1E1E28] p-2 text-center text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
              {isRTL ? "مخصص للمتعاونين وأعضاء الفريق" : "Standard Team Contributor Role"}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2 text-xs font-bold text-white shadow-xs transition"
          >
            {isRTL ? "فهمت ذلك" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}

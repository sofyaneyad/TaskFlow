"use client";

import { ShieldCheck, UserCheck, Check, X, Shield, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PermissionsModal({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  if (!isOpen) return null;

  const isRTL = lang === "ar";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 rounded-xl p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pb-5 border-b border-[#E2E8F0]">
          <h3 className="text-xl font-extrabold text-[#0F172A]">
            {isRTL ? "الفرق بين صلاحيات Owner و Member" : "Owner vs Member Permissions"}
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">
            {isRTL
              ? "تفاصيل إدارة الأدوار والصلاحيات في مشاريع TaskFlow"
              : "Role-based access control and authority breakdown in TaskFlow"}
          </p>
        </div>

        {/* Comparison Cards Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Owner Card */}
          <div className="rounded-2xl border border-[#BBF7D0] bg-[#ECFDF5]/50 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#15803D] text-white shadow-xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[#15803D]">Owner</h4>
                  <p className="text-[11px] font-medium text-[#15803D]/80">
                    {isRTL ? "صلاحيات كاملة لإدارة المشروع" : "Full project management authority"}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2.5 text-xs text-[#0F172A]">
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "إنشاء وتعديل وحذف المشروع" : "Create, edit, & delete project"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "إدارة أعضاء الفريق (إضافة وإزالة)" : "Manage team members (invite/remove)"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "تعيين المهام وتعديلها وحذفها" : "Assign, update, & delete all tasks"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "التحكم في إعدادات المشروع" : "Full access to project settings"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "عرض جميع المهام والتقارير" : "View all tasks, metrics, & reports"}</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 rounded-xl bg-white/80 p-2 text-center text-[11px] font-bold text-[#15803D] border border-[#BBF7D0]">
              {isRTL ? "مخصص لمالك المشروع ومدير الفريق" : "Reserved for Project Creator / Lead"}
            </div>
          </div>

          {/* 2. Member Card */}
          <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF]/50 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-xs">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[#2563EB]">Member</h4>
                  <p className="text-[11px] font-medium text-[#2563EB]/80">
                    {isRTL ? "صلاحيات محدودة حسب الإضافة" : "Scoped contributor permissions"}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2.5 text-xs text-[#0F172A]">
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "عرض المشروع ولوحة المهام" : "View project & Kanban board"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "تحديث حالة المهام المخصصة له" : "Update status of assigned tasks"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "إنشاء مهام جديدة والتعاون" : "Create new tasks & collaborate"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "عرض أعضاء الفريق المشاركين" : "View participating team members"}</span>
                </li>
                <li className="flex items-center gap-2 text-[#94A3B8]">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#CBD5E1] text-white">
                    <X className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>{isRTL ? "لا يمكن تعديل الإعدادات أو إدارة الأعضاء" : "Cannot edit settings or team members"}</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 rounded-xl bg-white/80 p-2 text-center text-[11px] font-bold text-[#2563EB] border border-[#BFDBFE]">
              {isRTL ? "مخصص للمتعاونين وأعضاء الفريق" : "Standard Team Contributor Role"}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#0F172A] hover:bg-slate-800 px-6 py-2 text-xs font-bold text-white shadow-xs transition"
          >
            {isRTL ? "فهمت ذلك" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}

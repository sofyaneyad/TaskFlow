"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Trash2, HelpCircle, AlertCircle, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Reusable Confirmation Modal matching TaskFlow's Precision Design System
 * Completely replaces browser window.confirm / alert with accessible Radix UI & Lucide icons.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  variant = "danger", // "danger" | "warning" | "primary"
  icon: CustomIcon,
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  const { lang, dir, t } = useLanguage();

  const handleCancel = () => {
    if (isLoading) return;
    onCancel?.();
    onOpenChange?.(false);
  };

  const handleConfirm = async () => {
    if (isLoading) return;
    await onConfirm?.();
  };

  const variantStyles = {
    danger: {
      iconBg: "bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20",
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white shadow-xs focus:ring-red-500",
      defaultIcon: Trash2,
    },
    warning: {
      iconBg: "bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-[#FDE047] border border-amber-500/20",
      confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus:ring-amber-500",
      defaultIcon: AlertTriangle,
    },
    primary: {
      iconBg: "bg-[#2563EB]/10 dark:bg-[#3B82F6]/15 text-[#2563EB] dark:text-[#60A5FA] border border-[#2563EB]/20",
      confirmBtn: "bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white shadow-xs focus:ring-[#2563EB]",
      defaultIcon: HelpCircle,
    },
  }[variant] || {
    iconBg: "bg-red-500/10 text-red-600 border border-red-500/20",
    confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
    defaultIcon: Trash2,
  };

  const IconComponent = CustomIcon || variantStyles.defaultIcon;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200" />
        <Dialog.Content
          dir={dir}
          className="fixed left-1/2 top-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#141416] p-6 shadow-2xl focus:outline-none animate-in zoom-in-95 duration-200"
        >
          <div className="flex items-start gap-4">
            {/* Lucide Icon Badge */}
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${variantStyles.iconBg}`}>
              <IconComponent className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-0.5">
              <Dialog.Title className="text-sm font-extrabold text-[#09090B] dark:text-[#F4F4F5]">
                {title || (lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1.5 text-xs text-[#64748B] dark:text-[#A1A1AA] leading-relaxed">
                  {description}
                </Dialog.Description>
              )}
            </div>

            {/* Close X */}
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="rounded-lg p-1 text-[#64748B] dark:text-[#A1A1AA] hover:bg-[#F1F3F5] dark:hover:bg-[#27272A] hover:text-[#09090B] dark:hover:text-[#FFFFFF] transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-[#E4E4E7] dark:border-[#27272A]">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#09090B] px-4 py-2 text-xs font-bold text-[#09090B] dark:text-[#F4F4F5] hover:bg-[#F1F3F5] dark:hover:bg-[#27272A] transition cursor-pointer disabled:opacity-50"
            >
              {cancelText || (lang === "ar" ? "إلغاء" : "Cancel")}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer disabled:opacity-50 ${variantStyles.confirmBtn}`}
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {confirmText || (lang === "ar" ? "تأكيد" : "Confirm")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

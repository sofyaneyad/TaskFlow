"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ToastContext = createContext({
  showToast: () => {},
  toast: null,
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { dir } = useLanguage();

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message, duration = 4000 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      const newToast = { id, type, title, message };

      setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Floating Toast Container */}
      <div
        dir={dir}
        className="fixed bottom-5 end-5 z-[100] flex flex-col gap-2.5 max-w-sm w-[calc(100%-2.5rem)] pointer-events-none"
      >
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              icon: CheckCircle2,
              border: "border-emerald-500/20 dark:border-emerald-500/30",
              bg: "bg-white dark:bg-[#141416]",
              iconColor: "text-emerald-500 dark:text-emerald-400",
              badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
            },
            error: {
              icon: AlertCircle,
              border: "border-red-500/20 dark:border-red-500/30",
              bg: "bg-white dark:bg-[#141416]",
              iconColor: "text-red-500 dark:text-red-400",
              badgeBg: "bg-red-500/10 dark:bg-red-500/15",
            },
            warning: {
              icon: AlertTriangle,
              border: "border-amber-500/20 dark:border-amber-500/30",
              bg: "bg-white dark:bg-[#141416]",
              iconColor: "text-amber-500 dark:text-amber-400",
              badgeBg: "bg-amber-500/10 dark:bg-amber-500/15",
            },
            info: {
              icon: Info,
              border: "border-[#2563EB]/20 dark:border-[#3B82F6]/30",
              bg: "bg-white dark:bg-[#141416]",
              iconColor: "text-[#2563EB] dark:text-[#60A5FA]",
              badgeBg: "bg-[#2563EB]/10 dark:bg-[#3B82F6]/15",
            },
          }[toast.type] || {
            icon: Info,
            border: "border-zinc-200 dark:border-zinc-800",
            bg: "bg-white dark:bg-[#141416]",
            iconColor: "text-zinc-500",
            badgeBg: "bg-zinc-100 dark:bg-zinc-800",
          };

          const Icon = typeConfig.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border ${typeConfig.border} ${typeConfig.bg} p-3.5 shadow-xl transition-all animate-in slide-in-from-bottom-3 fade-in duration-200`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${typeConfig.badgeBg} ${typeConfig.iconColor}`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                {toast.title && (
                  <h5 className="text-xs font-bold text-[#09090B] dark:text-[#F4F4F5] leading-tight">
                    {toast.title}
                  </h5>
                )}
                {toast.message && (
                  <p className="mt-0.5 text-[11px] text-[#64748B] dark:text-[#A1A1AA] leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-md p-1 text-[#64748B] dark:text-[#A1A1AA] hover:bg-[#F1F3F5] dark:hover:bg-[#27272A] hover:text-[#09090B] dark:hover:text-[#FFFFFF] transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

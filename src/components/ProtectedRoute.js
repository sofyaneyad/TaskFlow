"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { Loader2 } from "lucide-react";

const emptySubscribe = () => () => {};

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/login");
    }
  }, [mounted, user, loading, router]);

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#2563EB] dark:text-[#60A5FA] mb-4" />
        <p className="text-sm font-medium text-[#64748B] dark:text-[#A1A1AA]">
          {t("common.loadingWorkspace")}
        </p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}

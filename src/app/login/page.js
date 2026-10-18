"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Lock, Mail, Loader2, ArrowRight, CheckSquare } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("errEmailPasswordRequired");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      console.error("Sign in error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("errInvalidCredentials");
      } else if (err.code === "auth/too-many-requests") {
        setError("errTooManyRequests");
      } else {
        setError("errLoginFailed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      console.error("Google sign in error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        // User just cancelled popup, no error needed
      } else if (err.code === "auth/unauthorized-domain") {
        setError("errUnauthorizedDomain");
      } else {
        setError("errGoogleFailed");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#17221C] p-8 shadow-xs">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#166534] border border-[#14532D] shadow-xs">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-[#26332B] dark:text-[#FAF9F6]">
            {t("auth.signInTitle")}
          </h2>
          <p className="mt-1 text-xs text-[#5E7164] dark:text-[#8EA393]">
            {t("auth.signInSub")}
          </p>
        </div>

        {/* Error Alert (Earth Gold Palette) */}
        {error && (
          <div className="rounded-xl bg-[#FAF5E8] dark:bg-[#6B5424]/30 p-3.5 text-xs font-semibold text-[#854D0E] dark:text-[#FACC15] border border-[#CA8A04]/40 dark:border-[#6B5424]" role="alert">
            {t(`auth.${error}`) || error}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FFFFFF] dark:bg-[#131D17] px-4 py-2.5 text-sm font-semibold text-[#26332B] dark:text-[#FAF9F6] shadow-2xs hover:bg-[#FAF9F6] dark:hover:bg-[#1F2E26] focus:outline-none disabled:opacity-50 transition"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#5E7164]" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
          )}
          <span>{t("auth.signInGoogle")}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-[#E5EBE5] dark:border-[#26372D]" />
          <span className="bg-[#FFFFFF] dark:bg-[#17221C] px-3 text-[11px] font-medium uppercase tracking-wider text-[#5E7164] dark:text-[#8EA393]">
            {t("auth.orWithEmail")}
          </span>
        </div>

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-[#26332B] dark:text-[#FAF9F6]">
              {t("auth.emailLabel")}
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5E7164] dark:text-[#8EA393]" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] py-2.5 pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-sm text-[#26332B] dark:text-[#FAF9F6] placeholder-[#5E7164]/60 dark:placeholder-[#8EA393]/60 focus:border-[#166534] dark:focus:border-[#86A789] focus:bg-[#FFFFFF] dark:focus:bg-[#17221C] focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-[#26332B] dark:text-[#FAF9F6]">
              {t("auth.passwordLabel")}
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5E7164] dark:text-[#8EA393]" />
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#E5EBE5] dark:border-[#26372D] bg-[#FAF9F6] dark:bg-[#131D17] py-2.5 pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-sm text-[#26332B] dark:text-[#FAF9F6] placeholder-[#5E7164]/60 dark:placeholder-[#8EA393]/60 focus:border-[#166534] dark:focus:border-[#86A789] focus:bg-[#FFFFFF] dark:focus:bg-[#17221C] focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#166534] hover:bg-[#14532D] py-2.5 text-sm font-bold text-white shadow-xs disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {t("auth.signInBtn")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="text-center text-xs text-[#5E7164] dark:text-[#8EA393]">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="font-semibold text-[#166534] dark:text-[#86A789] hover:underline">
            {t("auth.createAccountLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { CheckSquare, LayoutDashboard, PlusCircle, LogOut, Menu, X, User } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <CheckSquare className="h-5 w-5" />
          </div>
          <span className="text-xl tracking-tight text-indigo-950">TaskFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/projects/new"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
              >
                <PlusCircle className="h-4 w-4" />
                New Project
              </Link>

              <div className="h-5 w-px bg-slate-200" aria-hidden="true" />

              {/* User Pill */}
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span className="max-w-[150px] truncate">
                  {userProfile?.displayName || user.displayName || user.email.split("@")[0]}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                aria-label="Log out of TaskFlow"
              >
                <LogOut className="h-3.5 w-3.5 text-slate-500" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition px-3 py-2 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition"
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-3">
          {user ? (
            <>
              <div className="border-b border-slate-100 pb-2">
                <p className="text-xs text-slate-500">Signed in as</p>
                <p className="text-sm font-semibold text-slate-900">
                  {userProfile?.displayName || user.displayName || user.email}
                </p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/projects/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                <PlusCircle className="h-4 w-4" />
                New Project
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 mt-2 rounded-lg bg-red-50 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

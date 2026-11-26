"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  GraduationCap,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
} from "lucide-react";
import type { ActiveSessionInfo, StudentAccount, UserRole } from "@/types/student";
import { getAvatarOption } from "@/lib/students";
import {
  consumeKickNotice,
  getDeviceLabel,
  getOrCreateDeviceId,
  saveCachedSession,
  useAuthSession,
} from "@/lib/auth-client";

interface QuickAccountItem {
  id: string;
  name: string;
  username: string;
  level: string;
  avatarId: string;
  pin: string;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole =
    searchParams.get("role") === "admin" ? "admin" : "student";

  const { session, checking } = useAuthSession();

  const [role, setRole] = useState<UserRole>(initialRole);
  const [username, setUsername] = useState(
    initialRole === "admin" ? "admin" : ""
  );
  const [secret, setSecret] = useState(
    initialRole === "admin" ? "admin123" : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [kickNotice, setKickNotice] = useState<string | null>(() =>
    consumeKickNotice()
  );
  const [quickAccounts, setQuickAccounts] = useState<QuickAccountItem[]>([]);

  useEffect(() => {
    if (!checking && session) {
      router.replace(session.role === "admin" ? "/admin" : "/");
    }
  }, [checking, session, router]);

  useEffect(() => {
    fetch("/api/students?public=1", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { accounts?: QuickAccountItem[] }) => {
        if (Array.isArray(data.accounts)) {
          setQuickAccounts(data.accounts);
        }
      })
      .catch(() => {});
  }, []);

  function switchRole(nextRole: UserRole) {
    setRole(nextRole);
    setError("");
    if (nextRole === "admin") {
      setUsername("admin");
      setSecret("admin123");
    } else {
      setUsername("");
      setSecret("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          username,
          secret,
          deviceId: getOrCreateDeviceId(),
          deviceLabel: getDeviceLabel(),
        }),
      });

      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        session?: ActiveSessionInfo;
        student?: StudentAccount;
      };

      if (!res.ok || !data.ok || !data.session) {
        setError(data.error ?? "Login gagal, periksa username & PIN/password.");
        setSubmitting(false);
        return;
      }

      saveCachedSession(data.session);
      setKickNotice(null);
      router.replace(data.session.role === "admin" ? "/admin" : "/");
    } catch {
      setError("Tidak dapat terhubung ke server.");
      setSubmitting(false);
    }
  }

  function handleQuickFill(acc: QuickAccountItem) {
    setRole("student");
    setUsername(acc.username);
    setSecret(acc.pin);
    setError("");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-amber-50/70 px-4 py-10">
      {/* Decorative soft blobs */}
      <motion.div
        animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 16, 0], x: [0, -10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white/90 p-6 sm:p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.06 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30"
          >
            <GraduationCap className="h-7 w-7" />
          </motion.div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
            Selamat Datang di EduPlay
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Platform Belajar & Game Edukasi Calistung hingga Universitas
          </p>
        </div>

        {/* Auto-logout alert if kicked from another device */}
        <AnimatePresence>
          {kickNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-5 flex items-start gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs font-semibold text-amber-900"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>{kickNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role Switcher */}
        <div className="mt-6 grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1.5">
          {[
            { id: "student" as const, label: "Masuk sebagai Murid", icon: Sparkles },
            { id: "admin" as const, label: "Masuk sebagai Admin", icon: ShieldCheck },
          ].map((tab) => {
            const active = role === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchRole(tab.id)}
                className={`relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                  active ? "text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="loginRolePill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className={`absolute inset-0 rounded-xl shadow-md ${
                      tab.id === "student"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600"
                        : "bg-slate-900"
                    }`}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">
              {role === "student" ? "Username Anak" : "Username Admin"}
            </label>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === "student" ? "contoh: aisyah_tk" : "admin"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">
              {role === "student" ? "PIN Masuk Anak (4 Digit)" : "Password Admin"}
            </label>
            <div className="relative mt-1.5">
              <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={role === "student" ? "••••" : "Masukkan password admin"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm font-medium tracking-wider text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-all cursor-pointer disabled:opacity-60 ${
              role === "student"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-500/25 hover:brightness-110"
                : "bg-slate-900 shadow-slate-900/20 hover:bg-slate-800"
            }`}
          >
            {submitting
              ? "Memverifikasi Perangkat..."
              : role === "student"
              ? "Mulai Belajar & Main!"
              : "Masuk ke Dashboard Admin"}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </form>

        {/* Quick Demo Picker for Student or Hint for Admin */}
        {role === "student" && quickAccounts.length > 0 && (
          <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pilih Cepat Akun Anak (Demo)
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {quickAccounts.map((acc) => {
                const av = getAvatarOption(acc.avatarId);
                return (
                  <motion.button
                    key={acc.id}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleQuickFill(acc)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer"
                  >
                    <span>{av.emoji}</span>
                    <span>{acc.name.split(" ")[0]}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                      {acc.level}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {role === "admin" && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Kredensial Demo Admin:</span>{" "}
            Username <code className="rounded bg-white px-1.5 py-0.5 font-mono">admin</code> · Password{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono">admin123</code>
          </div>
        )}

        {/* Single-device & cache info */}
        <div className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] font-medium text-slate-400">
          <Smartphone className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
          <span>
            Sesi tersimpan otomatis (cache) · 1 akun hanya aktif di 1 perangkat
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-500">
          Memuat halaman login...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

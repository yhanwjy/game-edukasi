"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown,
  BookOpen,
  Flame,
  GraduationCap,
  LogOut,
  RotateCcw,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import type {
  ActiveSessionInfo,
  EducationLevel,
  StageLevels,
  StudentAccount,
} from "@/types/student";
import {
  EDUCATION_LEVELS,
  INITIAL_STUDENTS,
  getOverallProgress,
} from "@/lib/students";
import { useAuthSession } from "@/lib/auth-client";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { LevelAnalyticsSection } from "@/components/LevelAnalyticsSection";
import { StudentCard } from "@/components/StudentCard";
import { AddStudentModal } from "@/components/AddStudentModal";
import { StudentDetailModal } from "@/components/StudentDetailModal";
import { CurriculumManagerPanel } from "@/components/CurriculumManagerPanel";

type SortMode = "progress" | "xp" | "name" | "newest";

const SAMPLE_GAMES_BY_LEVEL: Record<
  EducationLevel,
  Array<{ name: string; category: "Membaca" | "Menulis" | "Berhitung" | "Logika" }>
> = {
  TK: [
    { name: "Tangkap Balon Huruf", category: "Membaca" },
    { name: "Tracing Angka Ceria", category: "Menulis" },
    { name: "Hitung Bintang Ajaib", category: "Berhitung" },
  ],
  SD: [
    { name: "Balap Hitung Cepat", category: "Berhitung" },
    { name: "Dikte Kata Bergambar", category: "Menulis" },
    { name: "Teka-Teki Cerita Pendek", category: "Membaca" },
  ],
  SMP: [
    { name: "Arena Aljabar Seru", category: "Berhitung" },
    { name: "Detektif Literasi", category: "Membaca" },
    { name: "Puzzle Logika Sains", category: "Logika" },
  ],
  SMA: [
    { name: "Sprint Trigonometri", category: "Berhitung" },
    { name: "Simulasi Kuis SNBT", category: "Logika" },
    { name: "Analisis Wacana Cepat", category: "Membaca" },
  ],
  Universitas: [
    { name: "Flashcard Statistika", category: "Berhitung" },
    { name: "Studi Kasus Riset", category: "Logika" },
    { name: "Ringkasan Jurnal Akademik", category: "Membaca" },
  ],
};

export function AdminDashboard() {
  const router = useRouter();
  const { session, checking, logout } = useAuthSession();

  const [students, setStudents] = useState<StudentAccount[]>(INITIAL_STUDENTS);
  const [activeSessions, setActiveSessions] = useState<
    Record<string, ActiveSessionInfo>
  >({});
  const [activeLevel, setActiveLevel] = useState<EducationLevel | "ALL">("ALL");
  const [adminView, setAdminView] = useState<"students" | "curriculum">(
    "students"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("progress");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (checking) return;
    if (!session) {
      router.replace("/login?role=admin");
      return;
    }
    if (session.role !== "admin") {
      router.replace("/");
    }
  }, [checking, session, router]);

  const fetchRoster = useCallback(async () => {
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        students?: StudentAccount[];
        activeSessions?: Record<string, ActiveSessionInfo>;
      };
      if (Array.isArray(data.students)) {
        setStudents(data.students);
      }
      if (data.activeSessions) {
        setActiveSessions(data.activeSessions);
      }
    } catch {
      // Ignore transient network errors
    }
  }, []);

  useEffect(() => {
    if (!session || session.role !== "admin") return;
    const initTimer = window.setTimeout(() => {
      void fetchRoster();
    }, 0);
    const interval = window.setInterval(() => {
      void fetchRoster();
    }, 4000);
    return () => {
      window.clearTimeout(initTimer);
      window.clearInterval(interval);
    };
  }, [session, fetchRoster]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => {
      setToast((curr) => (curr === message ? null : curr));
    }, 2800);
  }

  async function handleAddStudent(newStudent: StudentAccount) {
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", student: newStudent }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        student?: StudentAccount;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        showToast(data.error ?? "Gagal menambahkan akun anak.");
        return;
      }
      setStudents((prev) => [newStudent, ...prev]);
      showToast(
        `Akun "${newStudent.name}" (${newStudent.level}) berhasil ditambahkan!`
      );
    } catch {
      showToast("Terjadi gangguan koneksi saat menyimpan akun.");
    }
  }

  async function handleSimulateBoost(studentId: string) {
    const target = students.find((s) => s.id === studentId);
    if (!target) return;

    const pool = SAMPLE_GAMES_BY_LEVEL[target.level];
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const xpGain = 75 + Math.floor(Math.random() * 55);
    const minGain = 5 + Math.floor(Math.random() * 6);
    const score = 88 + Math.floor(Math.random() * 12);

    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_game",
          gameName: picked.name,
          category: picked.category,
          score,
          stars: 3,
          xpGain,
          minutesGain: minGain,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        student?: StudentAccount;
      };
      if (data.ok && data.student) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? data.student! : s))
        );
        showToast(`${target.name} menyelesaikan mini-game & mendapat +${xpGain} XP!`);
      }
    } catch {
      showToast("Gagal memperbarui progres simulasi.");
    }
  }

  async function handleUpdateStudent(
    studentId: string,
    patch: Partial<Pick<StudentAccount, "level" | "notes">> & {
      stageLevels?: Partial<StageLevels>;
    }
  ) {
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "patch", ...patch }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        student?: StudentAccount;
      };
      if (data.ok && data.student) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? data.student! : s))
        );
        if (patch.level) {
          showToast(`Jenjang diperbarui ke ${patch.level}`);
        } else if (patch.stageLevels) {
          showToast("Pengaturan level belajar anak berhasil diperbarui!");
        }
      }
    } catch {
      showToast("Gagal menyimpan perubahan.");
    }
  }

  async function handleDeleteStudent(studentId: string) {
    const target = students.find((s) => s.id === studentId);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
        if (target) {
          showToast(`Akun "${target.name}" telah dihapus.`);
        }
      }
    } catch {
      showToast("Gagal menghapus akun.");
    }
  }

  async function handleResetDemo() {
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        students?: StudentAccount[];
      };
      if (data.ok && data.students) {
        setStudents(data.students);
        setActiveLevel("ALL");
        setSearchQuery("");
        showToast("Data demo berhasil dikembalikan ke kondisi awal.");
      }
    } catch {
      showToast("Gagal mereset data demo.");
    }
  }

  async function handleLogoutToLogin(roleTarget?: "student" | "admin") {
    await logout();
    router.replace(roleTarget === "student" ? "/login" : "/login?role=admin");
  }

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [students, selectedStudentId]
  );

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = students.filter((s) => {
      const matchesLevel = activeLevel === "ALL" || s.level === activeLevel;
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q);
      return matchesLevel && matchesQuery;
    });

    return [...list].sort((a, b) => {
      if (sortMode === "progress") {
        return getOverallProgress(b.skills) - getOverallProgress(a.skills);
      }
      if (sortMode === "xp") {
        return b.xp - a.xp;
      }
      if (sortMode === "name") {
        return a.name.localeCompare(b.name, "id");
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [students, activeLevel, searchQuery, sortMode]);

  const stats = useMemo(() => {
    const total = students.length;
    const avgProgress =
      total > 0
        ? Math.round(
            students.reduce((acc, s) => acc + getOverallProgress(s.skills), 0) /
              total
          )
        : 0;
    const totalXp = students.reduce((acc, s) => acc + s.xp, 0);
    const targetAchieved = students.filter(
      (s) => s.todayMinutes >= s.dailyTargetMinutes
    ).length;

    return { total, avgProgress, totalXp, targetAchieved };
  }, [students]);

  const filterTabs: Array<{ id: EducationLevel | "ALL"; label: string }> = [
    { id: "ALL", label: "Semua" },
    ...EDUCATION_LEVELS.map((l) => ({ id: l.id, label: l.id })),
  ];

  if (checking || !session || session.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg"
        >
          <ShieldCheck className="h-6 w-6" />
        </motion.div>
        <p className="mt-4 text-sm font-bold text-slate-600">
          Memeriksa sesi Admin...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/35 to-amber-50/30 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/25"
            >
              <GraduationCap className="h-6 w-6" />
            </motion.div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
                  EduPlay Admin
                </h1>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                  Panel Orang Tua / Guru
                </span>
                <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <Smartphone className="h-3 w-3" />
                  {session.deviceLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Kelola akun anak & pantau progres membaca, menulis, berhitung
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Kembalikan data contoh awal"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              type="button"
              onClick={() => handleLogoutToLogin("student")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Beralih ke Murid
            </button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              Tambah Akun Anak
            </motion.button>

            <button
              type="button"
              onClick={() => handleLogoutToLogin("admin")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-rose-600 transition-colors cursor-pointer"
              title="Keluar dari akun Admin"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Admin View Switcher */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs w-fit">
          {[
            { id: "students" as const, label: "Daftar & Progres Anak", icon: Users },
            { id: "curriculum" as const, label: "Kelola Materi, Video YouTube & Soal Guru", icon: BookOpen },
          ].map((tab) => {
            const active = adminView === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAdminView(tab.id)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-colors cursor-pointer ${
                  active ? "text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="adminMainViewPill"
                    transition={{ type: "spring", stiffness: 360, damping: 28 }}
                    className="absolute inset-0 rounded-xl bg-slate-900 shadow-sm"
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {adminView === "curriculum" ? (
          <CurriculumManagerPanel onToast={showToast} />
        ) : (
          <>
        {/* KPI Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Akun Anak",
              value: stats.total,
              suffix: " anak",
              hint: "Aktif di seluruh jenjang",
              icon: Users,
              bgGlow: "bg-indigo-50 text-indigo-600",
            },
            {
              label: "Rata-Rata Progres",
              value: stats.avgProgress,
              suffix: "%",
              hint: "Membaca, Menulis & Hitung",
              icon: TrendingUp,
              bgGlow: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Total XP Terkumpul",
              value: stats.totalXp,
              suffix: " XP",
              hint: "Dari mini-game & latihan",
              icon: Sparkles,
              bgGlow: "bg-violet-50 text-violet-600",
            },
            {
              label: "Target Harian Tercapai",
              value: stats.targetAchieved,
              suffix: ` / ${stats.total}`,
              hint: "Anak selesai latihan hari ini",
              icon: Flame,
              bgGlow: "bg-amber-50 text-amber-600",
            },
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, type: "spring", stiffness: 260 }}
                whileHover={{ y: -3 }}
                className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      {kpi.label}
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">
                      <AnimatedNumber value={kpi.value} suffix={kpi.suffix} />
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                      {kpi.hint}
                    </p>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${kpi.bgGlow}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Level Map Analytics */}
        <LevelAnalyticsSection
          students={students}
          activeLevel={activeLevel}
          onSelectLevel={setActiveLevel}
        />

        {/* Roster Controls */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            {/* Sliding Pill Tabs */}
            <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-slate-100/90 p-1">
              {filterTabs.map((tab) => {
                const isActive = activeLevel === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveLevel(tab.id)}
                    className={`relative rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      isActive
                        ? "text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="levelFilterPill"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                        className="absolute inset-0 rounded-xl bg-slate-900 shadow-sm"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau username anak..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="progress">Progres Tertinggi</option>
                  <option value="xp">XP Terbanyak</option>
                  <option value="name">Nama A–Z</option>
                  <option value="newest">Terbaru Ditambahkan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Student Grid */}
          {filteredStudents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/80 py-14 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                🎒
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900">
                Belum ada akun anak yang cocok
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Coba ubah filter jenjang atau tambahkan akun anak baru untuk mulai memantau perkembangan belajarnya.
              </p>
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                Tambah Akun Anak
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student, idx) => {
                  const activeSession =
                    activeSessions[`student:${student.id}`];
                  return (
                    <StudentCard
                      key={student.id}
                      student={student}
                      index={idx}
                      activeDeviceLabel={activeSession?.deviceLabel}
                      onSelect={(s) => setSelectedStudentId(s.id)}
                      onSimulateBoost={handleSimulateBoost}
                    />
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
          </>
        )}
      </main>

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddStudent={handleAddStudent}
        existingUsernames={students.map((s) => s.username)}
      />

      <StudentDetailModal
        student={selectedStudent}
        onClose={() => setSelectedStudentId(null)}
        onSimulateBoost={handleSimulateBoost}
        onUpdateStudent={handleUpdateStudent}
        onDeleteStudent={handleDeleteStudent}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

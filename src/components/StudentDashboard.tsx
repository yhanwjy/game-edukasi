"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calculator,
  Camera,
  Flame,
  Gamepad2,
  Layers,
  Lock,
  LogOut,
  PenTool,
  Puzzle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useAuthSession } from "@/lib/auth-client";
import {
  DEFAULT_STAGE_LEVELS,
  getAvatarOption,
  getLevelMeta,
  getOverallProgress,
} from "@/lib/students";
import {
  LOGIC_STAGES,
  MATH_STAGES,
  READING_STAGES,
  WRITING_STAGES,
  getStageByNumber,
} from "@/lib/curriculum";
import {
  isSoundEnabled,
  setSoundEnabled,
  stopAllSpeech,
} from "@/lib/sound-effects";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import {
  LogicMemoryGame,
  MathSprintGame,
  ReadingGame,
  WritingCanvasGame,
  type GameCompletionPayload,
} from "@/components/StudentGames";
import type { CustomLevelConfig, StudentAccount } from "@/types/student";

type ActiveGameType = "membaca" | "menulis" | "berhitung" | "logika" | null;

export function StudentDashboard() {
  const router = useRouter();
  const { session, student, setStudent, checking, logout } = useAuthSession();
  const [activeGame, setActiveGame] = useState<ActiveGameType>(null);
  const [customLevels, setCustomLevels] = useState<
    Record<string, CustomLevelConfig>
  >({});
  const [rewardBanner, setRewardBanner] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/curriculum", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { customLevels?: Record<string, CustomLevelConfig> }) => {
        if (data.customLevels) {
          setCustomLevels(data.customLevels);
        }
      })
      .catch(() => {});
  }, [activeGame]);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [mapCategory, setMapCategory] = useState<
    "membaca" | "menulis" | "berhitung" | "logika"
  >("membaca");

  useEffect(() => {
    if (checking) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role === "admin") {
      router.replace("/admin");
    }
  }, [checking, session, router]);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  }

  async function handleLogout() {
    stopAllSpeech();
    await logout();
    router.replace("/login");
  }

  async function handleGameComplete(payload: GameCompletionPayload) {
    if (!student) return;
    setActiveGame(null);

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_game",
          ...payload,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        student?: StudentAccount;
      };
      if (data.ok && data.student) {
        setStudent(data.student);
      }
      const proctorLabel = payload.proctor
        ? ` · Validasi: ${payload.proctor.status}`
        : "";
      setRewardBanner(
        `👏 Hebat! ${payload.gameName} selesai · Skor ${payload.score} (+${payload.xpGain} XP)${proctorLabel}`
      );
      setTimeout(() => setRewardBanner(null), 4500);
    } catch {
      // Ignore transient failure
    }
  }

  if (checking || !session || session.role !== "student" || !student) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg"
        >
          <Sparkles className="h-6 w-6" />
        </motion.div>
        <p className="mt-4 text-sm font-bold text-slate-600">
          Menyiapkan ruang belajar anak...
        </p>
      </div>
    );
  }

  const stageLevels = student.stageLevels ?? DEFAULT_STAGE_LEVELS;
  const avatar = getAvatarOption(student.avatarId);
  const levelMeta = getLevelMeta(student.level);
  const overall = getOverallProgress(student.skills);
  const targetPct = Math.min(
    100,
    Math.round(
      (student.todayMinutes / Math.max(1, student.dailyTargetMinutes)) * 100
    )
  );

  const activeReadingStage = getStageByNumber(
    READING_STAGES,
    stageLevels.membaca
  );
  const activeWritingStage = getStageByNumber(
    WRITING_STAGES,
    stageLevels.menulis
  );
  const activeMathStage = getStageByNumber(MATH_STAGES, stageLevels.berhitung);
  const activeLogicStage = getStageByNumber(LOGIC_STAGES, stageLevels.logika);

  const gameCards = [
    {
      id: "membaca" as const,
      title: "Membaca & Mic",
      subtitle: activeReadingStage.title,
      levelNumber: activeReadingStage.levelNumber,
      totalLevels: READING_STAGES.length,
      icon: BookOpen,
      progress: student.skills.membaca,
      gradient: "from-sky-500 to-blue-600",
      cardBg: "bg-sky-50/70 border-sky-200",
      badgeText: "text-sky-700",
    },
    {
      id: "menulis" as const,
      title: "Menulis Kanvas",
      subtitle: activeWritingStage.title,
      levelNumber: activeWritingStage.levelNumber,
      totalLevels: WRITING_STAGES.length,
      icon: PenTool,
      progress: student.skills.menulis,
      gradient: "from-violet-500 to-purple-600",
      cardBg: "bg-violet-50/70 border-violet-200",
      badgeText: "text-violet-700",
    },
    {
      id: "berhitung" as const,
      title: "Balap Berhitung",
      subtitle: activeMathStage.title,
      levelNumber: activeMathStage.levelNumber,
      totalLevels: MATH_STAGES.length,
      icon: Calculator,
      progress: student.skills.berhitung,
      gradient: "from-amber-400 to-orange-500",
      cardBg: "bg-amber-50/70 border-amber-200",
      badgeText: "text-amber-700",
    },
    {
      id: "logika" as const,
      title: "Hafalan & Logika",
      subtitle: activeLogicStage.title,
      levelNumber: activeLogicStage.levelNumber,
      totalLevels: LOGIC_STAGES.length,
      icon: Puzzle,
      progress: student.skills.logikaGame,
      gradient: "from-emerald-500 to-teal-600",
      cardBg: "bg-emerald-50/70 border-emerald-200",
      badgeText: "text-emerald-700",
    },
  ];

  const activeStageForMap =
    mapCategory === "membaca"
      ? activeReadingStage
      : mapCategory === "menulis"
      ? activeWritingStage
      : mapCategory === "berhitung"
      ? activeMathStage
      : activeLogicStage;

  const totalStagesForMap =
    mapCategory === "membaca"
      ? READING_STAGES.length
      : mapCategory === "menulis"
      ? WRITING_STAGES.length
      : mapCategory === "berhitung"
      ? MATH_STAGES.length
      : LOGIC_STAGES.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50/60 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.06 }}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${avatar.gradient} text-2xl shadow-md ring-4 ${avatar.ring}/30`}
            >
              {avatar.emoji}
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Halo, {student.name}!
                </h1>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${levelMeta.pillBg} ${levelMeta.pillText}`}
                >
                  {student.level}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                  <Smartphone className="h-3 w-3" />
                  {session.deviceLabel}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-indigo-600 font-bold">
                  <Camera className="h-3 w-3" />
                  Kamera Pemantau Siap
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSound}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                soundOn
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              {soundOn ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {soundOn ? "Suara Aktif" : "Suara Mati"}
              </span>
            </button>

            <Link
              href="/login?role=admin"
              onClick={() => void logout()}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Masuk Admin
            </Link>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-600 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </motion.button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <AnimatePresence>
          {rewardBanner && (
            <motion.div
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/20"
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="h-5 w-5" />
                <span>{rewardBanner}</span>
              </div>
              <span className="text-lg">🎉</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Banner */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-indigo-500/20"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                <Gamepad2 className="h-3.5 w-3.5" />
                {levelMeta.label} · Mulai Level {stageLevels.membaca}
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ayo Belajar Bertahap & Kumpulkan Bintang!
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-indigo-100">
                Materi tampil bertahap sesuai level yang diatur Admin. Sebutkan huruf dengan Mic & kerjakan soal secara mandiri di depan kamera pemantau!
              </p>

              <div className="mt-4 max-w-md">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Target Belajar Hari Ini</span>
                  <span className="tabular-nums">
                    {student.todayMinutes} / {student.dailyTargetMinutes} menit ({targetPct}%)
                  </span>
                </div>
                <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-white/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${targetPct}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 md:grid-cols-1 lg:grid-cols-3">
              <div className="rounded-2xl bg-white/15 p-3 text-center backdrop-blur-sm">
                <Sparkles className="mx-auto h-5 w-5 text-amber-300" />
                <p className="mt-1 text-lg font-extrabold">
                  <AnimatedNumber value={student.xp} />
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100">
                  Total XP
                </p>
              </div>
              <div className="rounded-2xl bg-white/15 p-3 text-center backdrop-blur-sm">
                <Flame className="mx-auto h-5 w-5 text-orange-300" />
                <p className="mt-1 text-lg font-extrabold">
                  {student.streakDays} hr
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100">
                  Streak
                </p>
              </div>
              <div className="rounded-2xl bg-white/15 p-3 text-center backdrop-blur-sm">
                <Trophy className="mx-auto h-5 w-5 text-emerald-300" />
                <p className="mt-1 text-lg font-extrabold">{overall}%</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100">
                  Progres
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 4 Arena Cards (Hanya Level Aktif) */}
        <section>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Kelas Les Aktif Kamu
            </h2>
            <p className="text-xs text-slate-500">
              Setiap mata pelajaran hanya menampilkan materi level aktifmu (Level {stageLevels.membaca} Membaca, Level {stageLevels.menulis} Menulis, Level {stageLevels.berhitung} Berhitung).
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {gameCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  whileHover={{ y: -4 }}
                  className={`flex flex-col justify-between rounded-3xl border p-5 shadow-sm transition-shadow hover:shadow-xl ${card.cardBg}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-md`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold shadow-xs tabular-nums ${card.badgeText}`}
                        >
                          Level {card.levelNumber}
                        </span>
                        <p className="mt-1 text-[10px] font-bold text-slate-500">
                          {card.progress}% dikuasai
                        </p>
                      </div>
                    </div>

                    <h3 className="mt-4 text-base font-extrabold text-slate-900">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-slate-600 leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveGame(card.id)}
                    className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${card.gradient} py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md cursor-pointer`}
                  >
                    <Gamepad2 className="h-4 w-4" />
                    Mulai Level {card.levelNumber}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Materi Level Aktif Saja (Level Lanjutan Terkunci) */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Materi Level Aktif Saat Ini
                </h2>
                <p className="text-xs text-slate-500">
                  Hanya menampilkan materi level yang aktif agar anak fokus belajar bertahap
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1">
              {[
                { id: "membaca" as const, label: "Membaca" },
                { id: "menulis" as const, label: "Menulis" },
                { id: "berhitung" as const, label: "Berhitung" },
                { id: "logika" as const, label: "Logika" },
              ].map((t) => {
                const active = mapCategory === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setMapCategory(t.id)}
                    className={`relative rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      active ? "text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="studentStageMapTab"
                        transition={{ type: "spring", stiffness: 360, damping: 28 }}
                        className="absolute inset-0 rounded-xl bg-slate-900"
                      />
                    )}
                    <span className="relative z-10">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Satu-satunya level yang aktif & ditampilkan */}
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveGame(mapCategory)}
              className="flex flex-col justify-between rounded-2xl border-2 border-indigo-400 bg-indigo-50/40 p-4 text-left shadow-xs hover:border-indigo-600 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                    Level {activeStageForMap.levelNumber} (Aktif)
                  </span>
                  <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    {activeStageForMap.badge}
                  </span>
                </div>
                <h3 className="mt-2.5 text-sm font-extrabold text-slate-900">
                  {activeStageForMap.title.replace(/^Level \d+:\s*/, "")}
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  {activeStageForMap.description}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-extrabold text-indigo-600">
                <span>Klik untuk Belajar, Mic & Soal →</span>
              </div>
            </motion.button>

            {/* Level berikutnya terkunci */}
            <div className="flex flex-col justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-600">
                <Lock className="h-4 w-4 text-slate-400" />
                <span>
                  {activeStageForMap.levelNumber < totalStagesForMap
                    ? `Level ${activeStageForMap.levelNumber + 1} sampai Level ${totalStagesForMap} Masih Terkunci`
                    : "Semua Level Tertinggi Sudah Terbuka!"}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {activeStageForMap.levelNumber < totalStagesForMap
                  ? "Materi level berikutnya sengaja disembunyikan agar anak fokus menguasai level saat ini. Admin dapat menaikkan level kapan saja."
                  : "Hebat! Kamu sudah mencapai level tertinggi di materi ini."}
              </p>
            </div>
          </div>
        </section>

        {/* Badges & Recent Activity */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900">
              Lencana Prestasi Kamu
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {student.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"
                >
                  🏅 {b}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900">
              Game & Validasi Terakhir
            </h3>
            <div className="mt-3 space-y-2">
              {student.recentGames.slice(0, 3).map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800">{g.gameName}</p>
                    <p className="text-[11px] text-slate-500">
                      {g.category} · {g.playedAt}
                      {g.proctor ? ` · ${g.proctor.status}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 font-extrabold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {g.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Playable Game Modal */}
      <AnimatePresence>
        {activeGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                stopAllSpeech();
                setActiveGame(null);
              }}
              className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <h3 className="text-base font-extrabold text-slate-900">
                  {activeGame === "membaca"
                    ? "📖 Kelas Les Membaca"
                    : activeGame === "menulis"
                    ? "✏️ Papan Tulis Kanvas"
                    : activeGame === "berhitung"
                    ? "🧮 Kelas Les Berhitung"
                    : "🧩 Kelas Hafalan & Logika"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    stopAllSpeech();
                    setActiveGame(null);
                  }}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4">
                {activeGame === "membaca" && (
                  <ReadingGame
                    stageLevels={stageLevels}
                    customConfig={customLevels[`Membaca:${stageLevels.membaca}`]}
                    onComplete={handleGameComplete}
                  />
                )}
                {activeGame === "menulis" && (
                  <WritingCanvasGame
                    stageLevels={stageLevels}
                    customConfig={customLevels[`Menulis:${stageLevels.menulis}`]}
                    onComplete={handleGameComplete}
                  />
                )}
                {activeGame === "berhitung" && (
                  <MathSprintGame
                    stageLevels={stageLevels}
                    customConfig={
                      customLevels[`Berhitung:${stageLevels.berhitung}`]
                    }
                    onComplete={handleGameComplete}
                  />
                )}
                {activeGame === "logika" && (
                  <LogicMemoryGame
                    stageLevels={stageLevels}
                    customConfig={customLevels[`Logika:${stageLevels.logika}`]}
                    onComplete={handleGameComplete}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

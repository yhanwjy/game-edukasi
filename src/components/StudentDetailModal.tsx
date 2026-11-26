"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calculator,
  Camera,
  Check,
  Eye,
  EyeOff,
  Flame,
  Gamepad2,
  PenTool,
  Puzzle,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import type {
  EducationLevel,
  StageLevels,
  StudentAccount,
} from "@/types/student";
import {
  DEFAULT_STAGE_LEVELS,
  EDUCATION_LEVELS,
  getAvatarOption,
  getLevelMeta,
  getOverallProgress,
} from "@/lib/students";
import { ALPHABET_AZ } from "@/lib/az-curriculum";
import {
  LOGIC_STAGES,
  MATH_STAGES,
  READING_STAGES,
  WRITING_STAGES,
} from "@/lib/curriculum";

interface StudentDetailModalProps {
  student: StudentAccount | null;
  onClose: () => void;
  onSimulateBoost: (studentId: string) => void;
  onUpdateStudent: (
    studentId: string,
    patch: Partial<Pick<StudentAccount, "level" | "notes">> & {
      stageLevels?: Partial<StageLevels>;
    }
  ) => void;
  onDeleteStudent: (studentId: string) => void;
}

const RING_CONFIG = [
  {
    key: "membaca" as const,
    label: "Membaca",
    icon: BookOpen,
    stroke: "#0ea5e9",
    bg: "bg-sky-50",
    text: "text-sky-700",
  },
  {
    key: "menulis" as const,
    label: "Menulis",
    icon: PenTool,
    stroke: "#8b5cf6",
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  {
    key: "berhitung" as const,
    label: "Berhitung",
    icon: Calculator,
    stroke: "#f59e0b",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  {
    key: "logikaGame" as const,
    label: "Game & Logika",
    icon: Puzzle,
    stroke: "#10b981",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
];

function SkillRing({
  value,
  stroke,
  label,
  icon: Icon,
  bg,
  text,
}: {
  value: number;
  stroke: string;
  label: string;
  icon: typeof BookOpen;
  bg: string;
  text: string;
}) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-slate-100 p-3.5 ${bg}`}
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 76 76">
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke="rgba(148,163,184,0.22)"
            strokeWidth="7"
          />
          <motion.circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
          />
        </svg>
        <span className={`absolute text-sm font-extrabold tabular-nums ${text}`}>
          {value}%
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-xs font-bold text-slate-700">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
    </div>
  );
}

function StudentDetailContent({
  student,
  onClose,
  onSimulateBoost,
  onUpdateStudent,
  onDeleteStudent,
}: {
  student: StudentAccount;
  onClose: () => void;
  onSimulateBoost: (studentId: string) => void;
  onUpdateStudent: (
    studentId: string,
    patch: Partial<Pick<StudentAccount, "level" | "notes">> & {
      stageLevels?: Partial<StageLevels>;
    }
  ) => void;
  onDeleteStudent: (studentId: string) => void;
}) {
  const [showPin, setShowPin] = useState(false);
  const [notesDraft, setNotesDraft] = useState(student.notes);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const stageLevels = student.stageLevels ?? DEFAULT_STAGE_LEVELS;
  const avatar = getAvatarOption(student.avatarId);
  const levelMeta = getLevelMeta(student.level);
  const overall = getOverallProgress(student.skills);
  const maxMinutes = Math.max(
    30,
    ...student.weeklyActivity.map((d) => d.minutes)
  );

  function handleSaveNotes() {
    onUpdateStudent(student.id, { notes: notesDraft });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ rotate: -8, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260 }}
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${avatar.gradient} text-3xl shadow-lg ring-4 ${avatar.ring}/30`}
            >
              {avatar.emoji}
            </motion.div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {student.name}
                </h2>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${levelMeta.pillBg} ${levelMeta.pillText}`}
                >
                  {student.level}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                @{student.username} · Usia {student.age} thn · Aktif{" "}
                {student.lastActive}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  {student.xp.toLocaleString("id-ID")} XP
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
                  <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                  Streak {student.streakDays} Hari
                </span>
                <button
                  type="button"
                  onClick={() => setShowPin((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  {showPin ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  PIN: {showPin ? student.pin : "••••"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-start">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSimulateBoost(student.id)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-500 cursor-pointer"
            >
              <Zap className="h-4 w-4 fill-white" />
              Simulasi +1 Game
            </motion.button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Tutup detail"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Overall + Skill Rings */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Penguasaan Calistung & Logika
            </h3>
            <span className="text-xs font-bold text-indigo-600">
              Rata-rata keseluruhan: {overall}%
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {RING_CONFIG.map((cfg) => (
              <SkillRing
                key={cfg.key}
                value={student.skills[cfg.key]}
                stroke={cfg.stroke}
                label={cfg.label}
                icon={cfg.icon}
                bg={cfg.bg}
                text={cfg.text}
              />
            ))}
          </div>
        </div>

        {/* 7-Day Activity Bar Chart + Level Upgrade */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 lg:col-span-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Aktivitas Belajar 7 Hari Terakhir
                </h3>
                <p className="text-[11px] text-slate-500">
                  Arahkan kursor ke batang grafik untuk detail menit & XP
                </p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 border border-slate-200">
                Target {student.dailyTargetMinutes}m/hr
              </span>
            </div>

            <div className="mt-6 flex h-40 items-end justify-between gap-2 px-1">
              {student.weeklyActivity.map((item, idx) => {
                const pct = Math.max(
                  8,
                  Math.round((item.minutes / maxMinutes) * 100)
                );
                const reached = item.minutes >= student.dailyTargetMinutes;
                const isHovered = hoveredDay === item.day;

                return (
                  <div
                    key={item.day}
                    onMouseEnter={() => setHoveredDay(item.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="relative flex flex-1 flex-col items-center justify-end h-full"
                  >
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4 }}
                          className="absolute -top-9 z-20 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white shadow-lg"
                        >
                          {item.minutes}m · +{item.xp} XP
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 180,
                        damping: 20,
                        delay: idx * 0.04,
                      }}
                      whileHover={{ scaleX: 1.08 }}
                      className={`w-full max-w-[34px] rounded-t-xl transition-colors ${
                        reached
                          ? "bg-gradient-to-t from-indigo-600 to-violet-500 shadow-sm shadow-indigo-500/20"
                          : "bg-gradient-to-t from-slate-300 to-slate-200"
                      }`}
                    />
                    <span className="mt-2 text-[11px] font-bold text-slate-600">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level & Badges */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 lg:col-span-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Ubah Jenjang Anak
              </label>
              <select
                value={student.level}
                onChange={(e) =>
                  onUpdateStudent(student.id, {
                    level: e.target.value as EducationLevel,
                  })
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
              >
                {EDUCATION_LEVELS.map((lv) => (
                  <option key={lv.id} value={lv.id}>
                    {lv.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Award className="h-4 w-4 text-amber-500" />
                Lencana yang Diraih ({student.badges.length})
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {student.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800"
                  >
                    🏅 {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pengaturan Level Belajar Anak oleh Admin */}
        <div className="mt-5 rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
            Pengaturan Level Belajar Anak (Setting Admin)
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Anak hanya akan melihat materi sesuai level yang diatur di bawah ini (default mulai dari Level 1).
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600">
                Level Membaca
              </label>
              <select
                value={stageLevels.membaca}
                onChange={(e) =>
                  onUpdateStudent(student.id, {
                    stageLevels: { membaca: Number(e.target.value) },
                  })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800"
              >
                {READING_STAGES.map((st) => (
                  <option key={st.id} value={st.levelNumber}>
                    Lv.{st.levelNumber} · {st.badge}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600">
                Tahap Huruf Terbuka
              </label>
              <select
                value={stageLevels.letterStep}
                onChange={(e) =>
                  onUpdateStudent(student.id, {
                    stageLevels: { letterStep: Number(e.target.value) },
                  })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800"
              >
                {ALPHABET_AZ.map((item, idx) => (
                  <option key={item.upper} value={idx}>
                    Tahap {idx + 1} (s/d {item.upper})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600">
                Level Menulis
              </label>
              <select
                value={stageLevels.menulis}
                onChange={(e) =>
                  onUpdateStudent(student.id, {
                    stageLevels: { menulis: Number(e.target.value) },
                  })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800"
              >
                {WRITING_STAGES.map((st) => (
                  <option key={st.id} value={st.levelNumber}>
                    Lv.{st.levelNumber} · {st.badge}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600">
                Level Berhitung
              </label>
              <select
                value={stageLevels.berhitung}
                onChange={(e) =>
                  onUpdateStudent(student.id, {
                    stageLevels: { berhitung: Number(e.target.value) },
                  })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800"
              >
                {MATH_STAGES.map((st) => (
                  <option key={st.id} value={st.levelNumber}>
                    Lv.{st.levelNumber} · {st.badge}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600">
                Level Logika
              </label>
              <select
                value={stageLevels.logika}
                onChange={(e) =>
                  onUpdateStudent(student.id, {
                    stageLevels: { logika: Number(e.target.value) },
                  })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800"
              >
                {LOGIC_STAGES.map((st) => (
                  <option key={st.id} value={st.levelNumber}>
                    Lv.{st.levelNumber} · {st.badge}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Recent Mini-Games & Admin Notes */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 p-4">
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <Gamepad2 className="h-4 w-4 text-indigo-500" />
              Riwayat Game & Laporan Kamera Pemantau
            </div>
            <div className="mt-3 space-y-2.5">
              {student.recentGames.slice(0, 4).map((game) => (
                <motion.div
                  key={game.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl bg-slate-50 px-3 py-2.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {game.gameName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {game.category} · {game.playedAt}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`h-3.5 w-3.5 ${
                              starIdx <= game.stars
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 tabular-nums">
                        Skor {game.score}
                      </span>
                    </div>
                  </div>

                  {game.proctor && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-[11px]">
                      {game.proctor.snapshotDataUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={game.proctor.snapshotDataUrl}
                          alt="Cuplikan kamera pemantau"
                          className="h-8 w-10 shrink-0 rounded object-cover border border-slate-200"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <span
                          className={`inline-flex items-center gap-1 font-extrabold ${
                            game.proctor.status === "Mandiri"
                              ? "text-emerald-700"
                              : game.proctor.status === "Terindikasi Dibantu"
                              ? "text-amber-700"
                              : "text-slate-500"
                          }`}
                        >
                          {game.proctor.status === "Mandiri" ? (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          ) : game.proctor.status === "Terindikasi Dibantu" ? (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          ) : (
                            <Camera className="h-3.5 w-3.5" />
                          )}
                          {game.proctor.status}
                          {game.proctor.confidence > 0 &&
                            ` (${game.proctor.confidence}%)`}
                        </span>
                        <p className="text-[10px] text-slate-500 truncate">
                          {game.proctor.summary}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 p-4">
            <div>
              <label className="block text-sm font-bold text-slate-900">
                Catatan Evaluasi Orang Tua / Guru
              </label>
              <textarea
                rows={4}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                placeholder="Tulis catatan perkembangan anak di sini..."
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus Akun
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteStudent(student.id);
                      onClose();
                    }}
                    className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
                  >
                    Ya, Hapus Permanen
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition-colors cursor-pointer"
              >
                {savedNotice ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Tersimpan!
                  </>
                ) : (
                  "Simpan Catatan"
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function StudentDetailModal({
  student,
  onClose,
  onSimulateBoost,
  onUpdateStudent,
  onDeleteStudent,
}: StudentDetailModalProps) {
  return (
    <AnimatePresence>
      {student && (
        <StudentDetailContent
          key={student.id}
          student={student}
          onClose={onClose}
          onSimulateBoost={onSimulateBoost}
          onUpdateStudent={onUpdateStudent}
          onDeleteStudent={onDeleteStudent}
        />
      )}
    </AnimatePresence>
  );
}

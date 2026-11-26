"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Dices,
  GraduationCap,
  KeyRound,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import type { EducationLevel, StudentAccount } from "@/types/student";
import {
  AVATAR_OPTIONS,
  DEFAULT_STAGE_LEVELS,
  EDUCATION_LEVELS,
  generateDefaultWeeklyActivity,
  getInitialSkillsByLevel,
} from "@/lib/students";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: StudentAccount) => void;
  existingUsernames: string[];
}

function suggestUsername(name: string, level: EducationLevel): string {
  const clean = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)[0];
  if (!clean) return "";
  return `${clean}_${level.toLowerCase()}`;
}

function randomPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function AddStudentModalContent({
  onClose,
  onAddStudent,
  existingUsernames,
}: Omit<AddStudentModalProps, "isOpen">) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("6");
  const [level, setLevel] = useState<EducationLevel>("TK");
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [pin, setPin] = useState(() => randomPin());
  const [avatarId, setAvatarId] = useState("unicorn");
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState(20);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const resolvedUsername = usernameTouched
    ? username
    : suggestUsername(name, level);

  function handleLevelPick(nextLevel: EducationLevel) {
    setLevel(nextLevel);
    const defaultAge: Record<EducationLevel, string> = {
      TK: "5",
      SD: "9",
      SMP: "13",
      SMA: "16",
      Universitas: "19",
    };
    setAge(defaultAge[nextLevel]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUsername = resolvedUsername.trim().toLowerCase();
    const parsedAge = Number(age);

    if (trimmedName.length < 2) {
      setError("Nama anak minimal 2 huruf.");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(trimmedUsername)) {
      setError("Username harus 3–20 karakter (huruf kecil, angka, atau _).");
      return;
    }
    if (existingUsernames.includes(trimmedUsername)) {
      setError("Username ini sudah dipakai akun anak lain.");
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setError("PIN login anak harus tepat 4 digit angka.");
      return;
    }
    if (!Number.isFinite(parsedAge) || parsedAge < 3 || parsedAge > 35) {
      setError("Usia harus antara 3 sampai 35 tahun.");
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const newStudent: StudentAccount = {
      id: `stu-${Date.now()}`,
      name: trimmedName,
      username: trimmedUsername,
      pin,
      age: parsedAge,
      level,
      avatarId,
      xp: 120,
      streakDays: 1,
      dailyTargetMinutes,
      todayMinutes: 15,
      skills: getInitialSkillsByLevel(level),
      stageLevels: { ...DEFAULT_STAGE_LEVELS },
      badges: ["Pembelajar Baru"],
      weeklyActivity: generateDefaultWeeklyActivity(),
      recentGames: [
        {
          id: `g-${Date.now()}`,
          gameName:
            level === "TK"
              ? "Pengenalan Huruf & Angka"
              : level === "SD"
              ? "Tantangan Calistung Cepat"
              : "Tes Penempatan Modul",
          category: "Logika",
          score: 85,
          stars: 3,
          playedAt: "Baru dibuat",
        },
      ],
      notes:
        notes.trim() ||
        `Akun baru jenjang ${level} siap memulai petualangan belajar interaktif.`,
      createdAt: todayStr,
      lastActive: "Baru saja",
    };

    onAddStudent(newStudent);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Tambah Akun Anak Baru
              </h2>
              <p className="text-xs text-slate-500">
                Atur profil, jenjang Calistung–Universitas, dan PIN masuk anak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Avatar picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Pilih Karakter Avatar
            </label>
            <div className="mt-2.5 grid grid-cols-4 gap-2.5 sm:grid-cols-8">
              {AVATAR_OPTIONS.map((av) => {
                const selected = avatarId === av.id;
                return (
                  <motion.button
                    key={av.id}
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setAvatarId(av.id)}
                    className={`relative flex flex-col items-center justify-center rounded-2xl border p-2.5 transition-all cursor-pointer ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/30 shadow-sm"
                        : "border-slate-200 bg-slate-50/70 hover:bg-white"
                    }`}
                    title={av.label}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    {selected && (
                      <motion.span
                        layoutId="avatarCheck"
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shadow"
                      >
                        <Check className="h-3 w-3" />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Name + Age */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700">
                Nama Lengkap Anak
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Bima Sakti"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Usia (Tahun)
              </label>
              <input
                type="number"
                min={3}
                max={35}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                required
              />
            </div>
          </div>

          {/* Jenjang selector */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <GraduationCap className="h-4 w-4 text-indigo-500" />
              Pilih Jenjang Pendidikan
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-5">
              {EDUCATION_LEVELS.map((lv) => {
                const selected = level === lv.id;
                return (
                  <motion.button
                    key={lv.id}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleLevelPick(lv.id)}
                    className={`rounded-2xl border p-2.5 text-left transition-all cursor-pointer ${
                      selected
                        ? "border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${lv.pillBg} ${lv.pillText}`}
                      >
                        {lv.id}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] font-medium leading-tight text-slate-600">
                      {lv.ageHint}
                    </p>
                  </motion.button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Fokus modul:{" "}
              <span className="font-semibold text-indigo-600">
                {EDUCATION_LEVELS.find((l) => l.id === level)?.subtitle}
              </span>
            </p>
          </div>

          {/* Username & PIN */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Username Anak
              </label>
              <input
                type="text"
                value={resolvedUsername}
                onChange={(e) => {
                  setUsernameTouched(true);
                  setUsername(e.target.value.toLowerCase());
                }}
                placeholder="bima_tk"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                PIN Masuk (4 Digit)
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono tracking-widest text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPin(randomPin())}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Acak PIN baru"
                >
                  <Dices className="h-4 w-4" />
                  Acak
                </button>
              </div>
            </div>
          </div>

          {/* Daily Target + Notes */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Target Belajar / Hari
              </label>
              <select
                value={dailyTargetMinutes}
                onChange={(e) =>
                  setDailyTargetMinutes(Number(e.target.value))
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value={15}>15 menit / hari</option>
                <option value={20}>20 menit / hari</option>
                <option value={30}>30 menit / hari</option>
                <option value={45}>45 menit / hari</option>
                <option value={60}>60 menit / hari</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700">
                Catatan Orang Tua / Guru (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Fokus latihan menulis huruf sambung & berhitung"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700"
            >
              {error}
            </motion.p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Simpan Akun Anak
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function AddStudentModal({
  isOpen,
  onClose,
  onAddStudent,
  existingUsernames,
}: AddStudentModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <AddStudentModalContent
          onClose={onClose}
          onAddStudent={onAddStudent}
          existingUsernames={existingUsernames}
        />
      )}
    </AnimatePresence>
  );
}

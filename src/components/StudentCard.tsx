"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Calculator,
  ChevronRight,
  Flame,
  PenTool,
  Sparkles,
  Zap,
} from "lucide-react";
import type { StudentAccount } from "@/types/student";
import {
  getAvatarOption,
  getLevelMeta,
  getOverallProgress,
} from "@/lib/students";

interface StudentCardProps {
  student: StudentAccount;
  index: number;
  activeDeviceLabel?: string;
  onSelect: (student: StudentAccount) => void;
  onSimulateBoost: (studentId: string) => void;
}

const SKILL_ITEMS = [
  {
    key: "membaca" as const,
    label: "Membaca",
    icon: BookOpen,
    barColor: "bg-sky-500",
    trackColor: "bg-sky-100",
  },
  {
    key: "menulis" as const,
    label: "Menulis",
    icon: PenTool,
    barColor: "bg-violet-500",
    trackColor: "bg-violet-100",
  },
  {
    key: "berhitung" as const,
    label: "Berhitung",
    icon: Calculator,
    barColor: "bg-amber-500",
    trackColor: "bg-amber-100",
  },
];

export function StudentCard({
  student,
  index,
  activeDeviceLabel,
  onSelect,
  onSimulateBoost,
}: StudentCardProps) {
  const avatar = getAvatarOption(student.avatarId);
  const levelMeta = getLevelMeta(student.level);
  const overall = getOverallProgress(student.skills);
  const targetPct = Math.min(
    100,
    Math.round((student.todayMinutes / Math.max(1, student.dailyTargetMinutes)) * 100)
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 24,
        delay: Math.min(index * 0.04, 0.24),
      }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      {/* Top accent gradient strip */}
      <div
        className={`absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r ${levelMeta.badgeColor} opacity-80`}
      />

      <div>
        {/* Header: Avatar + Name + Level Pill */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
              transition={{ duration: 0.4 }}
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${avatar.gradient} text-2xl shadow-md ring-4 ${avatar.ring}/30`}
            >
              {avatar.emoji}
            </motion.div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                {student.name}
              </h3>
              <p className="text-xs font-medium text-slate-500">
                @{student.username} · {student.age} thn
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${levelMeta.pillBg} ${levelMeta.pillText}`}
                >
                  {student.level}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
                  <Flame className="h-3 w-3 fill-orange-500 text-orange-500" />
                  {student.streakDays} hr
                </span>
                {activeDeviceLabel && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {activeDeviceLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-medium text-slate-400">Progres</span>
            <p className="text-xl font-extrabold text-slate-900 tabular-nums">
              {overall}%
            </p>
          </div>
        </div>

        {/* Calistung Skill Bars */}
        <div className="mt-5 space-y-2.5">
          {SKILL_ITEMS.map((item) => {
            const Icon = item.icon;
            const val = student.skills[item.key];
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    {item.label}
                  </span>
                  <span className="font-bold text-slate-700 tabular-nums">
                    {val}%
                  </span>
                </div>
                <div
                  className={`h-2 w-full overflow-hidden rounded-full ${item.trackColor}`}
                >
                  <motion.div
                    className={`h-full rounded-full ${item.barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 18,
                      delay: 0.1,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily Target & XP */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-3.5 py-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span className="tabular-nums">
              {student.xp.toLocaleString("id-ID")} XP
            </span>
          </div>
          <div className="text-slate-500">
            Target hari ini:{" "}
            <span className="font-bold text-slate-700 tabular-nums">
              {student.todayMinutes}/{student.dailyTargetMinutes}m ({targetPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center gap-2 pt-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(student)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-600 cursor-pointer"
        >
          Lihat Progres
          <ChevronRight className="h-3.5 w-3.5" />
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => onSimulateBoost(student.id)}
          title="Simulasi anak menyelesaikan 1 mini-game"
          className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 cursor-pointer"
        >
          <Zap className="h-3.5 w-3.5 fill-emerald-500 text-emerald-600" />
          +Game
        </motion.button>
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { GraduationCap, Layers } from "lucide-react";
import type { EducationLevel, StudentAccount } from "@/types/student";
import { EDUCATION_LEVELS, getOverallProgress } from "@/lib/students";

interface LevelAnalyticsSectionProps {
  students: StudentAccount[];
  activeLevel: EducationLevel | "ALL";
  onSelectLevel: (level: EducationLevel | "ALL") => void;
}

export function LevelAnalyticsSection({
  students,
  activeLevel,
  onSelectLevel,
}: LevelAnalyticsSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Peta Perkembangan per Jenjang
            </h2>
            <p className="text-xs text-slate-500">
              Klik kartu jenjang untuk memfilter daftar akun anak & melihat modul Calistung–Universitas
            </p>
          </div>
        </div>
        {activeLevel !== "ALL" && (
          <button
            type="button"
            onClick={() => onSelectLevel("ALL")}
            className="self-start sm:self-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Tampilkan Semua Jenjang
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {EDUCATION_LEVELS.map((meta, idx) => {
          const group = students.filter((s) => s.level === meta.id);
          const avgProgress =
            group.length > 0
              ? Math.round(
                  group.reduce((acc, s) => acc + getOverallProgress(s.skills), 0) /
                    group.length
                )
              : 0;
          const isSelected = activeLevel === meta.id;

          return (
            <motion.button
              key={meta.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectLevel(isSelected ? "ALL" : meta.id)}
              className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-md"
                  : "border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${meta.pillBg} ${meta.pillText}`}
                >
                  <GraduationCap className="h-3 w-3" />
                  {meta.id}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {meta.ageHint}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                    {group.length}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 tabular-nums">
                    {avgProgress}% avg
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500">
                  Akun terdaftar
                </p>
              </div>

              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    className={`h-full rounded-full ${meta.accentBar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${avgProgress}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  />
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {meta.modules.map((mod) => (
                    <span
                      key={mod}
                      className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200/70"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}

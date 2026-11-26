"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Film,
  Gamepad2,
  Layers,
  Plus,
  Save,
  Trash2,
  Video,
} from "lucide-react";
import type {
  CustomLevelConfig,
  CustomQuestion,
  LevelActivityMode,
} from "@/types/student";
import {
  LOGIC_STAGES,
  MATH_STAGES,
  READING_STAGES,
  WRITING_STAGES,
} from "@/lib/curriculum";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

type SubjectCategory = CustomLevelConfig["category"];

const SUBJECT_STAGES: Record<
  SubjectCategory,
  Array<{ levelNumber: number; title: string }>
> = {
  Membaca: READING_STAGES.map((s) => ({
    levelNumber: s.levelNumber,
    title: s.title,
  })),
  Berhitung: MATH_STAGES.map((s) => ({
    levelNumber: s.levelNumber,
    title: s.title,
  })),
  Logika: LOGIC_STAGES.map((s) => ({
    levelNumber: s.levelNumber,
    title: s.title,
  })),
  Menulis: WRITING_STAGES.map((s) => ({
    levelNumber: s.levelNumber,
    title: s.title,
  })),
};

const ACTIVITY_MODES: Array<{
  id: LevelActivityMode;
  label: string;
  desc: string;
  icon: typeof Film;
}> = [
  {
    id: "all",
    label: "Video + Game + Soal",
    desc: "Tampilkan video YouTube, game interaktif, dan soal tebak-tebakan",
    icon: Layers,
  },
  {
    id: "video_quiz",
    label: "Video + Penjelasan + Soal",
    desc: "Anak menonton video YouTube & membaca penjelasan, lalu jawab soal",
    icon: Video,
  },
  {
    id: "game_quiz",
    label: "Game + Tebak-Tebakan",
    desc: "Fokus game susun/pasangkan dan kuis soal penjelasan",
    icon: Gamepad2,
  },
  {
    id: "video_only",
    label: "Video YouTube Saja",
    desc: "Anak menonton video pembelajaran & penjelasan dari guru",
    icon: Film,
  },
];

interface CurriculumManagerPanelProps {
  onToast: (msg: string) => void;
}

export function CurriculumManagerPanel({
  onToast,
}: CurriculumManagerPanelProps) {
  const [configs, setConfigs] = useState<Record<string, CustomLevelConfig>>({});
  const [category, setCategory] = useState<SubjectCategory>("Membaca");
  const [levelNumber, setLevelNumber] = useState(1);

  const [activityMode, setActivityMode] = useState<LevelActivityMode>("all");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [lessonExplanation, setLessonExplanation] = useState("");
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  // Form untuk menambah soal baru
  const [qPrompt, setQPrompt] = useState("");
  const [qExplanation, setQExplanation] = useState("");
  const [qHint, setQHint] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctSlot, setCorrectSlot] = useState<0 | 1 | 2 | 3>(0);
  const [qError, setQError] = useState("");

  function loadSelectionIntoForm(
    allConfigs: Record<string, CustomLevelConfig>,
    cat: SubjectCategory,
    lvl: number
  ) {
    const key = `${cat}:${lvl}`;
    const existing = allConfigs[key];
    if (existing) {
      setActivityMode(existing.activityMode);
      setYoutubeUrl(existing.youtubeUrl ?? "");
      setLessonExplanation(existing.lessonExplanation ?? "");
      setQuestions(existing.questions ?? []);
    } else {
      setActivityMode("all");
      setYoutubeUrl("");
      setLessonExplanation("");
      setQuestions([]);
    }
  }

  useEffect(() => {
    fetch("/api/curriculum", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { customLevels?: Record<string, CustomLevelConfig> }) => {
        if (data.customLevels) {
          setConfigs(data.customLevels);
          loadSelectionIntoForm(data.customLevels, "Membaca", 1);
        }
      })
      .catch(() => {});
  }, []);

  function handleSelectCategory(nextCat: SubjectCategory) {
    setCategory(nextCat);
    setLevelNumber(1);
    loadSelectionIntoForm(configs, nextCat, 1);
  }

  function handleSelectLevel(nextLvl: number) {
    setLevelNumber(nextLvl);
    loadSelectionIntoForm(configs, category, nextLvl);
  }

  function handleAddQuestion() {
    setQError("");
    const opts: [string, string, string, string] = [
      optA.trim(),
      optB.trim(),
      optC.trim(),
      optD.trim(),
    ];
    if (qPrompt.trim().length < 3) {
      setQError("Pertanyaan soal wajib diisi.");
      return;
    }
    if (qExplanation.trim().length < 3) {
      setQError("Penjelasan soal wajib diisi agar anak paham pembahasannya.");
      return;
    }
    if (opts.some((o) => !o)) {
      setQError("Keempat pilihan jawaban (A, B, C, D) wajib diisi.");
      return;
    }

    const newQ: CustomQuestion = {
      id: `cq-${Date.now()}`,
      prompt: qPrompt.trim(),
      explanation: qExplanation.trim(),
      hint: qHint.trim() || "Perhatikan materi penjelasan dari guru.",
      options: opts,
      answer: opts[correctSlot],
      speakQuestion: qPrompt.trim(),
    };

    setQuestions((prev) => [...prev, newQ]);
    setQPrompt("");
    setQExplanation("");
    setQHint("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setCorrectSlot(0);
    onToast("Soal ditambahkan ke daftar! Jangan lupa klik Simpan Materi Level.");
  }

  function handleRemoveQuestion(qId: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== qId));
  }

  async function handleSaveLevelConfig() {
    setSaving(true);
    const payload: CustomLevelConfig = {
      key: `${category}:${levelNumber}`,
      category,
      levelNumber,
      activityMode,
      youtubeUrl: youtubeUrl.trim(),
      lessonExplanation: lessonExplanation.trim(),
      questions,
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/curriculum", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: payload }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        config?: CustomLevelConfig;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.config) {
        onToast(data.error ?? "Gagal menyimpan materi level.");
        setSaving(false);
        return;
      }

      setConfigs((prev) => ({
        ...prev,
        [data.config!.key]: data.config!,
      }));
      onToast(
        `Materi ${category} Level ${levelNumber} berhasil disimpan & langsung aktif untuk anak!`
      );
    } catch {
      onToast("Gangguan koneksi saat menyimpan materi.");
    } finally {
      setSaving(false);
    }
  }

  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);
  const stageList = SUBJECT_STAGES[category];

  return (
    <div className="space-y-6">
      {/* Header Pilih Mapel & Level */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Kelola Materi, Video YouTube & Soal Penjelasan Guru
            </h2>
            <p className="text-xs text-slate-500">
              Pilih mata pelajaran & levelnya, tentukan apakah pakai Game / Video YouTube, lalu buat soal beserta penjelasannya.
            </p>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            disabled={saving}
            onClick={handleSaveLevelConfig}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 cursor-pointer disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving
              ? "Menyimpan..."
              : `Simpan ${category} Level ${levelNumber}`}
          </motion.button>
        </div>

        {/* Pilih Mapel + Pilih Level */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700">
              1. Mata Pelajaran
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["Membaca", "Berhitung", "Logika", "Menulis"] as const).map(
                (cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                        active
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">
              2. Pilih Level yang Diatur
            </label>
            <select
              value={levelNumber}
              onChange={(e) => handleSelectLevel(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
            >
              {stageList.map((st) => {
                const hasCustom = Boolean(
                  configs[`${category}:${st.levelNumber}`]
                );
                return (
                  <option key={st.levelNumber} value={st.levelNumber}>
                    {st.title} {hasCustom ? "✓ (Sudah diatur Guru)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Pilih Format Aktivitas Level */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-slate-700">
            3. Pilih Mode Aktivitas Anak di Level Ini
          </label>
          <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {ACTIVITY_MODES.map((m) => {
              const Icon = m.icon;
              const active = activityMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActivityMode(m.id)}
                  className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                    active
                      ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <Icon
                      className={`h-4 w-4 ${
                        active ? "text-indigo-600" : "text-slate-400"
                      }`}
                    />
                    {active && (
                      <span className="rounded-full bg-indigo-600 p-0.5 text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-extrabold text-slate-900">
                    {m.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Video YouTube & Penjelasan Materi Guru */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Lampirkan Video Pembelajaran (Link YouTube)
              </h3>
              <p className="text-[11px] text-slate-500">
                Mendukung link youtube.com/watch?v=..., youtu.be/..., atau Shorts
              </p>
            </div>
          </div>

          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
          />

          {youtubeUrl.trim() && !embedUrl && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              Format link YouTube belum dikenali. Pastikan URL berasal dari youtube.com atau youtu.be.
            </p>
          )}

          {embedUrl ? (
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black">
              <iframe
                src={embedUrl}
                title="Pratinjau Video YouTube"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center p-4">
              <Video className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs font-semibold text-slate-400">
                Pratinjau video YouTube akan tampil di sini
              </p>
            </div>
          )}
        </div>

        {/* Penjelasan Materi dari Guru */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Penjelasan Materi dari Guru / Orang Tua
                </h3>
                <p className="text-[11px] text-slate-500">
                  Teks penjelasan ini tampil di halaman anak sebelum mengerjakan soal & bisa dibacakan suara
                </p>
              </div>
            </div>

            <textarea
              rows={7}
              value={lessonExplanation}
              onChange={(e) => setLessonExplanation(e.target.value)}
              placeholder={`Contoh untuk ${category} Level ${levelNumber}: Hari ini kita belajar huruf A dan B. Huruf A dibaca dengan mulut terbuka lebar seperti Apel...`}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="rounded-2xl bg-indigo-50/70 p-3 text-[11px] font-medium text-indigo-800">
            💡 Jika penjelasan diisi, anak dapat menekan tombol <strong>Dengarkan Penjelasan Guru</strong> di layar belajarnya.
          </div>
        </div>
      </div>

      {/* Pembuat Soal & Pembahasan Per Level */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2 space-y-3.5">
          <h3 className="text-sm font-extrabold text-slate-900">
            + Buat Soal Baru ({category} Level {levelNumber})
          </h3>

          <div>
            <label className="block text-[11px] font-bold text-slate-700">
              Pertanyaan Soal
            </label>
            <textarea
              rows={2}
              value={qPrompt}
              onChange={(e) => setQPrompt(e.target.value)}
              placeholder="Contoh: Hewan apa yang diawali huruf B?"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700">
              Penjelasan / Pembahasan Soal (Wajib)
            </label>
            <textarea
              rows={2}
              value={qExplanation}
              onChange={(e) => setQExplanation(e.target.value)}
              placeholder="Contoh: Bebek diawali huruf B (B-e-b-e-k), sedangkan Apel huruf A."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700">
              Petunjuk Singkat (Opsional)
            </label>
            <input
              type="text"
              value={qHint}
              onChange={(e) => setQHint(e.target.value)}
              placeholder="Contoh: Suka berenang dan berbunyi kwek-kwek"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700">
              4 Pilihan Jawaban (klik bulat di kiri untuk menandai kunci benar)
            </label>
            {[
              { label: "A", val: optA, set: setOptA, idx: 0 as const },
              { label: "B", val: optB, set: setOptB, idx: 1 as const },
              { label: "C", val: optC, set: setOptC, idx: 2 as const },
              { label: "D", val: optD, set: setOptD, idx: 3 as const },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={correctSlot === item.idx}
                  onChange={() => setCorrectSlot(item.idx)}
                  className="h-4 w-4 accent-emerald-600 cursor-pointer"
                  title={`Tandai pilihan ${item.label} sebagai jawaban benar`}
                />
                <span className="w-4 text-xs font-extrabold text-slate-500">
                  {item.label}.
                </span>
                <input
                  type="text"
                  value={item.val}
                  onChange={(e) => item.set(e.target.value)}
                  placeholder={`Jawaban ${item.label}`}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            ))}
          </div>

          {qError && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {qError}
            </p>
          )}

          <button
            type="button"
            onClick={handleAddQuestion}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-extrabold text-white hover:bg-indigo-600 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tambahkan Soal ke Level {levelNumber}
          </button>
        </div>

        {/* Daftar Soal Buatan Guru */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Daftar Soal Buatan Guru ({questions.length} soal)
              </h3>
              <p className="text-[11px] text-slate-500">
                Jika daftar ini diisi, anak akan mengerjakan soal-soal ini beserta pembahasannya. Jika kosong, sistem memakai bank soal bawaan.
              </p>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center px-4">
              <p className="text-xs font-bold text-slate-600">
                Belum ada soal buatan guru untuk {category} Level {levelNumber}.
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Tambahkan soal di formulir sebelah kiri, lalu klik &ldquo;Simpan {category} Level {levelNumber}&rdquo;.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700">
                        Soal #{idx + 1}
                      </span>
                      <p className="mt-1.5 text-xs font-extrabold text-slate-900">
                        {q.prompt}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer"
                      title="Hapus soal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {q.options.map((opt) => (
                      <span
                        key={opt}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                          opt === q.answer
                            ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {opt === q.answer ? `✓ ${opt}` : opt}
                      </span>
                    ))}
                  </div>

                  <p className="mt-2 rounded-xl bg-white px-3 py-2 text-[11px] text-slate-700 border border-slate-200/70">
                    <strong className="text-indigo-700">Penjelasan:</strong>{" "}
                    {q.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

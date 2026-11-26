"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Eraser,
  Gamepad2,
  HelpCircle,
  Lock,
  RotateCcw,
  Trophy,
  Volume2,
} from "lucide-react";
import type {
  CustomLevelConfig,
  GameSession,
  ProctorReport,
  StageLevels,
} from "@/types/student";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import {
  LOGIC_STAGES,
  MATH_STAGES,
  READING_STAGES,
  WRITING_STAGES,
  getStageByNumber,
  type LessonCard,
  type PairMatchItem,
  type QuizQuestion,
  type TileGameRound,
} from "@/lib/curriculum";
import {
  buildCumulativeAGameRounds,
  buildCumulativeAQuestions,
  buildLevel1Questions,
} from "@/lib/az-curriculum";
import {
  playCelebrationWithPraise,
  playVictoryFanfare,
  playWrongEncourage,
  speakIndonesian,
  stopAllSpeech,
} from "@/lib/sound-effects";
import { ReadingDrillBoard } from "@/components/ReadingDrillBoard";
import { SpeechMicPractice } from "@/components/SpeechMicPractice";
import {
  ProctorCameraMonitor,
  type ProctorMonitorHandle,
} from "@/components/ProctorCameraMonitor";

export interface GameCompletionPayload {
  gameName: string;
  category: GameSession["category"];
  score: number;
  stars: 1 | 2 | 3;
  xpGain: number;
  minutesGain: number;
  proctor?: ProctorReport;
  advanceLetterStep?: number;
}

type ArenaMode = "belajar" | "game" | "tebak";

interface TutoringStageDescriptor {
  id: string;
  levelNumber: number;
  title: string;
  badge: string;
  description: string;
  lessons: LessonCard[];
  gameRounds?: TileGameRound[];
  pairGames?: PairMatchItem[];
  questions: QuizQuestion[];
}

const PRAISE_BADGES = [
  "👏 Hebat Sekali!",
  "🌟 Pintar Banget!",
  "🎉 Tepuk Tangan!",
  "🏆 Luar Biasa!",
];

function deterministicShuffle<T>(
  items: T[],
  keyFn: (item: T, index: number) => string
): T[] {
  return [...items]
    .map((item, idx) => {
      const k = keyFn(item, idx);
      let hash = 0;
      for (let i = 0; i < k.length; i++) {
        hash = (hash * 31 + k.charCodeAt(i)) % 9973;
      }
      return { item, hash, idx };
    })
    .sort((a, b) => a.hash - b.hash || a.idx - b.idx)
    .map((entry) => entry.item);
}

function TileAssemblyGame({
  rounds,
  onDone,
}: {
  rounds: TileGameRound[];
  onDone: () => void;
}) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [selectedTileIndices, setSelectedTileIndices] = useState<number[]>([]);
  const [roundState, setRoundState] = useState<"playing" | "won" | "wrong">(
    "playing"
  );

  const currentRound = rounds[roundIdx % rounds.length];

  const poolTiles = useMemo(() => {
    const combined = [
      ...currentRound.targetTiles,
      ...currentRound.distractorTiles,
    ];
    return deterministicShuffle(
      combined,
      (t, idx) => `${currentRound.id}-${t}-${idx}`
    );
  }, [currentRound]);

  function handleTapPoolTile(poolIdx: number) {
    if (roundState === "won") return;
    if (selectedTileIndices.includes(poolIdx)) return;

    const nextSelected = [...selectedTileIndices, poolIdx];
    setSelectedTileIndices(nextSelected);
    setRoundState("playing");

    if (nextSelected.length === currentRound.targetTiles.length) {
      const formed = nextSelected.map((i) => poolTiles[i]);
      const isMatch = formed.every(
        (val, i) => val === currentRound.targetTiles[i]
      );
      if (isMatch) {
        setRoundState("won");
        playCelebrationWithPraise(
          `Pintar! Kata ${formed.join(" ")} tersusun benar!`
        );
      } else {
        setRoundState("wrong");
        playWrongEncourage();
      }
    }
  }

  function handleResetRound() {
    setSelectedTileIndices([]);
    setRoundState("playing");
  }

  function handleNextRound() {
    stopAllSpeech();
    if (roundIdx + 1 < rounds.length) {
      setRoundIdx((i) => i + 1);
      setSelectedTileIndices([]);
      setRoundState("playing");
    } else {
      onDone();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
        <span>
          Susun Kata {roundIdx + 1} / {rounds.length}
        </span>
        <button
          type="button"
          onClick={() => speakIndonesian(currentRound.speakClue)}
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-extrabold text-indigo-800 hover:bg-indigo-200 cursor-pointer"
        >
          <Volume2 className="h-3.5 w-3.5" />
          Suara Petunjuk
        </button>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 text-center">
        <span className="text-3xl">{currentRound.emoji}</span>
        <p className="mt-1.5 text-sm font-extrabold text-slate-900">
          {currentRound.clue}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 py-2">
        {currentRound.targetTiles.map((_, slotIdx) => {
          const poolIdx = selectedTileIndices[slotIdx];
          const text = poolIdx !== undefined ? poolTiles[poolIdx] : null;
          return (
            <motion.button
              key={slotIdx}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (roundState === "won" || text === null) return;
                setSelectedTileIndices((prev) =>
                  prev.filter((_, i) => i !== slotIdx)
                );
                setRoundState("playing");
              }}
              className={`flex h-14 min-w-[68px] items-center justify-center rounded-2xl border-2 px-4 text-lg font-extrabold transition-all ${
                roundState === "won"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                  : roundState === "wrong"
                  ? "border-rose-400 bg-rose-50 text-rose-700"
                  : text
                  ? "border-indigo-500 bg-white text-indigo-700 shadow-sm cursor-pointer"
                  : "border-dashed border-slate-300 bg-slate-50 text-slate-400"
              }`}
            >
              {text ?? "?"}
            </motion.button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {poolTiles.map((tile, poolIdx) => {
          const used = selectedTileIndices.includes(poolIdx);
          return (
            <motion.button
              key={`${tile}-${poolIdx}`}
              type="button"
              disabled={used || roundState === "won"}
              whileHover={{ scale: used ? 1 : 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleTapPoolTile(poolIdx)}
              className={`rounded-2xl border-2 px-5 py-3 text-base font-extrabold shadow-xs transition-all cursor-pointer ${
                used
                  ? "border-slate-200 bg-slate-100 text-slate-300 opacity-60 cursor-default"
                  : "border-slate-200 bg-white text-slate-800 hover:border-indigo-400 hover:bg-indigo-50"
              }`}
            >
              {tile}
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleResetRound}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Ulang Susun
        </button>

        {roundState === "won" && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleNextRound}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow hover:bg-emerald-500 cursor-pointer"
          >
            {roundIdx + 1 < rounds.length
              ? "Kata Berikutnya"
              : "Lanjut ke Tebak-Tebakan"}
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}

function PairMatchGame({
  pairs,
  onDone,
}: {
  pairs: PairMatchItem[];
  onDone: () => void;
}) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);

  const shuffledRight = useMemo(
    () => deterministicShuffle(pairs, (p, idx) => `${p.id}-${p.right}-${idx}`),
    [pairs]
  );

  function handlePickRight(item: PairMatchItem) {
    if (!selectedLeft || matchedIds.includes(item.id)) return;
    if (selectedLeft === item.id) {
      const next = [...matchedIds, item.id];
      setMatchedIds(next);
      setSelectedLeft(null);
      setWrongId(null);
      if (next.length === pairs.length) {
        playCelebrationWithPraise("Hebat! Semua pasangan cocok!");
      } else {
        playCelebrationWithPraise("Pasangan cocok! Bagus!");
      }
    } else {
      setWrongId(item.id);
      playWrongEncourage();
      setTimeout(() => setWrongId(null), 600);
    }
  }

  const allMatched = matchedIds.length === pairs.length;

  return (
    <div className="space-y-4">
      <p className="text-center text-xs font-bold text-slate-600">
        Klik soal di kiri, lalu klik pasangannya di kanan ({matchedIds.length}/
        {pairs.length} cocok)
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2.5">
          {pairs.map((p) => {
            const matched = matchedIds.includes(p.id);
            const active = selectedLeft === p.id;
            return (
              <motion.button
                key={p.id}
                type="button"
                disabled={matched}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedLeft(p.id)}
                className={`w-full rounded-2xl border-2 px-3 py-3 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  matched
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : active
                    ? "border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300"
                }`}
              >
                {p.left}
              </motion.button>
            );
          })}
        </div>

        <div className="space-y-2.5">
          {shuffledRight.map((p) => {
            const matched = matchedIds.includes(p.id);
            const isWrong = wrongId === p.id;
            return (
              <motion.button
                key={p.id}
                type="button"
                disabled={matched}
                whileTap={{ scale: 0.96 }}
                onClick={() => handlePickRight(p)}
                className={`w-full rounded-2xl border-2 px-3 py-3 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  matched
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : isWrong
                    ? "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-white text-slate-800 hover:border-amber-400"
                }`}
              >
                {p.right}
              </motion.button>
            );
          })}
        </div>
      </div>

      {allMatched && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5"
        >
          <span className="text-xs font-extrabold text-emerald-800">
            👏 Semua pasangan berhasil dicocokkan!
          </span>
          <button
            type="button"
            onClick={onDone}
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-emerald-500 cursor-pointer"
          >
            Lanjut ke Tebak-Tebakan
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

interface RichQuizQuestion extends QuizQuestion {
  explanation?: string;
}

function TutoringArena({
  category,
  currentStage,
  initialLetterStep,
  customConfig,
  accent,
  onComplete,
}: {
  category: GameSession["category"];
  currentStage: TutoringStageDescriptor;
  initialLetterStep: number;
  customConfig?: CustomLevelConfig;
  accent: "sky" | "amber" | "emerald";
  onComplete: (payload: GameCompletionPayload) => void;
}) {
  const [letterStep, setLetterStep] = useState(initialLetterStep);
  const [focusConsonant, setFocusConsonant] = useState("b");
  const [mode, setMode] = useState<ArenaMode>("belajar");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong" | "done">(
    "idle"
  );
  const [mistakesOnCurrent, setMistakesOnCurrent] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [praiseText, setPraiseText] = useState(PRAISE_BADGES[0]);

  const proctorRef = useRef<ProctorMonitorHandle | null>(null);

  const activityMode = customConfig?.activityMode ?? "all";
  const youtubeEmbed = getYouTubeEmbedUrl(customConfig?.youtubeUrl ?? "");
  const hasGuruExplanation = Boolean(customConfig?.lessonExplanation?.trim());

  const activeGameRounds = useMemo(() => {
    if (currentStage.id === "read-2-vokal-a") {
      return buildCumulativeAGameRounds(focusConsonant);
    }
    return currentStage.gameRounds ?? [];
  }, [currentStage.id, currentStage.gameRounds, focusConsonant]);

  const activeQuestions: RichQuizQuestion[] = useMemo(() => {
    if (customConfig && customConfig.questions.length > 0) {
      return customConfig.questions.map((cq) => ({
        prompt: cq.prompt,
        speakQuestion: cq.speakQuestion || cq.prompt,
        hint: cq.hint,
        options: cq.options,
        answer: cq.answer,
        explanation: cq.explanation,
      }));
    }
    if (currentStage.id === "read-1-vokal") {
      return buildLevel1Questions(letterStep);
    }
    if (currentStage.id === "read-2-vokal-a") {
      return buildCumulativeAQuestions(focusConsonant);
    }
    return currentStage.questions;
  }, [
    customConfig,
    currentStage.id,
    currentStage.questions,
    focusConsonant,
    letterStep,
  ]);

  const currentQ = activeQuestions[qIdx % activeQuestions.length];
  const isMonitoring = mode === "game" || mode === "tebak";

  useEffect(() => {
    return () => stopAllSpeech();
  }, []);

  function handleSwitchMode(nextMode: ArenaMode) {
    stopAllSpeech();
    setMode(nextMode);
  }

  function handleTapLesson(card: LessonCard) {
    setActiveLessonId(card.id);
    speakIndonesian(card.speakLesson);
  }

  function handlePickOption(opt: string) {
    if (status === "correct" || status === "done") return;
    setPicked(opt);

    if (opt === currentQ.answer) {
      setPraiseText(PRAISE_BADGES[qIdx % PRAISE_BADGES.length]);
      const isLast = qIdx + 1 >= activeQuestions.length;

      if (isLast) {
        setStatus("done");
        playVictoryFanfare();
      } else {
        setStatus("correct");
        playCelebrationWithPraise();
      }
    } else {
      setStatus("wrong");
      setMistakesOnCurrent((m) => m + 1);
      setTotalMistakes((m) => m + 1);
      playWrongEncourage();
    }
  }

  function handleNextQuestion() {
    stopAllSpeech();
    setQIdx((i) => i + 1);
    setPicked(null);
    setStatus("idle");
    setMistakesOnCurrent(0);
  }

  function handleFinishStage() {
    stopAllSpeech();
    const totalQ = activeQuestions.length;
    const score = Math.max(75, Math.round(100 - (totalMistakes / totalQ) * 16));
    const proctorReport = proctorRef.current?.buildReport();

    onComplete({
      gameName: currentStage.title,
      category,
      score,
      stars: score >= 90 ? 3 : 2,
      xpGain: 95 + totalQ * 15,
      minutesGain: 8,
      proctor: proctorReport,
      advanceLetterStep: letterStep,
    });
  }

  const palette = {
    sky: {
      badge: "bg-sky-600 text-white",
      box: "bg-sky-50/90 border-sky-200",
      hint: "text-sky-700",
      speakBtn: "bg-sky-100 text-sky-800 hover:bg-sky-200",
      nextBtn: "bg-sky-600 hover:bg-sky-700",
    },
    amber: {
      badge: "bg-amber-500 text-white",
      box: "bg-amber-50/90 border-amber-200",
      hint: "text-amber-800",
      speakBtn: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      nextBtn: "bg-amber-500 hover:bg-amber-600",
    },
    emerald: {
      badge: "bg-emerald-600 text-white",
      box: "bg-emerald-50/90 border-emerald-200",
      hint: "text-emerald-800",
      speakBtn: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
      nextBtn: "bg-emerald-600 hover:bg-emerald-700",
    },
  }[accent];

  const modeTabs = useMemo(() => {
    if (activityMode === "video_only") {
      return [
        {
          id: "belajar" as const,
          label: "Video & Penjelasan Guru",
          icon: BookOpenCheck,
        },
      ];
    }
    if (activityMode === "video_quiz") {
      return [
        {
          id: "belajar" as const,
          label: "1. Video & Penjelasan",
          icon: BookOpenCheck,
        },
        {
          id: "tebak" as const,
          label: "2. Soal & Pembahasan",
          icon: HelpCircle,
        },
      ];
    }
    return [
      { id: "belajar" as const, label: "1. Belajar & Mic", icon: BookOpenCheck },
      { id: "game" as const, label: "2. Main Game", icon: Gamepad2 },
      { id: "tebak" as const, label: "3. Tebak-Tebakan", icon: HelpCircle },
    ];
  }, [activityMode]);

  return (
    <div className="space-y-4">
      {/* Level Aktif Saja (Level lain terkunci / diatur Admin) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${palette.badge}`}
            >
              Level {currentStage.levelNumber}
            </span>
            <span className="text-xs font-extrabold text-slate-900">
              {currentStage.title.replace(/^Level \d+:\s*/, "")}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">
            {currentStage.description}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500">
          <Lock className="h-3 w-3" />
          Level diatur oleh Admin
        </span>
      </div>

      {/* Kamera Pemantau aktif saat mengerjakan Game / Soal */}
      <ProctorCameraMonitor active={isMonitoring} monitorRef={proctorRef} />

      {/* 3-Step Tutoring Mode Tabs */}
      <div
        className={`grid gap-1.5 rounded-2xl bg-slate-100 p-1 ${
          modeTabs.length === 1
            ? "grid-cols-1"
            : modeTabs.length === 2
            ? "grid-cols-2"
            : "grid-cols-3"
        }`}
      >
        {modeTabs.map((tab) => {
          const active = mode === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSwitchMode(tab.id)}
              className={`relative flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] sm:text-xs font-extrabold transition-colors cursor-pointer ${
                active ? "text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`arenaModePill-${category}`}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className="absolute inset-0 rounded-xl bg-slate-900 shadow-sm"
                />
              )}
              <Icon className="relative z-10 h-3.5 w-3.5 shrink-0" />
              <span className="relative z-10 truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MODE 1: BELAJAR MATERI + VIDEO YOUTUBE + PENJELASAN GURU */}
      {mode === "belajar" && (
        <motion.div
          key={`belajar-${currentStage.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Video YouTube & Penjelasan Guru bila dilampirkan */}
          {activityMode !== "game_quiz" && (youtubeEmbed || hasGuruExplanation) && (
            <div className="space-y-3 rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4">
              {youtubeEmbed && (
                <div className="space-y-2">
                  <p className="text-xs font-extrabold text-rose-900">
                    📺 Video Pembelajaran dari Guru
                  </p>
                  <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
                    <iframe
                      src={youtubeEmbed}
                      title="Video Pembelajaran EduPlay"
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {hasGuruExplanation && (
                <div className="rounded-2xl border border-sky-200 bg-white p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-extrabold text-sky-900">
                      📝 Penjelasan Materi Guru
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        speakIndonesian(customConfig?.lessonExplanation ?? "")
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-extrabold text-sky-800 hover:bg-sky-200 cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      Dengarkan Penjelasan
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                    {customConfig?.lessonExplanation}
                  </p>
                </div>
              )}
            </div>
          )}
          {category === "Membaca" &&
          [
            "read-1-vokal",
            "read-2-vokal-a",
            "read-3-vokal-lain",
            "read-4-huruf-depan",
            "read-5-tiga-huruf",
            "read-6-sambung",
          ].includes(currentStage.id) ? (
            <ReadingDrillBoard
              stageId={currentStage.id}
              letterStep={letterStep}
              onAdvanceLetterStep={(next) => {
                setLetterStep(next);
                setQIdx(0);
              }}
              focusConsonant={focusConsonant}
              onFocusConsonantChange={(c) => {
                setFocusConsonant(c);
                setQIdx(0);
                setPicked(null);
                setStatus("idle");
                setMistakesOnCurrent(0);
                setTotalMistakes(0);
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {currentStage.lessons.map((card) => {
                  const isSelected = activeLessonId === card.id;
                  return (
                    <motion.button
                      key={card.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleTapLesson(card)}
                      className={`flex items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/70 shadow-md"
                          : "border-slate-200 bg-white hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                        {card.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xl font-black tracking-tight text-slate-900">
                            {card.symbol}
                          </span>
                          <Volume2
                            className={`h-4 w-4 shrink-0 ${
                              isSelected ? "text-indigo-600" : "text-slate-400"
                            }`}
                          />
                        </div>
                        {card.breakdown && (
                          <p className="mt-0.5 text-xs font-bold text-indigo-700">
                            {card.breakdown}
                          </p>
                        )}
                        <p className="mt-1 text-xs font-semibold text-slate-700">
                          Contoh:{" "}
                          <span className="underline">{card.exampleWord}</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          💡 {card.tip}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {currentStage.lessons[0] && (
                <SpeechMicPractice
                  promptLabel={`Coba ucapkan materi ini: "${currentStage.lessons[0].symbol}"`}
                  expectedWords={[
                    currentStage.lessons[0].symbol,
                    currentStage.lessons[0].exampleWord,
                    "tiga",
                    "dua",
                    "biru",
                  ]}
                />
              )}
            </>
          )}

          <div className="flex justify-end pt-1">
            {activityMode === "video_only" ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  playVictoryFanfare();
                  onComplete({
                    gameName: `${currentStage.title} (Video Guru)`,
                    category,
                    score: 100,
                    stars: 3,
                    xpGain: 80,
                    minutesGain: 8,
                  });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-500 cursor-pointer"
              >
                <Trophy className="h-4 w-4" />
                Selesai Menonton & Paham (+80 XP)
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() =>
                  handleSwitchMode(
                    activityMode === "video_quiz" ? "tebak" : "game"
                  )
                }
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-md cursor-pointer ${palette.nextBtn}`}
              >
                {activityMode === "video_quiz"
                  ? "Sudah Paham! Lanjut Jawab Soal"
                  : "Sudah Paham! Lanjut Main Game"}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* MODE 2: MAIN GAME */}
      {mode === "game" && (
        <motion.div
          key={`game-${currentStage.id}-${focusConsonant}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {activeGameRounds.length > 0 ? (
            <TileAssemblyGame
              key={`${currentStage.id}-${focusConsonant}`}
              rounds={activeGameRounds}
              onDone={() => handleSwitchMode("tebak")}
            />
          ) : currentStage.pairGames && currentStage.pairGames.length > 0 ? (
            <PairMatchGame
              key={currentStage.id}
              pairs={currentStage.pairGames}
              onDone={() => handleSwitchMode("tebak")}
            />
          ) : (
            <div className="text-center py-6">
              <button
                type="button"
                onClick={() => handleSwitchMode("tebak")}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white cursor-pointer"
              >
                Lanjut ke Tebak-Tebakan →
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* MODE 3: TEBAK-TEBAKAN (8+ Soal) */}
      {mode === "tebak" && (
        <motion.div
          key={`tebak-${currentStage.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>
              Tebak-Tebakan {qIdx + 1} dari {activeQuestions.length}
            </span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => speakIndonesian(currentQ.speakQuestion)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-colors cursor-pointer ${palette.speakBtn}`}
            >
              <Volume2 className="h-4 w-4" />
              Putar Suara Soal
            </motion.button>
          </div>

          <div className={`rounded-2xl border p-5 text-center ${palette.box}`}>
            <p className="text-base sm:text-lg font-extrabold text-slate-900">
              {currentQ.prompt}
            </p>
            <p className={`mt-1.5 text-xs font-semibold ${palette.hint}`}>
              Petunjuk: {currentQ.hint}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((opt) => {
              const isPicked = picked === opt;
              const isCorrectChoice =
                (status === "correct" || status === "done") &&
                opt === currentQ.answer;
              const isWrongChoice = status === "wrong" && isPicked;

              let btnStyle =
                "border-slate-200 bg-white text-slate-900 hover:border-indigo-400 hover:bg-indigo-50/50";
              if (isCorrectChoice) {
                btnStyle =
                  "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20";
              } else if (isWrongChoice) {
                btnStyle = "border-rose-400 bg-rose-50 text-rose-700";
              }

              return (
                <motion.button
                  key={opt}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    isWrongChoice ? { x: [0, -6, 6, -4, 4, 0] } : undefined
                  }
                  transition={{ duration: 0.35 }}
                  onClick={() => handlePickOption(opt)}
                  className={`rounded-2xl border-2 p-3.5 text-sm sm:text-base font-extrabold transition-colors cursor-pointer ${btnStyle}`}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {status === "wrong" && (
              <motion.div
                key="wrong"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-bold text-amber-800"
              >
                Hampir tepat! Yuk dengarkan soalnya atau pilih jawaban lain (
                {mistakesOnCurrent}x coba).
              </motion.div>
            )}

            {status === "correct" && (
              <motion.div
                key="correct"
                initial={{ opacity: 0, scale: 0.92, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-800">
                    <motion.span
                      animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="text-xl"
                    >
                      👏
                    </motion.span>
                    <span>{praiseText}</span>
                  </div>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextQuestion}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold text-white shadow cursor-pointer ${palette.nextBtn}`}
                  >
                    Soal Berikutnya
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.button>
                </div>

                {(currentQ.explanation || currentQ.hint) && (
                  <div className="flex items-start justify-between gap-2 rounded-xl border border-emerald-200/80 bg-white px-3 py-2 text-xs text-slate-700">
                    <p>
                      <strong className="text-emerald-800">
                        Penjelasan Soal:
                      </strong>{" "}
                      {currentQ.explanation ?? currentQ.hint}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        speakIndonesian(currentQ.explanation ?? currentQ.hint)
                      }
                      className="shrink-0 rounded-lg bg-emerald-100 p-1.5 text-emerald-800 hover:bg-emerald-200 cursor-pointer"
                      title="Dengarkan penjelasan"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {status === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="space-y-3 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 p-4"
              >
                {(currentQ.explanation || currentQ.hint) && (
                  <div className="rounded-xl border border-emerald-200/80 bg-white px-3 py-2 text-xs text-slate-700">
                    <strong className="text-emerald-800">
                      Penjelasan Soal Terakhir:
                    </strong>{" "}
                    {currentQ.explanation ?? currentQ.hint}
                  </div>
                )}
                <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
                  <div className="flex items-center gap-3">
                    <motion.span
                      animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6 }}
                      className="text-3xl"
                    >
                      🎉
                    </motion.span>
                    <div>
                      <p className="text-sm font-extrabold text-emerald-900">
                        Hore! Belajar, Game & Tebak-Tebakan Selesai! 👏
                      </p>
                      <p className="text-xs font-medium text-emerald-700">
                        Laporan kamera pemantau & skor siap disimpan untuk Admin.
                      </p>
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleFinishStage}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-500 cursor-pointer"
                  >
                    <Trophy className="h-4 w-4" />
                    Klaim XP & Simpan
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export function ReadingGame({
  stageLevels,
  customConfig,
  onComplete,
}: {
  stageLevels: StageLevels;
  customConfig?: CustomLevelConfig;
  onComplete: (payload: GameCompletionPayload) => void;
}) {
  const stage = getStageByNumber(READING_STAGES, stageLevels.membaca);
  return (
    <TutoringArena
      category="Membaca"
      currentStage={stage}
      initialLetterStep={stageLevels.letterStep}
      customConfig={customConfig}
      accent="sky"
      onComplete={onComplete}
    />
  );
}

export function MathSprintGame({
  stageLevels,
  customConfig,
  onComplete,
}: {
  stageLevels: StageLevels;
  customConfig?: CustomLevelConfig;
  onComplete: (payload: GameCompletionPayload) => void;
}) {
  const stage = getStageByNumber(MATH_STAGES, stageLevels.berhitung);
  return (
    <TutoringArena
      category="Berhitung"
      currentStage={stage}
      initialLetterStep={stageLevels.letterStep}
      customConfig={customConfig}
      accent="amber"
      onComplete={onComplete}
    />
  );
}

export function LogicMemoryGame({
  stageLevels,
  customConfig,
  onComplete,
}: {
  stageLevels: StageLevels;
  customConfig?: CustomLevelConfig;
  onComplete: (payload: GameCompletionPayload) => void;
}) {
  const stage = getStageByNumber(LOGIC_STAGES, stageLevels.logika);
  return (
    <TutoringArena
      category="Logika"
      currentStage={stage}
      initialLetterStep={stageLevels.letterStep}
      customConfig={customConfig}
      accent="emerald"
      onComplete={onComplete}
    />
  );
}

export function WritingCanvasGame({
  stageLevels,
  customConfig,
  onComplete,
}: {
  stageLevels: StageLevels;
  customConfig?: CustomLevelConfig;
  onComplete: (payload: GameCompletionPayload) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const strokesRef = useRef(0);
  const proctorRef = useRef<ProctorMonitorHandle | null>(null);

  const currentStage = getStageByNumber(WRITING_STAGES, stageLevels.menulis);
  const unlockedCount =
    currentStage.levelNumber === 1
      ? Math.min(currentStage.targets.length, Math.max(1, stageLevels.letterStep + 1))
      : currentStage.targets.length;
  const visibleTargets = currentStage.targets.slice(0, unlockedCount);

  const [targetIdx, setTargetIdx] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);
  const [penColor, setPenColor] = useState("#4f46e5");

  const currentTarget =
    visibleTargets[targetIdx % visibleTargets.length];

  function drawGuide(text: string) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.font = "bold 72px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(148, 163, 184, 0.35)";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    ctx.restore();
    strokesRef.current = 0;
  }

  useEffect(() => {
    drawGuide(currentTarget.text);
  }, [currentTarget.text]);

  useEffect(() => {
    return () => stopAllSpeech();
  }, []);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getPoint(e);
    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    strokesRef.current += 1;
    if (strokesRef.current % 4 === 1) {
      setStrokeCount((c) => c + 1);
    }
  }

  function handlePointerUp() {
    drawingRef.current = false;
  }

  function handleClear() {
    setStrokeCount(0);
    drawGuide(currentTarget.text);
  }

  function handleFinishWriting() {
    playVictoryFanfare();
    const proctorReport = proctorRef.current?.buildReport();
    onComplete({
      gameName: `${currentStage.title} ("${currentTarget.text}")`,
      category: "Menulis",
      score: Math.min(100, 82 + Math.min(18, strokeCount)),
      stars: 3,
      xpGain: 90,
      minutesGain: 5,
      proctor: proctorReport,
    });
  }

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5">
        <div>
          <span className="rounded-full bg-violet-600 px-2.5 py-0.5 text-[11px] font-extrabold text-white">
            Level {currentStage.levelNumber}
          </span>
          <span className="ml-2 text-xs font-extrabold text-slate-900">
            {currentStage.title.replace(/^Level \d+:\s*/, "")}
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-500">
          Terbuka {visibleTargets.length} pola
        </span>
      </div>

      <ProctorCameraMonitor active={true} monitorRef={proctorRef} />

      {(() => {
        const yt = getYouTubeEmbedUrl(customConfig?.youtubeUrl ?? "");
        const exp = customConfig?.lessonExplanation?.trim();
        if (!yt && !exp) return null;
        return (
          <div className="space-y-2 rounded-2xl border border-rose-200 bg-rose-50/40 p-3">
            {yt && (
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                <iframe
                  src={yt}
                  title="Video Pembelajaran Menulis"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {exp && (
              <p className="rounded-xl bg-white px-3 py-2 text-xs text-slate-700">
                <strong className="text-violet-700">Penjelasan Guru:</strong>{" "}
                {exp}
              </p>
            )}
          </div>
        );
      })()}

      {/* Bertahap: hanya tombol pola yang sudah terbuka */}
      <div className="flex flex-wrap gap-1">
        {visibleTargets.map((t, idx) => {
          const active = idx === targetIdx % visibleTargets.length;
          return (
            <button
              key={t.text}
              type="button"
              onClick={() => {
                setStrokeCount(0);
                setTargetIdx(idx);
              }}
              className={`rounded-lg border px-2.5 py-1 text-xs font-extrabold transition-all cursor-pointer ${
                active
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-violet-50"
              }`}
            >
              {t.text}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="font-bold text-slate-700">
            Tebalkan:{" "}
            <span className="text-violet-700">{currentTarget.text}</span>
          </span>
          <p className="text-[11px] text-slate-500">{currentTarget.hint}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => speakIndonesian(currentTarget.speakPrompt)}
            className="mr-1 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-extrabold text-violet-800 hover:bg-violet-200 cursor-pointer"
          >
            <Volume2 className="h-3.5 w-3.5" />
            Suara Guru
          </button>
          {["#4f46e5", "#ec4899", "#10b981", "#f59e0b"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setPenColor(c)}
              style={{ backgroundColor: c }}
              className={`h-5 w-5 rounded-full cursor-pointer transition-transform ${
                penColor === c
                  ? "scale-110 ring-2 ring-slate-900 ring-offset-1"
                  : ""
              }`}
              aria-label="Pilih warna pena"
            />
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="ml-1 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <Eraser className="h-3.5 w-3.5" />
            Hapus
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={520}
        height={210}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full touch-none rounded-2xl border-2 border-dashed border-violet-300 bg-slate-50 cursor-crosshair"
      />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setStrokeCount(0);
            setTargetIdx((i) => (i + 1) % visibleTargets.length);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          Ganti Pola ({(targetIdx % visibleTargets.length) + 1}/
          {visibleTargets.length})
        </button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          disabled={strokeCount < 2}
          onClick={handleFinishWriting}
          className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-violet-500 disabled:opacity-45 cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" />
          Selesai Menulis (+90 XP)
        </motion.button>
      </div>
    </div>
  );
}

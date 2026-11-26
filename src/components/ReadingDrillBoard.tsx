"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Play, Square, Volume2 } from "lucide-react";
import {
  ALPHABET_AZ,
  CONSONANTS_BZ,
  DIGRAPH_DRILLS,
  VOWELS,
  buildCompleteThreeLetterDrill,
  buildFrontVowelDrill,
  buildNextVowelDrillSheet,
  buildVowelADrillSheet,
  type VowelChar,
} from "@/lib/az-curriculum";
import { speakIndonesian, stopAllSpeech } from "@/lib/sound-effects";
import { SpeechMicPractice } from "@/components/SpeechMicPractice";

interface ReadingDrillBoardProps {
  stageId: string;
  letterStep: number;
  onAdvanceLetterStep: (nextStep: number) => void;
  focusConsonant: string;
  onFocusConsonantChange: (consonantLower: string) => void;
}

export function ReadingDrillBoard({
  stageId,
  letterStep,
  onAdvanceLetterStep,
  focusConsonant,
  onFocusConsonantChange,
}: ReadingDrillBoardProps) {
  const [selectedVowelOther, setSelectedVowelOther] = useState<VowelChar>("i");
  const [selectedFrontVowel, setSelectedFrontVowel] = useState<VowelChar>("a");
  const [selectedFrontC, setSelectedFrontC] = useState("d");
  const [threeFrontC, setThreeFrontC] = useState("b");
  const [threeVowel, setThreeVowel] = useState<VowelChar>("a");
  const [threeEndC, setThreeEndC] = useState("d");
  const [selectedDigraph, setSelectedDigraph] = useState("ng");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const playTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
      stopAllSpeech();
    };
  }, [stageId]);

  function stopSequence() {
    if (playTimerRef.current) {
      window.clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
    setIsPlayingAll(false);
    setActiveKey(null);
    stopAllSpeech();
  }

  function speakItem(key: string, textToSpeak: string) {
    stopSequence();
    setActiveKey(key);
    speakIndonesian(textToSpeak, 0.88);
  }

  function playLinesSequence(lines: string[], prefix: string) {
    stopSequence();
    setIsPlayingAll(true);
    let idx = 0;

    function next() {
      if (idx >= lines.length) {
        setIsPlayingAll(false);
        setActiveKey(null);
        return;
      }
      const line = lines[idx];
      setActiveKey(`${prefix}-${idx}`);
      speakIndonesian(line.replace(/\s+/g, ", "), 0.85);
      idx += 1;
      playTimerRef.current = window.setTimeout(next, 1650);
    }

    next();
  }

  // Stage 1: HANYA tampilkan huruf bertahap (mulai A saja, lalu buka B, C, ... bertahap!)
  if (stageId === "read-1-vokal") {
    const safeStep = Math.max(0, Math.min(ALPHABET_AZ.length - 1, letterStep));
    const unlockedLetters = ALPHABET_AZ.slice(0, safeStep + 1);
    const activeLetter = unlockedLetters[unlockedLetters.length - 1];
    const hasNext = safeStep + 1 < ALPHABET_AZ.length;
    const nextLetter = hasNext ? ALPHABET_AZ[safeStep + 1] : null;

    return (
      <div className="space-y-4">
        {/* Kartu Huruf Fokus Saat Ini */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-amber-900">
              Huruf Aktif Sekarang (Tahap {safeStep + 1} dari 26):
            </span>
            {nextLetter && (
              <button
                type="button"
                onClick={() => {
                  stopSequence();
                  onAdvanceLetterStep(safeStep + 1);
                }}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold text-white shadow-xs hover:bg-emerald-500 cursor-pointer"
              >
                Buka Huruf Berikutnya ({nextLetter.upper})
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          <motion.button
            key={activeLetter.upper}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              speakItem(
                `focus-${activeLetter.lower}`,
                `Ini huruf ${activeLetter.upper}. ${activeLetter.soundHint}. Contoh kata: ${activeLetter.exampleWord}.`
              )
            }
            className="mt-2.5 flex w-full items-center justify-between rounded-2xl border-2 border-amber-300 bg-white p-4 text-left shadow-xs hover:border-amber-500 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{activeLetter.emoji}</span>
              <div>
                <p className="text-2xl font-black text-slate-900">
                  {activeLetter.upper} {activeLetter.lower} — {activeLetter.exampleWord}
                </p>
                <p className="text-xs font-semibold text-amber-800">
                  {activeLetter.soundHint}
                </p>
              </div>
            </div>
            <Volume2 className="h-5 w-5 text-amber-600" />
          </motion.button>
        </div>

        {/* Penyebutan Langsung Anak via Mic */}
        <SpeechMicPractice
          promptLabel={`Coba ucapkan huruf "${activeLetter.upper}" atau kata "${activeLetter.exampleWord}" ke mikrofon!`}
          expectedWords={[
            activeLetter.lower,
            activeLetter.upper,
            activeLetter.exampleWord,
          ]}
        />

        {/* Daftar Huruf yang Sudah Terbuka Saja (bukan semuanya) */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-slate-700">
              Huruf yang Sudah Terbuka ({unlockedLetters.length}/26):
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Lock className="h-3 w-3" />
              Huruf lain dibuka bertahap
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {unlockedLetters.map((item, idx) => {
              const isLatest = idx === unlockedLetters.length - 1;
              return (
                <motion.button
                  key={item.upper}
                  type="button"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() =>
                    speakItem(
                      `az-${item.lower}`,
                      `Huruf ${item.upper}. ${item.exampleWord}`
                    )
                  }
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-black transition-all cursor-pointer ${
                    activeKey === `az-${item.lower}`
                      ? "border-indigo-500 bg-indigo-600 text-white shadow"
                      : isLatest
                      ? "border-amber-400 bg-amber-100 text-amber-900"
                      : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300"
                  }`}
                >
                  <span>
                    {item.upper}
                    {item.lower}
                  </span>
                  <span className="text-xs">{item.emoji}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Stage 2: Fokus Vokal A (A, BA -> CA -> DA ... bertahap sesuai letterStep, tidak semua langsung!)
  if (stageId === "read-2-vokal-a") {
    const maxUnlockedIdx = Math.min(CONSONANTS_BZ.length - 1, Math.max(0, letterStep));
    const visibleConsonants = CONSONANTS_BZ.slice(0, maxUnlockedIdx + 1);
    const sheet = buildVowelADrillSheet(focusConsonant);
    const hasNextConsonant = maxUnlockedIdx + 1 < CONSONANTS_BZ.length;
    const nextConsonant = hasNextConsonant
      ? CONSONANTS_BZ[maxUnlockedIdx + 1]
      : null;

    return (
      <div className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-extrabold text-slate-700">
              Tahap Vokal A Terbuka ({visibleConsonants.length} dari 21 konsonan):
            </p>
            {nextConsonant && (
              <button
                type="button"
                onClick={() => {
                  stopSequence();
                  onAdvanceLetterStep(maxUnlockedIdx + 1);
                  onFocusConsonantChange(nextConsonant.lower);
                }}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold text-white hover:bg-emerald-500 cursor-pointer"
              >
                Buka Suku Kata {nextConsonant.upper}A
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visibleConsonants.map((c, idx) => {
              const active = sheet.consonant === c.lower;
              const isPrevious = idx < sheet.consonantIndex;
              return (
                <button
                  key={c.lower}
                  type="button"
                  onClick={() => {
                    stopSequence();
                    onFocusConsonantChange(c.lower);
                  }}
                  className={`h-8 rounded-lg border px-2.5 text-xs font-extrabold uppercase transition-all cursor-pointer ${
                    active
                      ? "border-sky-600 bg-sky-600 text-white shadow-sm"
                      : isPrevious
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {c.lower}a
                </button>
              );
            })}
          </div>
        </div>

        <SpeechMicPractice
          promptLabel={`Sebutkan bunyi suku kata "${sheet.consonant.toUpperCase()}A" atau baca baris pertama "${sheet.classicLines[0].toUpperCase()}"!`}
          expectedWords={[
            `${sheet.consonant}a`,
            sheet.classicLines[0],
            "ba",
            "ca",
          ]}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-slate-900">
                Papan Baca Baru ({sheet.consonant.toUpperCase()}A)
              </p>
              <button
                type="button"
                onClick={() =>
                  isPlayingAll
                    ? stopSequence()
                    : playLinesSequence(sheet.classicLines, "cl")
                }
                className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-extrabold text-indigo-800 hover:bg-indigo-200 cursor-pointer"
              >
                {isPlayingAll ? (
                  <>
                    <Square className="h-3 w-3 fill-current" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-current" /> Baca Semua
                  </>
                )}
              </button>
            </div>
            <div className="mt-2.5 space-y-1.5">
              {sheet.classicLines.map((line, idx) => (
                <button
                  key={line}
                  type="button"
                  onClick={() =>
                    speakItem(`cl-${idx}`, line.replace(/\s+/g, ", "))
                  }
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-2 text-base font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeKey === `cl-${idx}`
                      ? "border-indigo-500 bg-indigo-50 text-indigo-800 shadow-xs"
                      : "border-slate-100 bg-slate-50 text-slate-800 hover:bg-indigo-50/40"
                  }`}
                >
                  <span>{line}</span>
                  <Volume2 className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-slate-900">
                Review Gabungan Huruf Lama
              </p>
              <button
                type="button"
                onClick={() =>
                  isPlayingAll
                    ? stopSequence()
                    : playLinesSequence(sheet.reviewLines, "rv")
                }
                className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800 hover:bg-emerald-200 cursor-pointer"
              >
                <Play className="h-3 w-3 fill-current" /> Baca Review
              </button>
            </div>
            <div className="mt-2.5 space-y-1.5">
              {sheet.reviewLines.map((line, idx) => (
                <button
                  key={`${line}-${idx}`}
                  type="button"
                  onClick={() =>
                    speakItem(`rv-${idx}`, line.replace(/\s+/g, ", "))
                  }
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-2 text-base font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeKey === `rv-${idx}`
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs"
                      : "border-slate-100 bg-slate-50 text-slate-800 hover:bg-emerald-50/40"
                  }`}
                >
                  <span>{line}</span>
                  <Volume2 className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stage 3: Vokal I, U, E, O
  if (stageId === "read-3-vokal-lain") {
    const sheet = buildNextVowelDrillSheet(focusConsonant, selectedVowelOther);
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {(["i", "u", "e", "o"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  stopSequence();
                  setSelectedVowelOther(v);
                }}
                className={`rounded-xl border px-3.5 py-1.5 text-xs font-extrabold uppercase cursor-pointer ${
                  selectedVowelOther === v
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-indigo-50"
                }`}
              >
                Vokal {v.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-bold text-emerald-700">
            🔁 Review vokal A..{selectedVowelOther.toUpperCase()}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CONSONANTS_BZ.map((c) => (
            <button
              key={c.lower}
              type="button"
              onClick={() => {
                stopSequence();
                onFocusConsonantChange(c.lower);
              }}
              className={`h-8 rounded-lg border px-2 text-xs font-extrabold uppercase cursor-pointer ${
                sheet.consonant === c.lower
                  ? "border-sky-600 bg-sky-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-sky-50"
              }`}
            >
              {c.lower}
              {selectedVowelOther}
            </button>
          ))}
        </div>

        <SpeechMicPractice
          promptLabel={`Ucapkan "${sheet.focusSyllable.toUpperCase()}" dengan jelas ke mikrofon!`}
          expectedWords={[sheet.focusSyllable, ...sheet.reviewSyllables]}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-slate-900">
              Latihan Baris ({sheet.focusSyllable.toUpperCase()} + Review Vokal Lama)
            </p>
            <button
              type="button"
              onClick={() =>
                isPlayingAll
                  ? stopSequence()
                  : playLinesSequence(sheet.drillLines, "nvl")
              }
              className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-extrabold text-indigo-800 cursor-pointer"
            >
              <Play className="h-3 w-3 fill-current" /> Baca Semua
            </button>
          </div>
          <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sheet.drillLines.map((line, idx) => (
              <button
                key={line}
                type="button"
                onClick={() =>
                  speakItem(`nvl-${idx}`, line.replace(/\s+/g, ", "))
                }
                className={`flex items-center justify-between rounded-xl border px-4 py-2 text-base font-black uppercase tracking-widest cursor-pointer ${
                  activeKey === `nvl-${idx}`
                    ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                    : "border-slate-100 bg-slate-50 text-slate-800 hover:bg-indigo-50/40"
                }`}
              >
                <span>{line}</span>
                <Volume2 className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Stage 4: Vokal Depan Lengkap
  if (stageId === "read-4-huruf-depan") {
    const drill = buildFrontVowelDrill(selectedFrontC, selectedFrontVowel);
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {VOWELS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                stopSequence();
                setSelectedFrontVowel(v);
              }}
              className={`rounded-xl border px-3 py-1.5 text-xs font-extrabold uppercase cursor-pointer ${
                selectedFrontVowel === v
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {v}b–{v}z
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {drill.allConsonantsForVowel.map((syl) => {
            const c = syl[1];
            return (
              <button
                key={syl}
                type="button"
                onClick={() => {
                  setSelectedFrontC(c);
                  speakItem(`fc-${syl}`, syl);
                }}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-black uppercase cursor-pointer ${
                  c === selectedFrontC
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-sky-50"
                }`}
              >
                {syl}
              </button>
            );
          })}
        </div>

        <SpeechMicPractice
          promptLabel={`Ucapkan pola "${selectedFrontVowel.toUpperCase()}${selectedFrontC.toUpperCase()}"!`}
          expectedWords={drill.fiveVowelsForConsonant}
        />

        <div className="grid grid-cols-5 gap-2">
          {drill.fiveVowelsForConsonant.map((syl) => (
            <button
              key={syl}
              type="button"
              onClick={() => speakItem(`f-${syl}`, syl)}
              className={`rounded-xl border-2 py-2.5 text-lg font-black uppercase cursor-pointer ${
                activeKey === `f-${syl}`
                  ? "border-sky-600 bg-sky-600 text-white"
                  : "border-sky-100 bg-sky-50 text-slate-900 hover:border-sky-300"
              }`}
            >
              {syl}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Stage 5: 3 Huruf Lengkap (Semua B-Z x a-o x b-z)
  if (stageId === "read-5-tiga-huruf") {
    const drill = buildCompleteThreeLetterDrill(
      threeFrontC,
      threeVowel,
      threeEndC
    );
    const activeWord3 = `${threeFrontC}${threeVowel}${threeEndC}`;
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-extrabold text-slate-700">
            1. Huruf Depan Lengkap (B–Z):
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {CONSONANTS_BZ.map((c) => (
              <button
                key={`front-${c.lower}`}
                type="button"
                onClick={() => {
                  stopSequence();
                  setThreeFrontC(c.lower);
                }}
                className={`h-7 w-7 rounded-lg border text-xs font-extrabold uppercase cursor-pointer ${
                  threeFrontC === c.lower
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {c.lower}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-extrabold text-slate-700">2. Vokal:</span>
          {VOWELS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setThreeVowel(v)}
              className={`h-7 w-8 rounded-lg border text-xs font-extrabold uppercase cursor-pointer ${
                threeVowel === v
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {drill.allEndingsForFront.map((word3) => {
            const endChar = word3[2];
            return (
              <button
                key={word3}
                type="button"
                onClick={() => {
                  setThreeEndC(endChar);
                  speakItem(`w3-${word3}`, word3);
                }}
                className={`rounded-xl border py-2 text-xs sm:text-sm font-black uppercase cursor-pointer ${
                  endChar === threeEndC
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:border-sky-300"
                }`}
              >
                {word3}
              </button>
            );
          })}
        </div>

        <SpeechMicPractice
          promptLabel={`Ucapkan suku kata 3 huruf "${activeWord3.toUpperCase()}"!`}
          expectedWords={[activeWord3, ...drill.fiveVowelsPair]}
        />
      </div>
    );
  }

  // Stage 6: Huruf Sambung
  if (stageId === "read-6-sambung") {
    const dg =
      DIGRAPH_DRILLS.find((d) => d.id === selectedDigraph) ?? DIGRAPH_DRILLS[0];
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {DIGRAPH_DRILLS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                stopSequence();
                setSelectedDigraph(item.id);
              }}
              className={`rounded-xl border px-3.5 py-2 text-xs font-extrabold uppercase cursor-pointer ${
                selectedDigraph === item.id
                  ? "border-sky-600 bg-sky-600 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              Huruf Sambung: {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {dg.syllables.map((syl) => (
            <button
              key={syl}
              type="button"
              onClick={() => speakItem(`dg-${syl}`, syl)}
              className={`rounded-xl border-2 py-3 text-base font-black uppercase cursor-pointer ${
                activeKey === `dg-${syl}`
                  ? "border-sky-600 bg-sky-600 text-white"
                  : "border-sky-100 bg-sky-50 text-slate-900"
              }`}
            >
              {syl}
            </button>
          ))}
        </div>

        <SpeechMicPractice
          promptLabel={`Ucapkan huruf sambung "${dg.syllables[0].toUpperCase()}"!`}
          expectedWords={dg.syllables}
        />
      </div>
    );
  }

  return null;
}

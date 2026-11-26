"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mic, MicOff, Volume2 } from "lucide-react";
import {
  playCelebrationWithPraise,
  playWrongEncourage,
} from "@/lib/sound-effects";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechMicPracticeProps {
  promptLabel: string;
  expectedWords: string[];
  onPassed?: (spoken: string) => void;
}

function normalizeSpoken(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSpokenMatch(spoken: string, expectedList: string[]): boolean {
  const norm = normalizeSpoken(spoken);
  if (!norm) return false;
  const tokens = norm.split(" ");
  return expectedList.some((target) => {
    const t = normalizeSpoken(target);
    if (!t) return false;
    if (norm === t || norm.includes(t) || tokens.includes(t)) return true;
    // Toleransi pengucapan huruf tunggal (misal "a" dikenali sebagai "ah" atau "aa")
    if (t.length === 1 && tokens.some((tok) => tok.startsWith(t))) return true;
    return false;
  });
}

export function SpeechMicPractice({
  promptLabel,
  expectedWords,
  onPassed,
}: SpeechMicPracticeProps) {
  const [listening, setListening] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [spokenText, setSpokenText] = useState("");
  const [resultState, setResultState] = useState<
    "idle" | "matched" | "retry" | "unsupported"
  >("idle");

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  function cleanupAudio() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setVolumeLevel(0);
  }

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      cleanupAudio();
    };
  }, []);

  async function startVolumeMeter() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolumeLevel(Math.min(100, Math.round(avg * 1.8)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Tetap lanjutkan recognition walau meter gagal
    }
  }

  function handleStartMic() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      cleanupAudio();
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRec = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setResultState("unsupported");
      return;
    }

    const rec = new SpeechRec();
    rec.lang = "id-ID";
    rec.interimResults = false;
    rec.maxAlternatives = 3;

    setSpokenText("");
    setResultState("idle");
    setListening(true);
    void startVolumeMeter();

    rec.onresult = (event) => {
      const firstResult = event.results?.[0];
      const transcript = firstResult?.[0]?.transcript ?? "";
      setSpokenText(transcript);

      if (isSpokenMatch(transcript, expectedWords)) {
        setResultState("matched");
        playCelebrationWithPraise(
          `Hebat! Sebutanmu ${transcript} terdengar jelas dan benar!`
        );
        onPassed?.(transcript);
      } else {
        setResultState("retry");
        playWrongEncourage();
      }
    };

    rec.onerror = () => {
      setListening(false);
      cleanupAudio();
    };

    rec.onend = () => {
      setListening(false);
      cleanupAudio();
    };

    recognitionRef.current = rec;
    rec.start();
  }

  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-sky-50/80 p-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-900">
            <Volume2 className="h-4 w-4 text-indigo-600" />
            Latihan Penyebutan Anak (Mic):
          </p>
          <p className="mt-0.5 text-xs font-semibold text-slate-700">
            {promptLabel}
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartMic}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold text-white shadow-sm cursor-pointer ${
            listening
              ? "bg-rose-600 animate-pulse"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {listening ? (
            <>
              <MicOff className="h-4 w-4" />
              Mendengarkan... (Stop)
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Tekan & Sebutkan
            </>
          )}
        </motion.button>
      </div>

      {/* Live Mic Waveform Meter */}
      {listening && (
        <div className="mt-3 space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white">
            <div
              style={{ width: `${Math.max(8, volumeLevel)}%` }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-500 transition-all duration-75"
            />
          </div>
          <p className="text-[11px] font-semibold text-indigo-700">
            Silakan ucapkan dengan suara lantang ke mikrofon...
          </p>
        </div>
      )}

      {/* Result feedback */}
      {spokenText && (
        <div className="mt-2.5 flex items-center gap-2 text-xs font-bold">
          {resultState === "matched" ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-1.5 text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              👏 Pintar! Terdengar: &ldquo;{spokenText}&rdquo;
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-1.5 text-amber-800">
              Terdengar: &ldquo;{spokenText}&rdquo; — yuk coba sebutkan lagi yang jelas!
            </span>
          )}
        </div>
      )}

      {resultState === "unsupported" && (
        <p className="mt-2 text-[11px] font-semibold text-amber-800">
          Browser ini belum mendukung Speech Recognition (gunakan Google Chrome / Edge untuk fitur cek suara anak).
        </p>
      )}
    </div>
  );
}

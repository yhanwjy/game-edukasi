"use client";

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (!enabled) {
    stopAllSpeech();
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function stopAllSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakIndonesian(text: string, rate = 0.92) {
  if (!soundEnabled) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "id-ID";
  utter.rate = rate;
  utter.pitch = 1.06;
  window.speechSynthesis.speak(utter);
}

const PRAISE_PHRASES = [
  "Hebat sekali! Jawabanmu benar!",
  "Pintar! Tepuk tangan buat kamu!",
  "Luar biasa, tepat sekali!",
  "Keren banget! Ayo lanjut!",
  "Mantap! Kamu cepat sekali belajarnya!",
];

export function playClapBurst(ctx: AudioContext, startTime: number, volume = 0.22) {
  const bufferSize = Math.floor(ctx.sampleRate * 0.085);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const env = Math.pow(1 - i / bufferSize, 2.2);
    data[i] = (Math.random() * 2 - 1) * env;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1400, startTime);
  filter.Q.setValueAtTime(1.2, startTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.085);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(startTime);
}

export function playCelebrationWithPraise(customPraise?: string) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();

  if (ctx) {
    const now = ctx.currentTime;
    // Cheerful ascending chime (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const t = now + idx * 0.075;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.16, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });

    // Layered applause claps
    const clapOffsets = [0.05, 0.14, 0.23, 0.31, 0.4, 0.48, 0.57, 0.66];
    clapOffsets.forEach((offset, idx) => {
      playClapBurst(ctx, now + offset, idx % 2 === 0 ? 0.24 : 0.16);
    });
  }

  const phrase =
    customPraise ??
    PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
  setTimeout(() => {
    speakIndonesian(phrase, 0.96);
  }, 260);
}

export function playWrongEncourage() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (ctx) {
    const now = ctx.currentTime;
    [392, 329.63].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const t = now + idx * 0.12;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  }
  setTimeout(() => {
    speakIndonesian("Hampir benar, yuk coba lagi!", 0.95);
  }, 180);
}

export function playVictoryFanfare() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (ctx) {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const t = now + idx * 0.09;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.38);
    });
    for (let i = 0; i < 10; i++) {
      playClapBurst(ctx, now + 0.12 + i * 0.09, 0.22);
    }
  }
  setTimeout(() => {
    speakIndonesian("Wah hebat! Kamu menyelesaikan level ini! Tepuk tangan!", 0.95);
  }, 350);
}

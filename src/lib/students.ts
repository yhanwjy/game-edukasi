import type {
  AvatarOption,
  EducationLevel,
  LevelMeta,
  SkillProgress,
  StageLevels,
  StudentAccount,
} from "@/types/student";

export const DEFAULT_STAGE_LEVELS: StageLevels = {
  membaca: 1,
  menulis: 1,
  berhitung: 1,
  logika: 1,
  letterStep: 0,
};

export const EDUCATION_LEVELS: LevelMeta[] = [
  {
    id: "TK",
    label: "TK (Calistung Dasar)",
    subtitle: "Fonik huruf, tracing kanvas & hitung visual",
    ageHint: "4–6 thn",
    badgeColor: "from-pink-500 to-rose-500",
    pillBg: "bg-rose-50 border-rose-200",
    pillText: "text-rose-700",
    accentBar: "bg-rose-500",
    modules: ["Kenal Huruf A-Z", "Tracing Angka", "Hitung Buah"],
  },
  {
    id: "SD",
    label: "SD (Calistung Lanjutan)",
    subtitle: "Cerita pendek, dikte & operasi hitung cepat",
    ageHint: "7–12 thn",
    badgeColor: "from-amber-400 to-orange-500",
    pillBg: "bg-amber-50 border-amber-200",
    pillText: "text-amber-700",
    accentBar: "bg-amber-500",
    modules: ["Baca Cerita", "Dikte Kata", "Kali & Bagi"],
  },
  {
    id: "SMP",
    label: "SMP (Eksplorasi)",
    subtitle: "Literasi analitis, aljabar & teka-teki logika",
    ageHint: "13–15 thn",
    badgeColor: "from-emerald-400 to-teal-500",
    pillBg: "bg-emerald-50 border-emerald-200",
    pillText: "text-emerald-700",
    accentBar: "bg-emerald-500",
    modules: ["Aljabar Dasar", "IPA Interaktif", "Literasi Kritis"],
  },
  {
    id: "SMA",
    label: "SMA (Kompetitif)",
    subtitle: "Trigonometri, sains lanjut & kuis cepat UTBK",
    ageHint: "16–18 thn",
    badgeColor: "from-sky-500 to-indigo-500",
    pillBg: "bg-sky-50 border-sky-200",
    pillText: "text-sky-700",
    accentBar: "bg-sky-500",
    modules: ["Kalkulus Awal", "Kuis SNBT", "Analisis Wacana"],
  },
  {
    id: "Universitas",
    label: "Universitas (Akademik)",
    subtitle: "Statistika, riset, flashcard & studi kasus",
    ageHint: "19+ thn",
    badgeColor: "from-violet-500 to-purple-600",
    pillBg: "bg-violet-50 border-violet-200",
    pillText: "text-violet-700",
    accentBar: "bg-violet-500",
    modules: ["Statistika", "Spaced Repetition", "Logika Riset"],
  },
];

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: "astronot",
    emoji: "🧑‍🚀",
    label: "Astronot",
    gradient: "from-indigo-500 to-purple-500",
    ring: "ring-indigo-300",
  },
  {
    id: "kucing",
    emoji: "🐱",
    label: "Kucing Pintar",
    gradient: "from-amber-400 to-orange-500",
    ring: "ring-amber-300",
  },
  {
    id: "panda",
    emoji: "🐼",
    label: "Panda Ceria",
    gradient: "from-emerald-400 to-teal-500",
    ring: "ring-emerald-300",
  },
  {
    id: "dino",
    emoji: "🦖",
    label: "Dino Hebat",
    gradient: "from-lime-400 to-green-500",
    ring: "ring-lime-300",
  },
  {
    id: "unicorn",
    emoji: "🦄",
    label: "Unicorn",
    gradient: "from-pink-400 to-rose-500",
    ring: "ring-pink-300",
  },
  {
    id: "robot",
    emoji: "🤖",
    label: "Robot Cerdas",
    gradient: "from-cyan-400 to-blue-500",
    ring: "ring-cyan-300",
  },
  {
    id: "rubah",
    emoji: "🦊",
    label: "Rubah Gesit",
    gradient: "from-orange-400 to-red-500",
    ring: "ring-orange-300",
  },
  {
    id: "burung",
    emoji: "🦉",
    label: "Burung Hantu",
    gradient: "from-violet-400 to-fuchsia-500",
    ring: "ring-violet-300",
  },
];

export const INITIAL_STUDENTS: StudentAccount[] = [
  {
    id: "stu-1",
    name: "Aisyah Putri",
    username: "aisyah_tk",
    pin: "1234",
    age: 5,
    level: "TK",
    avatarId: "unicorn",
    xp: 1280,
    streakDays: 9,
    dailyTargetMinutes: 20,
    todayMinutes: 24,
    skills: {
      membaca: 84,
      menulis: 76,
      berhitung: 88,
      logikaGame: 80,
    },
    stageLevels: { membaca: 1, menulis: 1, berhitung: 1, logika: 1, letterStep: 0 },
    badges: ["Jago Fonik A-Z", "Bintang Tracing", "Streak 7 Hari"],
    weeklyActivity: [
      { day: "Sen", minutes: 18, xp: 140 },
      { day: "Sel", minutes: 22, xp: 185 },
      { day: "Rab", minutes: 15, xp: 120 },
      { day: "Kam", minutes: 25, xp: 210 },
      { day: "Jum", minutes: 20, xp: 175 },
      { day: "Sab", minutes: 30, xp: 260 },
      { day: "Min", minutes: 24, xp: 190 },
    ],
    recentGames: [
      {
        id: "g-1",
        gameName: "Tangkap Balon Huruf",
        category: "Membaca",
        score: 95,
        stars: 3,
        playedAt: "Hari ini, 09:20",
      },
      {
        id: "g-2",
        gameName: "Papan Tracing Angka 1-20",
        category: "Menulis",
        score: 82,
        stars: 3,
        playedAt: "Kemarin, 16:40",
      },
      {
        id: "g-3",
        gameName: "Hitung Buah Keranjang",
        category: "Berhitung",
        score: 90,
        stars: 3,
        playedAt: "2 hari lalu",
      },
    ],
    notes: "Sangat antusias di game fonik, perlu sedikit latihan menulis huruf 'g' dan 'q'.",
    createdAt: "2026-10-12",
    lastActive: "15 menit lalu",
  },
  {
    id: "stu-2",
    name: "Rafa Pratama",
    username: "rafa_sd",
    pin: "4567",
    age: 8,
    level: "SD",
    avatarId: "dino",
    xp: 2150,
    streakDays: 14,
    dailyTargetMinutes: 30,
    todayMinutes: 35,
    skills: {
      membaca: 78,
      menulis: 70,
      berhitung: 94,
      logikaGame: 91,
    },
    stageLevels: { membaca: 1, menulis: 1, berhitung: 1, logika: 1, letterStep: 0 },
    badges: ["Juara Balap Hitung", "Pemburu Bintang", "Streak 14 Hari"],
    weeklyActivity: [
      { day: "Sen", minutes: 28, xp: 240 },
      { day: "Sel", minutes: 32, xp: 290 },
      { day: "Rab", minutes: 30, xp: 260 },
      { day: "Kam", minutes: 40, xp: 370 },
      { day: "Jum", minutes: 25, xp: 220 },
      { day: "Sab", minutes: 45, xp: 410 },
      { day: "Min", minutes: 35, xp: 360 },
    ],
    recentGames: [
      {
        id: "g-4",
        gameName: "Balap Hitung Perkalian",
        category: "Berhitung",
        score: 98,
        stars: 3,
        playedAt: "Hari ini, 10:05",
      },
      {
        id: "g-5",
        gameName: "Dikte Kata Cepat",
        category: "Menulis",
        score: 74,
        stars: 2,
        playedAt: "Kemarin, 19:10",
      },
    ],
    notes: "Cepat di berhitung perkalian. Direkomendasikan perbanyak game dikte & ejaan.",
    createdAt: "2026-09-25",
    lastActive: "1 jam lalu",
  },
  {
    id: "stu-3",
    name: "Nadia Zahra",
    username: "nadia_smp",
    pin: "7890",
    age: 14,
    level: "SMP",
    avatarId: "kucing",
    xp: 3420,
    streakDays: 6,
    dailyTargetMinutes: 40,
    todayMinutes: 28,
    skills: {
      membaca: 92,
      menulis: 88,
      berhitung: 79,
      logikaGame: 86,
    },
    stageLevels: { membaca: 1, menulis: 1, berhitung: 1, logika: 1, letterStep: 0 },
    badges: ["Master Literasi", "Detektif Logika"],
    weeklyActivity: [
      { day: "Sen", minutes: 40, xp: 380 },
      { day: "Sel", minutes: 35, xp: 310 },
      { day: "Rab", minutes: 42, xp: 400 },
      { day: "Kam", minutes: 20, xp: 180 },
      { day: "Jum", minutes: 45, xp: 430 },
      { day: "Sab", minutes: 38, xp: 340 },
      { day: "Min", minutes: 28, xp: 250 },
    ],
    recentGames: [
      {
        id: "g-6",
        gameName: "Teka-Teki Aljabar",
        category: "Berhitung",
        score: 80,
        stars: 2,
        playedAt: "Hari ini, 08:15",
      },
      {
        id: "g-7",
        gameName: "Arena Literasi Kritis",
        category: "Membaca",
        score: 94,
        stars: 3,
        playedAt: "Kemarin, 20:00",
      },
    ],
    notes: "Pemahaman bacaan sangat baik. Sedang mengasah kecepatan di persamaan linear.",
    createdAt: "2026-10-01",
    lastActive: "3 jam lalu",
  },
  {
    id: "stu-4",
    name: "Bagas Prakoso",
    username: "bagas_sma",
    pin: "2468",
    age: 17,
    level: "SMA",
    avatarId: "astronot",
    xp: 4890,
    streakDays: 21,
    dailyTargetMinutes: 45,
    todayMinutes: 50,
    skills: {
      membaca: 85,
      menulis: 82,
      berhitung: 91,
      logikaGame: 95,
    },
    stageLevels: { membaca: 1, menulis: 1, berhitung: 1, logika: 1, letterStep: 0 },
    badges: ["Top Skor SNBT", "Streak 21 Hari", "Raja Kalkulus"],
    weeklyActivity: [
      { day: "Sen", minutes: 45, xp: 460 },
      { day: "Sel", minutes: 50, xp: 520 },
      { day: "Rab", minutes: 40, xp: 410 },
      { day: "Kam", minutes: 55, xp: 580 },
      { day: "Jum", minutes: 48, xp: 490 },
      { day: "Sab", minutes: 60, xp: 640 },
      { day: "Min", minutes: 50, xp: 510 },
    ],
    recentGames: [
      {
        id: "g-8",
        gameName: "Sprint Trigonometri",
        category: "Berhitung",
        score: 92,
        stars: 3,
        playedAt: "Hari ini, 11:30",
      },
      {
        id: "g-9",
        gameName: "Memory Rumus Fisika",
        category: "Logika",
        score: 96,
        stars: 3,
        playedAt: "Kemarin, 21:05",
      },
    ],
    notes: "Konsisten berlatih simulasi UTBK setiap malam dengan akurasi >90%.",
    createdAt: "2026-08-19",
    lastActive: "Baru saja",
  },
  {
    id: "stu-5",
    name: "Keisha Amelia",
    username: "keisha_tk",
    pin: "1357",
    age: 6,
    level: "TK",
    avatarId: "panda",
    xp: 760,
    streakDays: 4,
    dailyTargetMinutes: 15,
    todayMinutes: 12,
    skills: {
      membaca: 62,
      menulis: 58,
      berhitung: 70,
      logikaGame: 68,
    },
    stageLevels: { membaca: 1, menulis: 1, berhitung: 1, logika: 1, letterStep: 0 },
    badges: ["Penjelajah Huruf", "Pembelajar Baru"],
    weeklyActivity: [
      { day: "Sen", minutes: 15, xp: 110 },
      { day: "Sel", minutes: 10, xp: 75 },
      { day: "Rab", minutes: 15, xp: 115 },
      { day: "Kam", minutes: 12, xp: 90 },
      { day: "Jum", minutes: 18, xp: 140 },
      { day: "Sab", minutes: 14, xp: 110 },
      { day: "Min", minutes: 12, xp: 120 },
    ],
    recentGames: [
      {
        id: "g-10",
        gameName: "Susun Suku Kata Ba-Bi-Bu",
        category: "Membaca",
        score: 76,
        stars: 2,
        playedAt: "Hari ini, 10:45",
      },
    ],
    notes: "Baru bergabung minggu lalu, menunjukkan progres cepat di pengenalan suku kata.",
    createdAt: "2026-11-18",
    lastActive: "30 menit lalu",
  },
  {
    id: "stu-6",
    name: "Farhan Wijaya",
    username: "farhan_uni",
    pin: "9090",
    age: 20,
    level: "Universitas",
    avatarId: "robot",
    xp: 5340,
    streakDays: 12,
    dailyTargetMinutes: 45,
    todayMinutes: 45,
    skills: {
      membaca: 90,
      menulis: 87,
      berhitung: 89,
      logikaGame: 93,
    },
    stageLevels: { membaca: 1, menulis: 1, berhitung: 1, logika: 1, letterStep: 0 },
    badges: ["Ahli Statistika", "Master Flashcard"],
    weeklyActivity: [
      { day: "Sen", minutes: 40, xp: 420 },
      { day: "Sel", minutes: 45, xp: 480 },
      { day: "Rab", minutes: 50, xp: 520 },
      { day: "Kam", minutes: 35, xp: 360 },
      { day: "Jum", minutes: 45, xp: 470 },
      { day: "Sab", minutes: 55, xp: 590 },
      { day: "Min", minutes: 45, xp: 490 },
    ],
    recentGames: [
      {
        id: "g-11",
        gameName: "Flashcard Probabilitas",
        category: "Logika",
        score: 94,
        stars: 3,
        playedAt: "Hari ini, 07:50",
      },
    ],
    notes: "Menggunakan mode spaced repetition untuk persiapan ujian statistika inferensial.",
    createdAt: "2026-09-10",
    lastActive: "2 jam lalu",
  },
];

export const STORAGE_KEY = "eduplay_admin_students_v1";

export function getOverallProgress(skills: SkillProgress): number {
  const total =
    skills.membaca + skills.menulis + skills.berhitung + skills.logikaGame;
  return Math.round(total / 4);
}

export function getLevelMeta(level: EducationLevel): LevelMeta {
  return (
    EDUCATION_LEVELS.find((item) => item.id === level) ?? EDUCATION_LEVELS[0]
  );
}

export function getAvatarOption(avatarId: string): AvatarOption {
  return (
    AVATAR_OPTIONS.find((item) => item.id === avatarId) ?? AVATAR_OPTIONS[0]
  );
}

export function generateDefaultWeeklyActivity(): StudentAccount["weeklyActivity"] {
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  return days.map((day, idx) => ({
    day,
    minutes: idx === 6 ? 15 : 0,
    xp: idx === 6 ? 120 : 0,
  }));
}

export function getInitialSkillsByLevel(level: EducationLevel): SkillProgress {
  switch (level) {
    case "TK":
      return { membaca: 35, menulis: 30, berhitung: 40, logikaGame: 45 };
    case "SD":
      return { membaca: 50, menulis: 45, berhitung: 52, logikaGame: 55 };
    case "SMP":
      return { membaca: 60, menulis: 55, berhitung: 58, logikaGame: 62 };
    case "SMA":
      return { membaca: 65, menulis: 60, berhitung: 64, logikaGame: 68 };
    case "Universitas":
      return { membaca: 72, menulis: 70, berhitung: 68, logikaGame: 74 };
  }
}

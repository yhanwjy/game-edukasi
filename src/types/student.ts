export type EducationLevel = "TK" | "SD" | "SMP" | "SMA" | "Universitas";

export type UserRole = "student" | "admin";

export interface SkillProgress {
  membaca: number;
  menulis: number;
  berhitung: number;
  logikaGame: number;
}

export interface StageLevels {
  membaca: number;
  menulis: number;
  berhitung: number;
  logika: number;
  letterStep: number; // 0 = A saja, 1 = A-B, ..., 25 = A-Z
}

export interface ProctorReport {
  status: "Mandiri" | "Terindikasi Dibantu" | "Tanpa Kamera";
  confidence: number;
  durationSec: number;
  warningsCount: number;
  summary: string;
  snapshotDataUrl?: string;
}

export interface DailyActivity {
  day: string;
  minutes: number;
  xp: number;
}

export interface GameSession {
  id: string;
  gameName: string;
  category: "Membaca" | "Menulis" | "Berhitung" | "Logika";
  score: number;
  stars: 1 | 2 | 3;
  playedAt: string;
  proctor?: ProctorReport;
}

export interface StudentAccount {
  id: string;
  name: string;
  username: string;
  pin: string;
  age: number;
  level: EducationLevel;
  avatarId: string;
  xp: number;
  streakDays: number;
  dailyTargetMinutes: number;
  todayMinutes: number;
  skills: SkillProgress;
  stageLevels: StageLevels;
  badges: string[];
  weeklyActivity: DailyActivity[];
  recentGames: GameSession[];
  notes: string;
  createdAt: string;
  lastActive: string;
}

export interface AvatarOption {
  id: string;
  emoji: string;
  label: string;
  gradient: string;
  ring: string;
}

export interface LevelMeta {
  id: EducationLevel;
  label: string;
  subtitle: string;
  ageHint: string;
  badgeColor: string;
  pillBg: string;
  pillText: string;
  accentBar: string;
  modules: string[];
}

export interface ActiveSessionInfo {
  sessionId: string;
  accountKey: string;
  role: UserRole;
  accountId: string;
  username: string;
  displayName: string;
  deviceId: string;
  deviceLabel: string;
  loggedInAt: string;
}

export type LevelActivityMode =
  | "all"
  | "game_quiz"
  | "video_quiz"
  | "video_only";

export interface CustomQuestion {
  id: string;
  prompt: string;
  explanation: string;
  hint: string;
  options: [string, string, string, string];
  answer: string;
  speakQuestion?: string;
}

export interface CustomLevelConfig {
  key: string; // format: "<category>:<levelNumber>"
  category: "Membaca" | "Menulis" | "Berhitung" | "Logika";
  levelNumber: number;
  activityMode: LevelActivityMode;
  youtubeUrl: string;
  lessonExplanation: string;
  questions: CustomQuestion[];
  updatedAt: string;
}

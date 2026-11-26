import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type {
  ActiveSessionInfo,
  CustomLevelConfig,
  EducationLevel,
  GameSession,
  ProctorReport,
  StageLevels,
  StudentAccount,
  UserRole,
} from "@/types/student";
import { DEFAULT_STAGE_LEVELS, INITIAL_STUDENTS } from "@/lib/students";

interface DatabaseSchema {
  students: StudentAccount[];
  activeSessions: Record<string, ActiveSessionInfo>;
  customLevels: Record<string, CustomLevelConfig>;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "eduplay-db.json");

const ADMIN_USERNAME = "admin";
const ADMIN_SECRET = "admin123";

let writeQueue: Promise<void> = Promise.resolve();

function normalizeStudents(list: StudentAccount[]): StudentAccount[] {
  return list.map((s) => ({
    ...s,
    stageLevels: s.stageLevels
      ? { ...DEFAULT_STAGE_LEVELS, ...s.stageLevels }
      : { ...DEFAULT_STAGE_LEVELS },
  }));
}

async function ensureDbFile(): Promise<DatabaseSchema> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    return {
      students:
        Array.isArray(parsed.students) && parsed.students.length > 0
          ? normalizeStudents(parsed.students)
          : normalizeStudents(INITIAL_STUDENTS),
      activeSessions:
        parsed.activeSessions && typeof parsed.activeSessions === "object"
          ? parsed.activeSessions
          : {},
      customLevels:
        parsed.customLevels && typeof parsed.customLevels === "object"
          ? parsed.customLevels
          : {},
    };
  } catch {
    const initial: DatabaseSchema = {
      students: normalizeStudents(INITIAL_STUDENTS),
      activeSessions: {},
      customLevels: {},
    };
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

async function mutateDb<T>(
  mutator: (db: DatabaseSchema) => Promise<T> | T
): Promise<T> {
  let result!: T;
  writeQueue = writeQueue.then(async () => {
    const db = await ensureDbFile();
    result = await mutator(db);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  });
  await writeQueue;
  return result;
}

export async function readDb(): Promise<DatabaseSchema> {
  await writeQueue;
  return ensureDbFile();
}

export async function loginWithSingleDevice(params: {
  role: UserRole;
  username: string;
  secret: string;
  deviceId: string;
  deviceLabel: string;
}): Promise<
  | { ok: true; session: ActiveSessionInfo; student?: StudentAccount }
  | { ok: false; error: string }
> {
  const cleanUser = params.username.trim().toLowerCase();
  const cleanSecret = params.secret.trim();

  return mutateDb((db) => {
    if (params.role === "admin") {
      if (cleanUser !== ADMIN_USERNAME || cleanSecret !== ADMIN_SECRET) {
        return {
          ok: false as const,
          error: "Username atau password Admin salah (demo: admin / admin123).",
        };
      }

      const accountKey = `admin:${ADMIN_USERNAME}`;
      const session: ActiveSessionInfo = {
        sessionId: crypto.randomUUID(),
        accountKey,
        role: "admin",
        accountId: "admin-1",
        username: ADMIN_USERNAME,
        displayName: "Administrator / Guru",
        deviceId: params.deviceId,
        deviceLabel: params.deviceLabel || "Perangkat Web",
        loggedInAt: new Date().toISOString(),
      };
      db.activeSessions[accountKey] = session;
      return { ok: true as const, session };
    }

    const student = db.students.find(
      (s) => s.username.toLowerCase() === cleanUser
    );
    if (!student || student.pin !== cleanSecret) {
      return {
        ok: false as const,
        error: "Username anak atau PIN 4 digit tidak cocok.",
      };
    }

    const accountKey = `student:${student.id}`;
    student.lastActive = "Sedang online";
    const session: ActiveSessionInfo = {
      sessionId: crypto.randomUUID(),
      accountKey,
      role: "student",
      accountId: student.id,
      username: student.username,
      displayName: student.name,
      deviceId: params.deviceId,
      deviceLabel: params.deviceLabel || "Perangkat Web",
      loggedInAt: new Date().toISOString(),
    };
    db.activeSessions[accountKey] = session;
    return { ok: true as const, session, student };
  });
}

export async function validateSessionOnServer(params: {
  sessionId: string;
  accountKey: string;
  deviceId: string;
}): Promise<{
  valid: boolean;
  reason?: "REPLACED_BY_OTHER_DEVICE" | "LOGGED_OUT";
  replacedByDevice?: string;
  session?: ActiveSessionInfo;
  student?: StudentAccount;
}> {
  const db = await readDb();
  const current = db.activeSessions[params.accountKey];

  if (!current) {
    return { valid: false, reason: "LOGGED_OUT" };
  }

  if (
    current.sessionId !== params.sessionId ||
    current.deviceId !== params.deviceId
  ) {
    return {
      valid: false,
      reason: "REPLACED_BY_OTHER_DEVICE",
      replacedByDevice: current.deviceLabel,
    };
  }

  if (current.role === "student") {
    const student = db.students.find((s) => s.id === current.accountId);
    if (!student) {
      return { valid: false, reason: "LOGGED_OUT" };
    }
    return { valid: true, session: current, student };
  }

  return { valid: true, session: current };
}

export async function logoutOnServer(params: {
  sessionId: string;
  accountKey: string;
}) {
  return mutateDb((db) => {
    const current = db.activeSessions[params.accountKey];
    if (current && current.sessionId === params.sessionId) {
      delete db.activeSessions[params.accountKey];
      if (current.role === "student") {
        const student = db.students.find((s) => s.id === current.accountId);
        if (student) {
          student.lastActive = "Baru saja keluar";
        }
      }
    }
    return { ok: true };
  });
}

export async function createStudentInDb(
  student: StudentAccount
): Promise<{ ok: true; student: StudentAccount } | { ok: false; error: string }> {
  return mutateDb((db) => {
    const exists = db.students.some(
      (s) => s.username.toLowerCase() === student.username.toLowerCase()
    );
    if (exists) {
      return { ok: false as const, error: "Username sudah terdaftar." };
    }
    db.students.unshift(student);
    return { ok: true as const, student };
  });
}

export async function updateStudentInDb(
  studentId: string,
  payload:
    | {
        action: "patch";
        level?: EducationLevel;
        notes?: string;
        stageLevels?: Partial<StageLevels>;
      }
    | {
        action: "record_game";
        gameName: string;
        category: GameSession["category"];
        score: number;
        stars: 1 | 2 | 3;
        xpGain: number;
        minutesGain: number;
        proctor?: ProctorReport;
        advanceLetterStep?: number;
      }
): Promise<StudentAccount | null> {
  return mutateDb((db) => {
    const target = db.students.find((s) => s.id === studentId);
    if (!target) return null;

    if (!target.stageLevels) {
      target.stageLevels = { ...DEFAULT_STAGE_LEVELS };
    }

    if (payload.action === "patch") {
      if (payload.level) target.level = payload.level;
      if (typeof payload.notes === "string") target.notes = payload.notes;
      if (payload.stageLevels) {
        target.stageLevels = {
          ...target.stageLevels,
          ...payload.stageLevels,
        };
      }
      return target;
    }

    const skillKeyMap = {
      Membaca: "membaca",
      Menulis: "menulis",
      Berhitung: "berhitung",
      Logika: "logikaGame",
    } as const;
    const skillKey = skillKeyMap[payload.category];
    target.skills[skillKey] = Math.min(100, target.skills[skillKey] + 4);
    target.xp += payload.xpGain;
    target.todayMinutes += payload.minutesGain;
    target.lastActive = "Baru saja";

    if (
      typeof payload.advanceLetterStep === "number" &&
      payload.advanceLetterStep > target.stageLevels.letterStep
    ) {
      target.stageLevels.letterStep = Math.min(25, payload.advanceLetterStep);
    }

    const lastDay = target.weeklyActivity[target.weeklyActivity.length - 1];
    if (lastDay) {
      lastDay.minutes += payload.minutesGain;
      lastDay.xp += payload.xpGain;
    }

    target.recentGames = [
      {
        id: `g-${Date.now()}`,
        gameName: payload.gameName,
        category: payload.category,
        score: payload.score,
        stars: payload.stars,
        playedAt: "Baru saja",
        proctor: payload.proctor,
      },
      ...target.recentGames,
    ].slice(0, 8);

    return target;
  });
}

export async function deleteStudentInDb(studentId: string): Promise<boolean> {
  return mutateDb((db) => {
    const before = db.students.length;
    db.students = db.students.filter((s) => s.id !== studentId);
    delete db.activeSessions[`student:${studentId}`];
    return db.students.length < before;
  });
}

export async function resetDemoDb(): Promise<StudentAccount[]> {
  return mutateDb((db) => {
    db.students = structuredClone(INITIAL_STUDENTS);
    // Keep admin session if currently logged in, clear student sessions
    for (const key of Object.keys(db.activeSessions)) {
      if (key.startsWith("student:")) {
        delete db.activeSessions[key];
      }
    }
    return db.students;
  });
}

export async function getCustomLevels(): Promise<
  Record<string, CustomLevelConfig>
> {
  const db = await readDb();
  return db.customLevels ?? {};
}

export async function saveCustomLevelConfig(
  config: CustomLevelConfig
): Promise<CustomLevelConfig> {
  return mutateDb((db) => {
    if (!db.customLevels) {
      db.customLevels = {};
    }
    const updated: CustomLevelConfig = {
      ...config,
      key: `${config.category}:${config.levelNumber}`,
      updatedAt: new Date().toISOString(),
    };
    db.customLevels[updated.key] = updated;
    return updated;
  });
}

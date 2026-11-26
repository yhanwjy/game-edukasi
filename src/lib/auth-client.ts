"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { ActiveSessionInfo, StudentAccount } from "@/types/student";

const SESSION_CACHE_KEY = "eduplay_cached_session_v1";
const DEVICE_ID_KEY = "eduplay_device_id_v1";
const KICK_NOTICE_KEY = "eduplay_kick_notice_v1";
const CHANNEL_NAME = "eduplay_auth_sync";

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedSession: ActiveSessionInfo | null = null;

function notifyListeners() {
  listeners.forEach((cb) => cb());
}

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "ssr-device";
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getDeviceLabel(): string {
  if (typeof navigator === "undefined") return "Perangkat Web";
  const ua = navigator.userAgent;
  let browser = "Browser";
  if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";

  let os = "Desktop";
  if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";

  return `${browser} · ${os}`;
}

export function readCachedSession(): ActiveSessionInfo | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_CACHE_KEY);
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  if (!raw) {
    cachedSession = null;
    return null;
  }
  try {
    cachedSession = JSON.parse(raw) as ActiveSessionInfo;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

export function saveCachedSession(session: ActiveSessionInfo) {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(session);
  cachedRaw = serialized;
  cachedSession = session;
  window.localStorage.setItem(SESSION_CACHE_KEY, serialized);
  window.sessionStorage.removeItem(KICK_NOTICE_KEY);
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.postMessage({ type: "SESSION_UPDATED" });
    ch.close();
  } catch {
    // BroadcastChannel unavailable in older environments
  }
  notifyListeners();
}

export function clearCachedSession(kickNotice?: string) {
  if (typeof window === "undefined") return;
  cachedRaw = null;
  cachedSession = null;
  window.localStorage.removeItem(SESSION_CACHE_KEY);
  if (kickNotice) {
    window.sessionStorage.setItem(KICK_NOTICE_KEY, kickNotice);
  }
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.postMessage({ type: "SESSION_CLEARED" });
    ch.close();
  } catch {
    // Ignore
  }
  notifyListeners();
}

export function consumeKickNotice(): string | null {
  if (typeof window === "undefined") return null;
  const msg = window.sessionStorage.getItem(KICK_NOTICE_KEY);
  if (msg) {
    window.sessionStorage.removeItem(KICK_NOTICE_KEY);
  }
  return msg;
}

function subscribeSession(callback: () => void) {
  listeners.add(callback);

  const onStorage = (e: StorageEvent) => {
    if (e.key === SESSION_CACHE_KEY) {
      cachedRaw = undefined;
      callback();
    }
  };

  let ch: BroadcastChannel | null = null;
  try {
    ch = new BroadcastChannel(CHANNEL_NAME);
    ch.onmessage = () => {
      cachedRaw = undefined;
      callback();
    };
  } catch {
    // Ignore
  }

  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
    ch?.close();
  };
}

export function useAuthSession() {
  const session = useSyncExternalStore(
    subscribeSession,
    readCachedSession,
    () => null
  );
  const [verifiedStudent, setVerifiedStudent] = useState<StudentAccount | null>(
    null
  );
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function verifyNow() {
      const current = readCachedSession();
      if (!current) {
        if (active) {
          setVerifiedStudent(null);
          setChecking(false);
        }
        return;
      }

      try {
        const deviceId = getOrCreateDeviceId();
        const url = `/api/auth/session?sessionId=${encodeURIComponent(
          current.sessionId
        )}&accountKey=${encodeURIComponent(
          current.accountKey
        )}&deviceId=${encodeURIComponent(deviceId)}`;

        const res = await fetch(url, { cache: "no-store" });
        const data = (await res.json()) as {
          valid: boolean;
          reason?: "REPLACED_BY_OTHER_DEVICE" | "LOGGED_OUT";
          replacedByDevice?: string;
          student?: StudentAccount;
        };

        if (!active) return;

        if (!data.valid) {
          const msg =
            data.reason === "REPLACED_BY_OTHER_DEVICE"
              ? `Akun "${current.displayName}" otomatis logout karena baru saja login di perangkat lain (${data.replacedByDevice ?? "perangkat baru"}).`
              : "Sesi login Anda telah berakhir. Silakan login kembali.";
          clearCachedSession(msg);
          setVerifiedStudent(null);
          setChecking(false);
          return;
        }

        if (data.student) {
          setVerifiedStudent(data.student);
        }
        setChecking(false);
      } catch {
        if (active) setChecking(false);
      }
    }

    verifyNow();
    const interval = window.setInterval(verifyNow, 3000);
    window.addEventListener("focus", verifyNow);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", verifyNow);
    };
  }, [session?.sessionId]);

  async function logout() {
    const current = readCachedSession();
    clearCachedSession();
    setVerifiedStudent(null);
    if (current) {
      try {
        await fetch("/api/auth/session", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: current.sessionId,
            accountKey: current.accountKey,
          }),
        });
      } catch {
        // Ignore network errors during logout
      }
    }
  }

  return {
    session,
    student: verifiedStudent,
    setStudent: setVerifiedStudent,
    checking,
    logout,
  };
}

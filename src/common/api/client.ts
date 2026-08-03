import { API_BASE_URL } from "@/common/const.js";

const USER_ID_KEY = "datonix_user_id";
const ACCESS_TOKEN_KEY = "datonix_access_token";
const TOKEN_EXPIRES_AT_KEY = "datonix_token_expires_at";

function storageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal != null) return fromLocal;
    const fromSession = sessionStorage.getItem(key);
    if (fromSession != null) {
      localStorage.setItem(key, fromSession);
      sessionStorage.removeItem(key);
      return fromSession;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function storageSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function storageRemove(key: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function getStoredUserId(): string {
  return storageGet(USER_ID_KEY) || "1";
}

export function setStoredUserId(id: string) {
  storageSet(USER_ID_KEY, id);
}

export function clearStoredUserId() {
  storageRemove(USER_ID_KEY);
}

export function getStoredAccessToken(): string | null {
  const token = storageGet(ACCESS_TOKEN_KEY);
  if (!token) return null;
  // Synthetic Vite-only sessions must not be sent to the real API.
  if (token.startsWith("__vite_")) return null;
  return token;
}

export function setStoredAccessToken(token: string, expiresInSeconds?: number) {
  storageSet(ACCESS_TOKEN_KEY, token);
  if (expiresInSeconds != null && Number.isFinite(expiresInSeconds)) {
    storageSet(TOKEN_EXPIRES_AT_KEY, String(Date.now() + expiresInSeconds * 1000));
  } else {
    storageRemove(TOKEN_EXPIRES_AT_KEY);
  }
}

export function clearStoredAccessToken() {
  storageRemove(ACCESS_TOKEN_KEY);
  storageRemove(TOKEN_EXPIRES_AT_KEY);
}

export function getTokenExpiresAt(): number | null {
  const raw = storageGet(TOKEN_EXPIRES_AT_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export type ApiInit = RequestInit & {
  userId?: string | null;
  skipUserHeader?: boolean;
};

/**
 * Low-level fetch against API_BASE_URL. Sends X-User-id by default (matches backend curl examples).
 */
export async function apiFetch(path: string, init: ApiInit = {}): Promise<Response> {
  const { userId, skipUserHeader, headers: hdrs, ...rest } = init;
  const url = path.startsWith("http")
    ? path
    : `${API_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(hdrs);
  if (!skipUserHeader) {
    const uid = userId ?? getStoredUserId();
    if (uid) {
      headers.set("X-User-id", uid);
      headers.set("X-user-id", uid);
    }
    const token = getStoredAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return fetch(url, { ...rest, headers });
}

export async function apiJson<T = unknown>(path: string, init: ApiInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const j = JSON.parse(text) as Record<string, unknown>;
      if (typeof j === "object" && j !== null) {
        if ("detail" in j && j.detail != null) detail = String(j.detail);
        else if ("message" in j && j.message != null) detail = String(j.message);
        else if ("error" in j && j.error != null) {
          const err = j.error;
          if (typeof err === "object" && err && "message" in err && (err as { message: unknown }).message != null) {
            detail = String((err as { message: unknown }).message);
          } else {
            detail = String(err);
          }
        }
      }
    } catch {
      /* keep text */
    }
    throw new Error(detail || `HTTP ${res.status}`);
  }
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

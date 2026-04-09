import { API_BASE_URL } from "@/const.js";

const USER_ID_KEY = "datonix_user_id";
const ACCESS_TOKEN_KEY = "datonix_access_token";

export function getStoredUserId(): string {
  if (typeof sessionStorage === "undefined") return "1";
  return sessionStorage.getItem(USER_ID_KEY) || "1";
}

export function setStoredUserId(id: string) {
  sessionStorage.setItem(USER_ID_KEY, id);
}

export function clearStoredUserId() {
  sessionStorage.removeItem(USER_ID_KEY);
}

export function getStoredAccessToken(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
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
  const url = path.startsWith("http") ? path : `${API_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
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
        else if ("error" in j && j.error != null) detail = String(j.error);
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

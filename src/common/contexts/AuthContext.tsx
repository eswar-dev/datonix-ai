import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  clearStoredUserId,
  setStoredUserId,
  clearStoredAccessToken,
  setStoredAccessToken,
} from "@/common/api/client";
import { authLogin, authLogout, type LoginResponse } from "@/common/api";
import type { AuthUser } from "@/common/types/auth";
import type { RoleKey } from "@/common/data/roleData";

const STORAGE_USER = "datonix_user";

function readUserStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER) ?? sessionStorage.getItem(STORAGE_USER);
    if (!raw) return null;
    if (sessionStorage.getItem(STORAGE_USER) && !localStorage.getItem(STORAGE_USER)) {
      localStorage.setItem(STORAGE_USER, raw);
      sessionStorage.removeItem(STORAGE_USER);
    }
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeUserStorage(user: AuthUser) {
  localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  sessionStorage.removeItem(STORAGE_USER);
}

function clearUserStorage() {
  localStorage.removeItem(STORAGE_USER);
  sessionStorage.removeItem(STORAGE_USER);
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function roleToLabel(r: unknown): string {
  if (Array.isArray(r) && r.length) return String(r[0]);
  if (typeof r === "string" && r) return r;
  return "User";
}

export function authUserFromLogin(payload: LoginResponse, fallbackRoleKey?: RoleKey): AuthUser {
  const u = payload.user;
  const roleLabel = roleToLabel(u.role);
  const org = (u.organization ?? null) as Record<string, unknown> | null;
  const ten = (u.tenant ?? null) as Record<string, unknown> | null;
  const orgName =
    (org?.organization_name != null && String(org.organization_name)) ||
    (org?.name != null && String(org.name)) ||
    "";
  const tenantName =
    (ten?.tenant_name != null && String(ten.tenant_name)) ||
    (ten?.name != null && String(ten.name)) ||
    "";
  const display = u.username || u.email.split("@")[0];
  const initials = display
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
  const isManager = /admin|manager|super/i.test(roleLabel) || u.role == null;
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    name: display,
    initials,
    title: u.role == null ? "Administrator" : roleLabel,
    industry: orgName || tenantName || "—",
    roleLabel: u.role == null ? "Administrator" : roleLabel,
    apiUserId: String(u.id),
    roleKey: fallbackRoleKey ?? "mfg_plant_manager",
    isManager,
    tenant: ten,
    organization: org,
  };
}

function persistSession(user: AuthUser, accessToken: string, expiresIn?: number) {
  setStoredAccessToken(accessToken, expiresIn);
  setUserSession(user);
}

function setUserSession(user: AuthUser) {
  setStoredUserId(user.apiUserId);
  writeUserStorage(user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = readUserStorage();
    if (!saved) return null;
    const rawToken = (() => {
      try {
        return localStorage.getItem("datonix_access_token") ?? sessionStorage.getItem("datonix_access_token");
      } catch {
        return null;
      }
    })();
    if (!rawToken) {
      clearUserStorage();
      clearStoredUserId();
      clearStoredAccessToken();
      return null;
    }
    return saved;
  });

  useEffect(() => {
    if (user) {
      setStoredUserId(user.apiUserId);
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await authLogin(email.trim(), password);
      if (res.status !== "success" || !res.user || !res.accessToken) {
        return "Invalid email or password for this portal.";
      }
      const next = authUserFromLogin(res);
      setUser(next);
      persistSession(next, res.accessToken, res.expiresIn);
      return null;
    } catch {
      return "Login failed. Check your credentials and try again.";
    }
  }, []);

  const logout = useCallback(() => {
    void authLogout().finally(() => {
      setUser(null);
      clearUserStorage();
      clearStoredUserId();
      clearStoredAccessToken();
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

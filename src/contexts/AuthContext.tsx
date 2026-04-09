import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  clearStoredUserId,
  setStoredUserId,
  clearStoredAccessToken,
  setStoredAccessToken,
} from "@/api/client";
import { LOGIN_QUICK_ACCOUNTS } from "@/const.js";
import { authLogin, type LoginResponse } from "@/api";
import type { AuthUser } from "@/types/auth";
import type { RoleKey } from "@/data/roleData";

const STORAGE_USER = "datonix_user";

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

function guessRoleKey(_label: string): RoleKey {
  return "aec_principal";
}

type QuickAccount = {
  email: string;
  password: string;
  localBypass?: boolean;
  mockUser?: { id: number; username: string; role?: string | string[] };
};

function matchLocalQuickAccount(email: string, password: string): QuickAccount | null {
  const e = email.trim().toLowerCase();
  for (const raw of LOGIN_QUICK_ACCOUNTS as QuickAccount[]) {
    if (!raw.localBypass) continue;
    if (String(raw.email).trim().toLowerCase() !== e) continue;
    if (raw.password !== password) continue;
    return raw;
  }
  return null;
}

export function authUserFromLogin(payload: LoginResponse): AuthUser {
  const u = payload.user;
  const roleLabel = roleToLabel(u.role);
  const org = u.organization as { organization_name?: string } | undefined;
  const ten = u.tenant as { tenant_name?: string } | undefined;
  const display = u.username || u.email.split("@")[0];
  const initials = display
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    name: display,
    initials,
    title: roleLabel,
    industry: ten?.tenant_name ?? org?.organization_name ?? "—",
    roleLabel,
    apiUserId: String(u.id),
    roleKey: guessRoleKey(roleLabel),
    isManager: false,
    tenant: (u.tenant as Record<string, unknown>) ?? null,
    organization: (u.organization as Record<string, unknown>) ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = sessionStorage.getItem(STORAGE_USER);
    if (saved) {
      try {
        return JSON.parse(saved) as AuthUser;
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      setStoredUserId(user.apiUserId);
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const quick = matchLocalQuickAccount(email, password);
      if (import.meta.env.DEV && quick) {
        const m = quick.mockUser ?? { id: 0, username: "local", role: "User" };
        const synthetic: LoginResponse = {
          status: "success",
          user: {
            id: m.id,
            username: m.username,
            email: quick.email.trim(),
            role: m.role ?? null,
            tenant: null,
            organization: null,
          },
          accessToken: "__vite_local_session__",
        };
        const next = authUserFromLogin(synthetic);
        setStoredAccessToken(synthetic.accessToken);
        setUser(next);
        sessionStorage.setItem(STORAGE_USER, JSON.stringify(next));
        return null;
      }

      const res = await authLogin(email.trim(), password);
      if (res.status !== "success" || !res.user || !res.accessToken) {
        return "Login failed";
      }
      const next = authUserFromLogin(res);
      setStoredAccessToken(res.accessToken);
      setUser(next);
      sessionStorage.setItem(STORAGE_USER, JSON.stringify(next));
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Login failed";
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_USER);
    clearStoredUserId();
    clearStoredAccessToken();
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

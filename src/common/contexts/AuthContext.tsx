import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  clearStoredUserId,
  setStoredUserId,
  clearStoredAccessToken,
  setStoredAccessToken,
} from "@/common/api/client";
import { LOGIN_QUICK_ACCOUNTS } from "@/common/const.js";
import { authLogin, type LoginResponse } from "@/common/api";
import type { AuthUser } from "@/common/types/auth";
import { userAccounts, type RoleKey, type UserAccount } from "@/common/data/roleData";
import { getDomainFromHost } from "@/config/domain";
import type { DomainId } from "@/domains/types";

const STORAGE_USER = "datonix_user";

const DOMAIN_INDUSTRY: Record<DomainId, string> = {
  manufacturing: "Manufacturing",
  retail: "Retail",
  aec: "AEC",
};

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

function matchDomainDemoAccount(
  email: string,
  password: string,
  domainId: DomainId,
): UserAccount | null {
  const e = email.trim().toLowerCase();
  const expectedIndustry = DOMAIN_INDUSTRY[domainId];
  return (
    userAccounts.find(
      (account) =>
        account.email.toLowerCase() === e &&
        account.password === password &&
        account.industry === expectedIndustry,
    ) ?? null
  );
}

function authUserFromDemoAccount(account: UserAccount): AuthUser {
  return {
    id: 1,
    email: account.email,
    username: account.email.split("@")[0],
    name: account.name,
    initials: account.initials,
    title: account.title,
    industry: account.industry,
    roleLabel: account.title,
    apiUserId: account.apiUserId ?? "1",
    roleKey: account.role,
    isManager: account.isManager ?? false,
    tenant: null,
    organization: null,
  };
}

export function authUserFromLogin(payload: LoginResponse, fallbackRoleKey?: RoleKey): AuthUser {
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
    roleKey: fallbackRoleKey ?? "mfg_plant_manager",
    isManager: false,
    tenant: (u.tenant as Record<string, unknown>) ?? null,
    organization: (u.organization as Record<string, unknown>) ?? null,
  };
}

function persistSession(user: AuthUser, accessToken: string) {
  setStoredAccessToken(accessToken);
  setUserSession(user);
}

function setUserSession(user: AuthUser) {
  setStoredUserId(user.apiUserId);
  sessionStorage.setItem(STORAGE_USER, JSON.stringify(user));
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
    const domainId = getDomainFromHost();

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
        setUser(next);
        persistSession(next, synthetic.accessToken);
        return null;
      }

      const demoAccount = matchDomainDemoAccount(email, password, domainId);
      if (import.meta.env.DEV && demoAccount) {
        const next = authUserFromDemoAccount(demoAccount);
        setUser(next);
        persistSession(next, "__vite_demo_session__");
        return null;
      }

      const res = await authLogin(email.trim(), password);
      if (res.status !== "success" || !res.user || !res.accessToken) {
        return "Invalid email or password for this portal.";
      }
      const next = authUserFromLogin(res);
      setUser(next);
      persistSession(next, res.accessToken);
      return null;
    } catch {
      if (import.meta.env.DEV) {
        const demoAccount = matchDomainDemoAccount(email, password, domainId);
        if (demoAccount) {
          const next = authUserFromDemoAccount(demoAccount);
          setUser(next);
          persistSession(next, "__vite_demo_session__");
          return null;
        }
      }
      return "Login failed. Use an account for this portal.";
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

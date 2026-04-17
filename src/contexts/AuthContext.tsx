import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { userAccounts, type UserAccount } from "@/data/roleData";

interface AuthContextType {
  user: UserAccount | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "datapx1_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const login = useCallback((email: string, password: string): string | null => {
    const found = userAccounts.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return "Invalid email or password";
    setUser(found);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    return null;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
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

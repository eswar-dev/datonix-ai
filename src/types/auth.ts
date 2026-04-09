import type { RoleKey } from "@/data/roleData";

/** Logged-in user from `/auth/login` + session restore */
export interface AuthUser {
  id: number;
  email: string;
  username: string;
  /** Display name */
  name: string;
  /** Two-letter avatar */
  initials: string;
  title: string;
  industry: string;
  /** Primary role string for API query params (e.g. dashboard `role=`) */
  roleLabel: string;
  apiUserId: string;
  /** Used only by legacy `roleData` pages (Bot, Reports) until those are API-driven */
  roleKey: RoleKey;
  isManager: boolean;
  tenant: Record<string, unknown> | null;
  organization: Record<string, unknown> | null;
}

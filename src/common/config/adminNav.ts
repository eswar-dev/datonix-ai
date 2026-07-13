import { Building2, Clock, ShieldCheck, Users } from "lucide-react";
import type { DomainNavItem } from "@/domains/types";

export const adminNavItems: DomainNavItem[] = [
  { title: "Tenants", path: "/admin/tenants", icon: Building2 },
  { title: "Organizations", path: "/admin/organizations", icon: Building2 },
  { title: "User Roles", path: "/admin/user-roles", icon: ShieldCheck },
  { title: "Users", path: "/admin/users", icon: Users },
  { title: "User Sessions", path: "/admin/user-sessions", icon: Clock },
];

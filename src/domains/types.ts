import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { DomainLoginConfig } from "@/domains/loginTypes";

export type DomainId = "manufacturing" | "retail" | "aec";

export interface DomainNavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
  group?: string;
}

export interface DomainRoute {
  path: string;
  Component: ComponentType;
}

export interface DomainConfig {
  id: DomainId;
  label: string;
  tagline: string;
  defaultRoute?: string;
  nav: DomainNavItem[];
  routes: DomainRoute[];
  login: DomainLoginConfig;
}

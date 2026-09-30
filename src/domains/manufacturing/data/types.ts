export type MfgSiteId = "birmingham" | "katowice" | "coventry";
export type MfgScopeId = MfgSiteId | "group";
export type MfgKpiStatus = "good" | "warning" | "critical";
export type MfgSeverity = "critical" | "warning" | "info";

export interface MfgKpi {
  l: string;
  v: string;
  s: MfgKpiStatus;
  t: string;
}

export interface MfgTrigger {
  id: string;
  domain: string;
  severity: MfgSeverity;
  title: string;
  category: string;
  site: MfgScopeId;
  roles: string[];
  rootCause: string;
  decision: string;
  recommendation: string;
  traditional: string;
  ai: string;
  roi: string;
}

export interface MfgRole {
  id: string;
  name: string;
  icon: string;
  intro: string;
}

export interface MfgOrgNode {
  name: string;
  role: string;
  site: string;
  children?: MfgOrgNode[];
}

export interface MfgSite {
  id: MfgSiteId;
  name: string;
  full: string;
  code: string;
  flag: string;
  status: string;
  coverage: number;
  currency: string;
  overview: {
    profile: string;
    caps: string[];
    stats: [string, string][];
  };
  workforce: { spark: number[]; shifts: [string, string, string][] };
  production: { steps: [string, string, string][] };
  machinery: [string, string, string][];
  systems: [string, string, string][];
  systemsPain: string;
  inventory: [string, string, string, string][];
  financials: { bars: [string, number][]; list: [string, string][] };
  supplychain: {
    tiers: [string, string][];
    suppliers: [string, string, string][];
  };
  maintenance: [string, string, string, string, string][];
  lifecycle: { steps: [string, string, string][]; grid: string[] };
}

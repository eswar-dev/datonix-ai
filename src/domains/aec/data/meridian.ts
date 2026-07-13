/** Static Meridian Group demo dataset — single source of truth for AEC */

export type TwinStatus = "Live" | "Inactive" | "Draft";
export type EntityStatus = "Active" | "At Risk" | "Pending";

export interface TwinEntity {
  id: string;
  code: string;
  name: string;
  staffCount: number;
  region: string;
  currency: string;
  status: EntityStatus;
}

export interface EnterpriseTwinSummary {
  id: string;
  name: string;
  status: TwinStatus;
  staffCount: number;
  projectCount: number;
  entities: TwinEntity[];
  prompt: string;
  generatedAt?: string;
  reportingCurrency: string;
  description: string;
}

export const DEFAULT_TWIN_PROMPT =
  "Meridian Group is a multi-entity AEC holding company with 3 subsidiaries: Meridian Architecture (40 staff, UK, GBP), Meridian Engineering (18 staff, UK, GBP), Meridian Construction (25 staff, UAE, AED). Resources can be shared across entities and classified as In-House Employees, Contractors, or Freelancers. Shared accounting parent uses GBP as reporting currency.";

export const meridianTwin: EnterpriseTwinSummary = {
  id: "meridian-group",
  name: "Meridian Group",
  status: "Live",
  staffCount: 83,
  projectCount: 87,
  reportingCurrency: "GBP",
  description: "Multi-entity AEC holding company across UK and UAE operations.",
  prompt: DEFAULT_TWIN_PROMPT,
  generatedAt: "2026-03-15T09:42:00Z",
  entities: [
    {
      id: "ma",
      code: "MA",
      name: "Meridian Architecture",
      staffCount: 40,
      region: "UK",
      currency: "GBP",
      status: "Active",
    },
    {
      id: "me",
      code: "ME",
      name: "Meridian Engineering",
      staffCount: 18,
      region: "UK",
      currency: "GBP",
      status: "Pending",
    },
    {
      id: "mc",
      code: "MC",
      name: "Meridian Construction",
      staffCount: 25,
      region: "UAE",
      currency: "AED",
      status: "At Risk",
    },
  ],
};

export const horizonTwin: EnterpriseTwinSummary = {
  id: "horizon-consultants",
  name: "Horizon Consultants",
  status: "Inactive",
  staffCount: 34,
  projectCount: 22,
  reportingCurrency: "GBP",
  description: "Boutique structural engineering consultancy — UK focused.",
  prompt:
    "Horizon Consultants is a UK structural engineering firm with 34 staff across London and Manchester. Single entity, GBP reporting, focused on commercial and residential projects.",
  generatedAt: "2026-01-08T14:20:00Z",
  entities: [
    {
      id: "hz",
      code: "HZ",
      name: "Horizon Consultants Ltd",
      staffCount: 34,
      region: "UK",
      currency: "GBP",
      status: "Active",
    },
  ],
};

export const twins = [meridianTwin, horizonTwin] as const;

export const meridianMetrics = {
  org: {
    hierarchyLevels: 5,
    businessUnits: 8,
    entities: 3,
  },
  resource: {
    avgUtilization: 73,
    benchCount: 6,
    overAllocated: 2,
    inHouse: 71,
    contractors: 8,
    freelancers: 4,
  },
  financial: {
    marginPct: 34,
    employeeCostGbp: 186_000,
    contractorCostGbp: 41_000,
    groupRevenueGbp: 2_410_000,
  },
  operational: {
    activeProjects: 87,
    crossEntityProjects: 4,
    unmetRoles: 3,
  },
};

export const orgHierarchyCounts = [
  { level: "CEO", count: 1 },
  { level: "Directors", count: 3 },
  { level: "Managers", count: 9 },
  { level: "Team Leads", count: 14 },
  { level: "Employees", count: 56 },
];

export const resourceTypeBreakdown = [
  { type: "In-House Employees", count: 71, utilization: 76 },
  { type: "Contractors", count: 8, utilization: 68 },
  { type: "Freelancers", count: 4, utilization: 62 },
];

export const resourceDepartments = [
  { name: "Architecture Design", staff: 40, entity: "MA" },
  { name: "Engineering", staff: 18, entity: "ME" },
  { name: "Construction Mgmt", staff: 25, entity: "MC" },
  { name: "Finance & Billing", staff: 0, entity: "Group-wide" },
];

export const skillCategories = [
  { entity: "Architecture (MA)", skills: ["Architect", "BIM Engineer", "Drafting Engineer", "Planner"] },
  { entity: "Engineering (ME)", skills: ["Mechanical Eng.", "Electrical Eng.", "Structural Eng."] },
  { entity: "Construction (MC)", skills: ["Site Manager", "QS", "Foreman"] },
];

export const governanceShared = [
  { label: "Shared Resources", value: "Enabled", ok: true },
  { label: "Shared Skill Matrix", value: "Enabled", ok: true },
  { label: "Shared Rate Card Engine", value: "Enabled", ok: true },
  { label: "Parent P&L Roll-up", value: "GBP", ok: true },
];

export const governanceItems = [
  {
    title: "Shared Resource Pool",
    description: "Cross-entity allocation governed by central resource board with monthly review.",
    status: "Active" as const,
  },
  {
    title: "Entity Autonomy",
    description: "Each subsidiary maintains local P&L with group consolidation at month-end.",
    status: "Active" as const,
  },
  {
    title: "Rate Card Governance",
    description: "Central rate card with entity-specific overrides requiring CFO approval.",
    status: "At Risk" as const,
  },
];

export const horizonMetrics = {
  org: {
    hierarchyLevels: 4,
    businessUnits: 3,
    entities: 1,
  },
  resource: {
    avgUtilization: 68,
    benchCount: 3,
    overAllocated: 1,
    inHouse: 30,
    contractors: 3,
    freelancers: 1,
  },
  financial: {
    marginPct: 28,
    employeeCostGbp: 72_000,
    contractorCostGbp: 18_000,
    groupRevenueGbp: 890_000,
  },
  operational: {
    activeProjects: 22,
    crossEntityProjects: 0,
    unmetRoles: 1,
  },
};

export function getMetricsForTwin(twinId: string) {
  return twinId === horizonTwin.id ? horizonMetrics : meridianMetrics;
}

export function buildEntityTree(twin: EnterpriseTwinSummary) {
  return {
    id: twin.id,
    name: twin.name,
    staffCount: twin.staffCount,
    status: twin.status === "Live" ? ("Active" as const) : ("Pending" as const),
    children: twin.entities.map((e) => ({
      id: e.id,
      code: e.code,
      name: e.name,
      staffCount: e.staffCount,
      status: e.status,
    })),
  };
}

export const complianceItems = [
  { region: "UK", requirement: "UK VAT 20%", status: "Live" as const },
  { region: "UAE", requirement: "UAE VAT 5%", status: "Live" as const },
  { region: "UAE", requirement: "UAE WPS Payroll", status: "Active" as const },
];

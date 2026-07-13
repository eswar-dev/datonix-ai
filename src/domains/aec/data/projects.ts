export type ProjectHealth = "Good" | "At Risk" | "Critical";
export type BillingType = "Lump Sum" | "Milestone" | "T&M";
export type ProjectEntity = "MA" | "ME" | "MC" | "MC+MA";

export interface ProjectDraft {
  name: string;
  client: string;
  entity: ProjectEntity;
  type: string;
  billingType: BillingType;
  currency: string;
  budget: number;
  startDate: string;
  endDate: string;
  projectManager?: string;
}

export interface StaffRecommendation {
  name: string;
  role: string;
  score: number;
  rationale: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  entity: ProjectEntity;
  type: string;
  billingType: BillingType;
  currency: string;
  budget: number;
  budgetDisplay: string;
  revenue: number;
  revenueDisplay: string;
  health: ProjectHealth;
  marginPct: number;
  progressPct: number;
  projectManager: string;
  costs: {
    employee: number;
    contractor: number;
    freelancer: number;
    other: number;
  };
}

export const defaultProjectDraft: ProjectDraft = {
  name: "",
  client: "",
  entity: "MA",
  type: "Commercial",
  billingType: "Milestone",
  currency: "GBP",
  budget: 0,
  startDate: "2026-04-01",
  endDate: "2027-10-31",
};

export const pmRecommendations: StaffRecommendation[] = [
  { name: "Priya Sharma", role: "Project Manager", score: 94, rationale: "Led Kings Cross Tower concept; 92% on-time delivery." },
  { name: "James Okafor", role: "Project Manager", score: 87, rationale: "Strong client relationship with Holborn Partners." },
];

export const architectRecommendations: StaffRecommendation[] = [
  { name: "Alex Chen", role: "Lead Architect", score: 91, rationale: "Commercial tower specialist; available from April." },
  { name: "Priya Sharma", role: "Senior Architect", score: 88, rationale: "Kings Cross portfolio; BIM delivery lead." },
  { name: "Layla Patel", role: "Design Engineer", score: 82, rationale: "Strong DD package delivery; advantageous rate for margin." },
];

/** Projects aligned with Claude artifact reference */
export const projects: Project[] = [
  {
    id: "prj-kings-cross",
    name: "Kings Cross Tower",
    client: "Holborn Partners",
    entity: "MA",
    type: "Commercial",
    billingType: "Lump Sum",
    currency: "GBP",
    budget: 310_000,
    budgetDisplay: "£310K",
    health: "Good",
    marginPct: 35,
    progressPct: 64,
    revenue: 480_000,
    revenueDisplay: "£480K",
    projectManager: "P. Sharma",
    costs: { employee: 198_000, contractor: 72_000, freelancer: 28_000, other: 42_000 },
  },
  {
    id: "prj-camden",
    name: "Camden Housing",
    client: "Meridian Homes",
    entity: "MA",
    type: "Residential",
    billingType: "Milestone",
    currency: "GBP",
    budget: 85_000,
    budgetDisplay: "£85K",
    health: "At Risk",
    marginPct: 24,
    progressPct: 38,
    revenue: 120_000,
    revenueDisplay: "£120K",
    projectManager: "J. Okafor",
    costs: { employee: 58_000, contractor: 24_000, freelancer: 8_000, other: 14_000 },
  },
  {
    id: "prj-dubai-marina",
    name: "Dubai Marina Dev.",
    client: "Dubai Dev. Authority",
    entity: "MC+MA",
    type: "Mixed Use",
    billingType: "T&M",
    currency: "AED",
    budget: 1_400_000,
    budgetDisplay: "AED 1.4M",
    health: "Good",
    marginPct: 29,
    progressPct: 22,
    revenue: 2_100_000,
    revenueDisplay: "AED 2.1M",
    projectManager: "Cross-entity",
    costs: { employee: 820_000, contractor: 490_000, freelancer: 110_000, other: 95_000 },
  },
  {
    id: "prj-holborn-retrofit",
    name: "Holborn Retrofit",
    client: "Holborn Partners",
    entity: "MA",
    type: "Commercial",
    billingType: "T&M",
    currency: "GBP",
    budget: 95_000,
    budgetDisplay: "£95K",
    health: "Good",
    marginPct: 31,
    progressPct: 20,
    revenue: 28_000,
    revenueDisplay: "£28K",
    projectManager: "A. Chen",
    costs: { employee: 14_000, contractor: 4_000, freelancer: 2_000, other: 3_000 },
  },
  {
    id: "prj-camden-phase2",
    name: "Camden Housing Phase 2",
    client: "City Council",
    entity: "ME",
    type: "Urban Planning",
    billingType: "Milestone",
    currency: "GBP",
    budget: 340_000,
    budgetDisplay: "£340K",
    health: "At Risk",
    marginPct: 18,
    progressPct: 12,
    revenue: 36_000,
    revenueDisplay: "£36K",
    projectManager: "J. Okafor",
    costs: { employee: 22_000, contractor: 8_000, freelancer: 0, other: 6_000 },
  },
  {
    id: "prj-kings-cross-extension",
    name: "Kings Cross Tower Extension",
    client: "Northbridge Estates",
    entity: "MA",
    type: "Commercial",
    billingType: "Lump Sum",
    currency: "GBP",
    budget: 480_000,
    budgetDisplay: "£480K",
    health: "Good",
    marginPct: 33,
    progressPct: 8,
    revenue: 18_500,
    revenueDisplay: "£18.5K",
    projectManager: "P. Sharma",
    costs: { employee: 8_000, contractor: 4_000, freelancer: 1_000, other: 2_000 },
  },
  {
    id: "prj-northgate-hub",
    name: "Riverside Logistics Hub",
    client: "Northgate Developments",
    entity: "ME",
    type: "Industrial",
    billingType: "Milestone",
    currency: "GBP",
    budget: 95_000,
    budgetDisplay: "£95K",
    health: "Good",
    marginPct: 28,
    progressPct: 5,
    revenue: 0,
    revenueDisplay: "£0",
    projectManager: "M. Klein",
    costs: { employee: 2_000, contractor: 1_000, freelancer: 0, other: 500 },
  },
  {
    id: "prj-harbour-health",
    name: "St. Mary's Wing Refurbishment",
    client: "Harbour Health Trust",
    entity: "ME",
    type: "Healthcare",
    billingType: "Milestone",
    currency: "GBP",
    budget: 310_000,
    budgetDisplay: "£310K",
    health: "Good",
    marginPct: 26,
    progressPct: 0,
    revenue: 0,
    revenueDisplay: "£0",
    projectManager: "E. Walsh",
    costs: { employee: 0, contractor: 0, freelancer: 0, other: 0 },
  },
  {
    id: "prj-abu-dhabi-civic",
    name: "Abu Dhabi Civic Centre",
    client: "Al Noor Holdings",
    entity: "MC",
    type: "Civic",
    billingType: "Lump Sum",
    currency: "AED",
    budget: 4_750_000,
    budgetDisplay: "AED 4.75M",
    health: "Good",
    marginPct: 27,
    progressPct: 0,
    revenue: 0,
    revenueDisplay: "AED 0",
    projectManager: "O. Hassan",
    costs: { employee: 0, contractor: 0, freelancer: 0, other: 0 },
  },
];

export const profitabilityStatement = (project: Project) => {
  const totalCosts = Object.values(project.costs).reduce((a, b) => a + b, 0);
  const grossProfit = project.revenue - totalCosts;
  return [
    { line: "Revenue (billed to date)", amount: project.revenue, type: "revenue" as const },
    { line: "Employee costs", amount: -project.costs.employee, type: "cost" as const },
    { line: "Contractor costs", amount: -project.costs.contractor, type: "cost" as const },
    { line: "Freelancer costs", amount: -project.costs.freelancer, type: "cost" as const },
    { line: "Other direct costs", amount: -project.costs.other, type: "cost" as const },
    { line: "Gross profit", amount: grossProfit, type: "total" as const },
    { line: "Gross margin", amount: project.marginPct, type: "margin" as const },
  ];
};

export const costLogicRows: {
  resource: string;
  rate: string;
  hours?: number;
  days?: number;
  total: string;
  logic: string;
}[] = [
  { resource: "In-house architect (Senior)", rate: "£85/hr", hours: 1240, total: "£105,400", logic: "Rate card v3.2 — MA entity" },
  { resource: "In-house engineer (Mid)", rate: "£72/hr", hours: 980, total: "£70,560", logic: "Rate card v3.2 — MA entity" },
  { resource: "Contractor — Structural", rate: "£650/day", days: 42, total: "£27,300", logic: "Framework agreement — Klein & Partners" },
  { resource: "Contractor — MEP", rate: "£580/day", days: 68, total: "£39,440", logic: "Project-specific SOW" },
  { resource: "Freelancer — BIM", rate: "£55/hr", hours: 510, total: "£28,050", logic: "Ad-hoc — no framework" },
];

export const employeeVsContractorLogic = [
  { scenario: "Core design team", recommendation: "In-house", saving: "12% vs contractor", reason: "Utilization headroom in MA studio" },
  { scenario: "Structural peer review", recommendation: "Contractor", saving: "8% vs in-house", reason: "Specialist surge — 6-week window" },
  { scenario: "BIM coordination", recommendation: "Freelancer", saving: "Neutral", reason: "Short burst — avoids bench cost" },
  { scenario: "Site supervision (UAE)", recommendation: "Contractor", saving: "15% vs in-house", reason: "Local presence requirement — MC entity" },
];

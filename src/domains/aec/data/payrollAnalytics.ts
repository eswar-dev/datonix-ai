export interface PayrollDashboardSummary {
  periodLabel: string;
  totalPayrollGbp: number;
  totalPayrollDisplay: string;
  vsPriorPct: number;
  payrollPctOfRevenue: number;
  targetPctOfRevenue: number;
  avgCostPerResourceGbp: number;
  resourceCount: number;
  anomalyCount: number;
}

export interface PayrollCostBreakdown {
  salariesGbp: number;
  oncostGbp: number;
  contractorGbp: number;
  freelancerGbp: number;
  totalGbp: number;
}

export interface PayrollByEntityRow {
  entity: string;
  entityCode: string;
  amountGbp: number;
  pctOfTotal: number;
}

export interface PayrollByDepartmentRow {
  department: string;
  headcount: number;
  amountGbp: number;
  pctOfTotal: number;
  trendPct: number | null;
}

export interface PayrollByProjectRow {
  project: string;
  entity: string;
  amountDisplay: string;
  amountGbp: number;
  pctOfProjectCost: number;
}

export interface PayrollKpis {
  payrollRevenueRatioPct: number;
  recoveryRatePct: number;
  costPerBillableHourGbp: number;
  overtimePct: number;
  forecastNextGbp: number;
}

export interface PayrollTrendPoint {
  month: string;
  amountGbp: number;
}

export interface PayrollResourceCostRow {
  resourceId: string;
  name: string;
  employmentType: "IN-HOUSE" | "CONTRACTOR" | "FREELANCER";
  entity: string;
  location: string;
  skill: string;
  monthlyCostDisplay: string;
  monthlyCostGbp: number;
  costPerHourDisplay: string;
  projects: number;
}

export const payrollDashboardSummary: PayrollDashboardSummary = {
  periodLabel: "Jun 2026",
  totalPayrollGbp: 227_000,
  totalPayrollDisplay: "£227K",
  vsPriorPct: 4.2,
  payrollPctOfRevenue: 41,
  targetPctOfRevenue: 45,
  avgCostPerResourceGbp: 2735,
  resourceCount: 83,
  anomalyCount: 3,
};

export const payrollCostBreakdown: PayrollCostBreakdown = {
  salariesGbp: 159_200,
  oncostGbp: 27_100,
  contractorGbp: 26_900,
  freelancerGbp: 13_800,
  totalGbp: 227_000,
};

export const payrollByEntity: PayrollByEntityRow[] = [
  { entity: "Meridian Architecture", entityCode: "MA", amountGbp: 128_000, pctOfTotal: 56 },
  { entity: "Meridian Construction", entityCode: "MC", amountGbp: 58_000, pctOfTotal: 26 },
  { entity: "Meridian Engineering", entityCode: "ME", amountGbp: 41_000, pctOfTotal: 18 },
];

export const payrollByDepartment: PayrollByDepartmentRow[] = [
  { department: "Architecture", headcount: 34, amountGbp: 96_000, pctOfTotal: 42, trendPct: 3 },
  { department: "Engineering", headcount: 18, amountGbp: 48_000, pctOfTotal: 21, trendPct: 6 },
  { department: "Construction", headcount: 22, amountGbp: 52_000, pctOfTotal: 23, trendPct: -1 },
  { department: "PM / Finance / Admin", headcount: 9, amountGbp: 31_000, pctOfTotal: 14, trendPct: null },
];

export const payrollByProject: PayrollByProjectRow[] = [
  {
    project: "Kings Cross Tower",
    entity: "MA",
    amountDisplay: "£62K",
    amountGbp: 62_000,
    pctOfProjectCost: 66,
  },
  {
    project: "Camden Housing",
    entity: "MA",
    amountDisplay: "£24K",
    amountGbp: 24_000,
    pctOfProjectCost: 72,
  },
  {
    project: "Dubai Marina Dev.",
    entity: "MC+MA",
    amountDisplay: "AED 310K",
    amountGbp: 68_000,
    pctOfProjectCost: 61,
  },
  {
    project: "ME Drainage Study",
    entity: "ME",
    amountDisplay: "£9K",
    amountGbp: 9_000,
    pctOfProjectCost: 58,
  },
];

export const payrollKpis: PayrollKpis = {
  payrollRevenueRatioPct: 41,
  recoveryRatePct: 168,
  costPerBillableHourGbp: 38.2,
  overtimePct: 4.8,
  forecastNextGbp: 231_000,
};

export const payrollTrend: PayrollTrendPoint[] = [
  { month: "Dec", amountGbp: 204_000 },
  { month: "Jan", amountGbp: 208_000 },
  { month: "Feb", amountGbp: 212_000 },
  { month: "Mar", amountGbp: 210_000 },
  { month: "Apr", amountGbp: 218_000 },
  { month: "May", amountGbp: 218_000 },
  { month: "Jun", amountGbp: 227_000 },
];

export const payrollResourceCosts: PayrollResourceCostRow[] = [
  {
    resourceId: "EMP-001",
    name: "Priya Sharma",
    employmentType: "IN-HOUSE",
    entity: "MA",
    location: "London",
    skill: "Architect",
    monthlyCostDisplay: "£7,475",
    monthlyCostGbp: 7475,
    costPerHourDisplay: "£65.00",
    projects: 2,
  },
  {
    resourceId: "EMP-002",
    name: "James Okafor",
    employmentType: "IN-HOUSE",
    entity: "MA",
    location: "London",
    skill: "Project Mgmt",
    monthlyCostDisplay: "£8,050",
    monthlyCostGbp: 8050,
    costPerHourDisplay: "£70.00",
    projects: 3,
  },
  {
    resourceId: "EMP-003",
    name: "Marcus Klein",
    employmentType: "CONTRACTOR",
    entity: "ME",
    location: "Manchester",
    skill: "Structural",
    monthlyCostDisplay: "£9,120",
    monthlyCostGbp: 9120,
    costPerHourDisplay: "£60.00",
    projects: 3,
  },
  {
    resourceId: "FRE-002",
    name: "Daniel Voss",
    employmentType: "FREELANCER",
    entity: "MA",
    location: "London",
    skill: "BIM",
    monthlyCostDisplay: "£4,464",
    monthlyCostGbp: 4464,
    costPerHourDisplay: "£72.00",
    projects: 1,
  },
  {
    resourceId: "CON-005",
    name: "Nadia Farouk",
    employmentType: "CONTRACTOR",
    entity: "MC",
    location: "Dubai",
    skill: "QS",
    monthlyCostDisplay: "AED 37,800",
    monthlyCostGbp: 8300,
    costPerHourDisplay: "AED 225",
    projects: 1,
  },
];

export const payrollResourceCostSummary = {
  employeeCostGbp: 186_000,
  contractorCostGbp: 27_000,
  freelancerCostGbp: 14_000,
  highestCostSkill: "Architect",
  highestCostSkillAmountDisplay: "£74K / month",
};

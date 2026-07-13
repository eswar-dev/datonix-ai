import { meridianMetrics } from "./meridian";

export const executiveKpis = {
  groupRevenueGbp: meridianMetrics.financial.groupRevenueGbp,
  groupMarginPct: meridianMetrics.financial.marginPct,
  projectsAtRisk: 11,
  activeProjects: meridianMetrics.operational.activeProjects,
  staffCount: 83,
  avgUtilization: meridianMetrics.resource.avgUtilization,
  arDaysOutstanding: 52,
  cashRunwayDays: 94,
};

export const revenueByEntity = [
  { entity: "MA", revenueGbp: 1_420_000, marginPct: 35 },
  { entity: "ME", revenueGbp: 680_000, marginPct: 28 },
  { entity: "MC", revenueGbp: 310_000, marginPct: 29 },
];

export const costComposition = [
  { category: "Employee", amountGbp: 186_000, pct: 62 },
  { category: "Contractor", amountGbp: 41_000, pct: 14 },
  { category: "Freelancer", amountGbp: 28_000, pct: 9 },
  { category: "Other", amountGbp: 45_000, pct: 15 },
];

export const utilizationTrend = [
  { month: "Oct", value: 71 },
  { month: "Nov", value: 74 },
  { month: "Dec", value: 76 },
  { month: "Jan", value: 75 },
  { month: "Feb", value: 72 },
  { month: "Mar", value: 73 },
];

export interface AiAlert {
  id: string;
  severity: "High" | "Medium" | "Low";
  title: string;
  message: string;
  agent: string;
  time: string;
}

export const executiveAlerts: AiAlert[] = [
  { id: "a1", severity: "High", title: "INV-MA-039 overdue 65+ days", message: "Holborn Partners invoice £48K requires escalation. AR Collection Agent recommends immediate contact.", agent: "AR Collection Agent", time: "2h ago" },
  { id: "a2", severity: "High", title: "11 projects below margin threshold", message: "Portfolio margin at risk — Camden Housing and 10 others trending below 12%.", agent: "Margin Erosion Monitor", time: "4h ago" },
  { id: "a3", severity: "Medium", title: "Priya Sharma at 94% utilization", message: "Resource Overload Sentinel flags sustained over-allocation on Kings Cross Tower.", agent: "Resource Overload Sentinel", time: "6h ago" },
  { id: "a4", severity: "Medium", title: "AED exposure £218K", message: "FX Risk Monitor: −£14K unrealized FX P&L on MC projects.", agent: "FX Risk Monitor", time: "Yesterday" },
  { id: "a5", severity: "Low", title: "Marcus Klein contract expires in 42 days", message: "Rate Card Expiry Watch — renew ME structural framework agreement.", agent: "Rate Card Expiry Watch", time: "2 days ago" },
];

export const myDashboard = {
  utilizationPct: 82,
  leaveBalanceDays: 12,
  myProjects: [
    { name: "Kings Cross Tower", role: "Lead Architect", progress: 64, health: "Good" as const },
    { name: "Holborn Retrofit", role: "Design Review", progress: 20, health: "Good" as const },
  ],
  pendingApprovals: [
    { type: "TS", label: "Week 24 timesheet", count: 1 },
    { type: "EXP", label: "Software licence expense", count: 1 },
    { type: "Leave", label: "Annual leave request", count: 1 },
  ],
  agentNotifications: [
    { agent: "Project Delay Sentinel", message: "Planning submission milestone +3d variance on Kings Cross", time: "1h ago" },
    { agent: "Margin Erosion Monitor", message: "Camden Housing margin forecast 22%", time: "Yesterday" },
  ],
};

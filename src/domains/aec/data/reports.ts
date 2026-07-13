export interface ReportItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: "chart" | "people" | "money" | "clock" | "globe" | "agent";
  lastRun: string;
}

export interface ReportTableRow {
  id: string;
  entity: string;
  project: string;
  metric: string;
  value: string;
  status: "Good" | "At Risk" | "Critical";
}

export const reportLibrary: ReportItem[] = [
  { id: "rpt-profit", name: "Project Profitability", category: "Financial", description: "Margin and P&L by project across MA, ME, MC", icon: "chart", lastRun: "Today" },
  { id: "rpt-resource", name: "Resource Cost Analysis", category: "Resources", description: "Employee vs contractor cost split and utilization", icon: "people", lastRun: "Today" },
  { id: "rpt-ar", name: "AR Aging", category: "Financial", description: "Outstanding invoices by age bucket and entity", icon: "clock", lastRun: "Today" },
  { id: "rpt-consolidated", name: "Consolidated P&L", category: "Financial", description: "Group roll-up in GBP reporting currency", icon: "money", lastRun: "Yesterday" },
  { id: "rpt-fx", name: "FX Exposure Report", category: "Financial", description: "Multi-currency exposure and margin impact", icon: "globe", lastRun: "Today" },
  { id: "rpt-agent", name: "Agent Audit Trail", category: "AI", description: "AI agent actions, approvals, and decision log", icon: "agent", lastRun: "Today" },
];

export const profitabilityReportRows: ReportTableRow[] = [
  { id: "1", entity: "MA", project: "Kings Cross Tower", metric: "Gross Margin", value: "35%", status: "Good" },
  { id: "2", entity: "MA", project: "Camden Housing", metric: "Gross Margin", value: "24%", status: "At Risk" },
  { id: "3", entity: "MC", project: "Dubai Marina Dev.", metric: "Gross Margin", value: "29%", status: "Good" },
  { id: "4", entity: "ME", project: "Camden Housing Phase 2", metric: "Gross Margin", value: "18%", status: "Critical" },
  { id: "5", entity: "MA", project: "Holborn Retrofit", metric: "Gross Margin", value: "31%", status: "Good" },
];

export const resourceCostRows: ReportTableRow[] = [
  { id: "1", entity: "MA", project: "Kings Cross Tower", metric: "Employee Cost", value: "£198K", status: "Good" },
  { id: "2", entity: "MA", project: "Kings Cross Tower", metric: "Contractor Cost", value: "£72K", status: "Good" },
  { id: "3", entity: "MA", project: "Camden Housing", metric: "Employee Cost", value: "£58K", status: "At Risk" },
  { id: "4", entity: "MC", project: "Dubai Marina Dev.", metric: "Contractor Cost", value: "£890K", status: "At Risk" },
];

export const arAgingRows: ReportTableRow[] = [
  { id: "1", entity: "MA", project: "Kings Cross Tower", metric: "INV-MA-039 · 65d", value: "£48K", status: "Critical" },
  { id: "2", entity: "MC", project: "Dubai Marina Dev.", metric: "INV-MC-007 · 28d", value: "£92K", status: "At Risk" },
  { id: "3", entity: "MA", project: "Camden Housing", metric: "INV-MA-041 · 12d", value: "£24K", status: "Good" },
];

export type KpiStatus = "On Track" | "At Risk" | "Behind";

/** Four KPI categories shown on Enterprise Twin (artifact reference) */
export const kpiFrameworkCategories = [
  {
    id: "financial",
    category: "Financial KPIs",
    items: "Revenue, Employee/Contractor Cost Split, Gross Margin, AR Days",
  },
  {
    id: "project",
    category: "Project KPIs",
    items: "Schedule Variance, Budget Variance, Project Profitability %",
  },
  {
    id: "people",
    category: "People KPIs",
    items: "Utilisation %, Billable %, Bench Rate, Resource Type Mix",
  },
  {
    id: "agent",
    category: "Agent KPIs",
    items: "Alerts Raised, Actions Approved, Decision Accuracy",
  },
];

export interface KpiItem {
  id: string;
  name: string;
  category: string;
  target: string;
  actual: string;
  status: KpiStatus;
  layer: string;
}

export const kpis: KpiItem[] = [
  {
    id: "margin",
    name: "Group Gross Margin",
    category: "Financial",
    target: "32%",
    actual: "34%",
    status: "On Track",
    layer: "Financial",
  },
  {
    id: "utilization",
    name: "Billable Utilization",
    category: "Resource",
    target: "75%",
    actual: "73%",
    status: "At Risk",
    layer: "Resource",
  },
  {
    id: "backlog",
    name: "Backlog Coverage",
    category: "Operational",
    target: "6 mo",
    actual: "5.8 mo",
    status: "On Track",
    layer: "Operational",
  },
  {
    id: "ar-days",
    name: "AR Days Outstanding",
    category: "Financial",
    target: "< 45d",
    actual: "52d",
    status: "At Risk",
    layer: "Financial",
  },
  {
    id: "win-rate",
    name: "Proposal Win Rate",
    category: "Pipeline",
    target: "60%",
    actual: "62%",
    status: "On Track",
    layer: "Operational",
  },
  {
    id: "cross-entity",
    name: "Cross-Entity Delivery",
    category: "Operational",
    target: "< 5",
    actual: "4",
    status: "On Track",
    layer: "Organizational",
  },
  {
    id: "bench",
    name: "Bench Resources",
    category: "Resource",
    target: "< 8",
    actual: "6",
    status: "On Track",
    layer: "Resource",
  },
  {
    id: "compliance",
    name: "Compliance Coverage",
    category: "Governance",
    target: "100%",
    actual: "67%",
    status: "Behind",
    layer: "Organizational",
  },
];

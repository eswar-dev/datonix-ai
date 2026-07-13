import type { EntityStatus } from "./meridian";

export interface LayerSummary {
  id: "org" | "resource" | "financial" | "operational";
  title: string;
  subtitle: string;
  metrics: { label: string; value: string }[];
  linkTo: string;
  linkLabel: string;
}

export interface EntityTreeNode {
  id: string;
  name: string;
  code?: string;
  staffCount?: number;
  status?: EntityStatus;
  children?: EntityTreeNode[];
}

export const layerSummaries: LayerSummary[] = [
  {
    id: "org",
    title: "Organizational Layer",
    subtitle: "Hierarchy, entities, and reporting structure",
    metrics: [
      { label: "Hierarchy Levels", value: "5" },
      { label: "Business Units", value: "8" },
      { label: "Entities", value: "3" },
    ],
    linkTo: "/org-chart",
    linkLabel: "Open Org Chart →",
  },
  {
    id: "resource",
    title: "Resource Layer",
    subtitle: "Staff, contractors, utilization, and capacity",
    metrics: [
      { label: "Avg Utilization", value: "73%" },
      { label: "On Bench", value: "6" },
      { label: "Over-Allocated", value: "2" },
    ],
    linkTo: "/resources/planning",
    linkLabel: "Open Resource Planning →",
  },
  {
    id: "financial",
    title: "Financial Layer",
    subtitle: "Margins, cost composition, and multi-currency",
    metrics: [
      { label: "Group Margin", value: "34%" },
      { label: "Employee Cost", value: "£186K" },
      { label: "Contractor Cost", value: "£41K" },
    ],
    linkTo: "/accounting",
    linkLabel: "Open Accounting →",
  },
  {
    id: "operational",
    title: "Operational Layer",
    subtitle: "Projects, delivery, and cross-entity work",
    metrics: [
      { label: "Active Projects", value: "87" },
      { label: "Cross-Entity", value: "4" },
      { label: "Unmet Roles", value: "3" },
    ],
    linkTo: "/projects/profitability",
    linkLabel: "View Profitability →",
  },
];

export const entityTree: EntityTreeNode = {
  id: "meridian-group",
  name: "Meridian Group",
  staffCount: 83,
  status: "Active",
  children: [
    {
      id: "ma",
      code: "MA",
      name: "Meridian Architecture",
      staffCount: 40,
      status: "Active",
    },
    {
      id: "me",
      code: "ME",
      name: "Meridian Engineering",
      staffCount: 18,
      status: "Active",
    },
    {
      id: "mc",
      code: "MC",
      name: "Meridian Construction",
      staffCount: 25,
      status: "At Risk",
    },
  ],
};

export const twinMetadata = {
  version: "2.4.1",
  lastGenerated: "2026-03-15T09:42:00Z",
  dataSources: ["QuickBooks", "Ajera", "HRIS", "Excel"],
  layers: ["Organizational", "Resource", "Financial", "Operational"],
  agentsGenerated: 6,
  connectorsMapped: 4,
  reportingCurrency: "GBP",
  entities: 3,
  totalStaff: 83,
  activeProjects: 87,
};

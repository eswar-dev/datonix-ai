export type AgentStatus = "Active" | "Paused" | "Draft";

export interface GeneratedAgent {
  id: string;
  name: string;
  trigger: string;
  layer: string;
  status: AgentStatus;
  lastRun: string;
  confidence: number;
}

export const generatedAgents: GeneratedAgent[] = [
  {
    id: "margin-erosion",
    name: "Margin Erosion Monitor",
    trigger: "Project margin drops below 12%",
    layer: "Financial",
    status: "Active",
    lastRun: "2h ago",
    confidence: 89,
  },
  {
    id: "resource-overload",
    name: "Resource Overload Sentinel",
    trigger: "Utilization exceeds 95% for 2+ weeks",
    layer: "Resource",
    status: "Active",
    lastRun: "4h ago",
    confidence: 84,
  },
  {
    id: "project-delay",
    name: "Project Delay Sentinel",
    trigger: "Milestone variance > 5 days",
    layer: "Operational",
    status: "Active",
    lastRun: "1h ago",
    confidence: 91,
  },
  {
    id: "ar-collection",
    name: "AR Collection Agent",
    trigger: "Invoice overdue > 45 days",
    layer: "Financial",
    status: "Active",
    lastRun: "Yesterday",
    confidence: 87,
  },
  {
    id: "fx-risk",
    name: "FX Risk Monitor",
    trigger: "AED/GBP exposure exceeds £50K",
    layer: "Financial",
    status: "Paused",
    lastRun: "3 days ago",
    confidence: 76,
  },
  {
    id: "rate-card",
    name: "Rate Card Expiry Watch",
    trigger: "Contractor rate expires within 60 days",
    layer: "Resource",
    status: "Active",
    lastRun: "6h ago",
    confidence: 82,
  },
];

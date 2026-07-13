export type AgentAction = "Approve" | "Modify" | "Reject" | "Pending";

export interface GovernanceAgent {
  id: string;
  name: string;
  trigger: string;
  recommendation: string;
  confidence: number;
  status: AgentAction;
  project?: string;
  entity?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  user: string;
  detail: string;
}

export const governanceAgents: GovernanceAgent[] = [
  {
    id: "delay",
    name: "Project Delay Sentinel",
    trigger: "Milestone variance > 5 days",
    recommendation: "Add 1 structural engineer from ME for 4 weeks on Kings Cross Tower Phase 3.",
    confidence: 91,
    status: "Pending",
    project: "Kings Cross Tower",
    entity: "MA",
  },
  {
    id: "margin",
    name: "Margin Erosion Monitor",
    trigger: "Project margin drops below 12%",
    recommendation: "Issue change order notices on Camden Housing before scope creep continues.",
    confidence: 89,
    status: "Pending",
    project: "Camden Housing",
    entity: "MA",
  },
  {
    id: "overload",
    name: "Resource Overload Sentinel",
    trigger: "Utilization exceeds 95% for 2+ weeks",
    recommendation: "Cross-assign Layla Patel from Camden to relieve Priya Sharma on Kings Cross.",
    confidence: 84,
    status: "Pending",
    entity: "MA",
  },
  {
    id: "ar",
    name: "AR Collection Agent",
    trigger: "Invoice overdue > 45 days",
    recommendation: "Escalate INV-MA-039 (£48K) to Holborn Partners — 65 days outstanding.",
    confidence: 87,
    status: "Pending",
    project: "Kings Cross Tower",
    entity: "MA",
  },
  {
    id: "fx",
    name: "FX Risk Monitor",
    trigger: "AED/GBP exposure exceeds £50K",
    recommendation: "Hedge 50% of Dubai Marina AED exposure for Q2 billing cycle.",
    confidence: 76,
    status: "Pending",
    project: "Dubai Marina Dev.",
    entity: "MC",
  },
  {
    id: "rate",
    name: "Rate Card Expiry Watch",
    trigger: "Contractor rate expires within 60 days",
    recommendation: "Renew Marcus Klein framework agreement — 42 days remaining.",
    confidence: 82,
    status: "Pending",
    entity: "ME",
  },
];

export const initialAuditLog: AuditLogEntry[] = [
  { id: "log-1", timestamp: "2026-03-15 09:42", agent: "Project Delay Sentinel", action: "Alert raised", user: "System", detail: "Phase 3 planning milestone +3d variance detected" },
  { id: "log-2", timestamp: "2026-03-14 16:20", agent: "AR Collection Agent", action: "Alert raised", user: "System", detail: "INV-MA-039 crossed 60-day threshold" },
  { id: "log-3", timestamp: "2026-03-14 11:05", agent: "Resource Overload Sentinel", action: "Approved", user: "Victoria Hayes", detail: "Cross-assignment approved for Priya Sharma workload relief" },
  { id: "log-4", timestamp: "2026-03-13 14:30", agent: "Margin Erosion Monitor", action: "Modified", user: "David Chen", detail: "Camden Housing scope review scheduled — action deferred 1 week" },
  { id: "log-5", timestamp: "2026-03-12 10:15", agent: "Rate Card Expiry Watch", action: "Alert raised", user: "System", detail: "Marcus Klein contract expiry warning — 42 days" },
];

export const approvalWorkflowSteps = [
  { step: 1, label: "AI Agent Drafts", description: "Agent detects trigger condition and drafts recommendation" },
  { step: 2, label: "Human Review", description: "Manager reviews recommendation with confidence score" },
  { step: 3, label: "Approve / Modify / Reject", description: "Human decision with optional modification notes" },
  { step: 4, label: "Logged & Tracked", description: "Action recorded in audit log with full traceability" },
];

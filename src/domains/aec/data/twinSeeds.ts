import type { EnterpriseTwinSummary } from "./meridian";
import { meridianTwin, horizonTwin } from "./meridian";
import { inquiries as meridianInquiries } from "./inquiries";
import { projects as meridianProjects } from "./projects";
import { wbsProjects as meridianWbs } from "./wbs";
import { timesheetSubmissions as meridianTimesheets } from "./timesheets";
import { pendingExpenses as meridianExpenses } from "./expenses";
import { invoices as meridianInvoices } from "./accounting";
import { resources as meridianResources } from "./resources";
import { governanceAgents, initialAuditLog } from "./agentGovernance";
import type { Inquiry } from "./inquiries";
import type { Project } from "./projects";
import type { WbsProject } from "./wbs";
import type { TimesheetSubmission } from "./timesheets";
import type { PendingExpense } from "./expenses";
import type { Invoice } from "./accounting";
import type { ResourceRecord } from "./resources";
import type { GovernanceAgent, AuditLogEntry } from "./agentGovernance";
import type { LeaveRequest } from "./leave";

export interface TwinSeedBundle {
  twin: EnterpriseTwinSummary;
  inquiries: Inquiry[];
  projects: Project[];
  wbsProjects: WbsProject[];
  timesheetSubmissions: TimesheetSubmission[];
  pendingExpenses: PendingExpense[];
  invoices: Invoice[];
  resources: ResourceRecord[];
  governanceAgents: GovernanceAgent[];
  auditLog: AuditLogEntry[];
  leaveRequests: LeaveRequest[];
}

const horizonInquiries: Inquiry[] = [
  {
    id: "hz-inq-1",
    client: "Manchester City Council",
    projectName: "Northern Quarter Bridge",
    entity: "ME",
    projectType: "Civic",
    stage: "Proposal",
    stageLabel: "Proposal Due",
    score: 88,
    valueGbp: 165_000,
    valueDisplay: "£165K",
    contact: "Helen Wright",
    receivedDate: "2026-03-01",
    suggestedAction: "Generate Proposal",
  },
  {
    id: "hz-inq-2",
    client: "Riverside Developments",
    projectName: "Tower Wharf Refurb",
    entity: "ME",
    projectType: "Industrial",
    stage: "Qualification",
    stageLabel: "Qualification",
    score: 74,
    valueGbp: 92_000,
    valueDisplay: "£92K",
    contact: "Tom Bradley",
    receivedDate: "2026-03-08",
    suggestedAction: "Review",
  },
];

const horizonProjects: Project[] = [
  {
    id: "hz-prj-bridge",
    name: "Northern Quarter Bridge",
    client: "Manchester City Council",
    entity: "ME",
    type: "Civic",
    billingType: "Milestone",
    currency: "GBP",
    budget: 165_000,
    budgetDisplay: "£165K",
    health: "Good",
    marginPct: 31,
    progressPct: 18,
    revenue: 42_000,
    revenueDisplay: "£42K",
    projectManager: "E. Walsh",
    costs: { employee: 28_000, contractor: 8_000, freelancer: 2_000, other: 4_000 },
  },
];

const horizonWbs: WbsProject[] = [
  {
    id: "hz-prj-bridge",
    name: "Northern Quarter Bridge",
    riskSignal: {
      severity: "Low",
      title: "AI Risk Signal — On Track",
      message: "Early feasibility phase within budget and schedule.",
      recommendation: "Maintain current team allocation through concept design.",
    },
    phases: [
      {
        id: "hz-ph-1",
        name: "Phase 1 · Feasibility",
        status: "In Progress",
        progress: 45,
        budgetGbp: 22_000,
        spentGbp: 9_800,
        tasks: [{ id: "hz-t1", name: "Structural feasibility study", progress: 45 }],
      },
    ],
    milestones: [
      { id: "hz-ms-1", name: "Feasibility report", phase: "Phase 1", plannedDate: "2026-04-20", actualDate: null, varianceDays: 0, status: "On Track" },
    ],
  },
];

const horizonLeave: LeaveRequest[] = [
  { id: "hz-lv-1", employee: "Tom Bradley", entity: "ME", type: "Annual Leave", startDate: "2026-04-07", endDate: "2026-04-11", days: 5, status: "Pending", impact: "Low — no active project conflicts" },
];

export const twinSeeds: Record<string, TwinSeedBundle> = {
  [meridianTwin.id]: {
    twin: meridianTwin,
    inquiries: meridianInquiries,
    projects: meridianProjects,
    wbsProjects: meridianWbs,
    timesheetSubmissions: meridianTimesheets,
    pendingExpenses: meridianExpenses,
    invoices: meridianInvoices,
    resources: meridianResources,
    governanceAgents: governanceAgents.map((a) => ({ ...a })),
    auditLog: initialAuditLog.map((e) => ({ ...e })),
    leaveRequests: [
      { id: "lv-1", employee: "Alex Chen", entity: "MA", type: "Annual Leave", startDate: "2026-04-14", endDate: "2026-04-18", days: 5, status: "Pending", impact: "Medium — Kings Cross Tower design review may shift" },
      { id: "lv-2", employee: "Layla Patel", entity: "MA", type: "Sick Leave", startDate: "2026-03-18", endDate: "2026-03-19", days: 2, status: "Approved", impact: "Low — Camden Housing DD covered by backup" },
    ],
  },
  [horizonTwin.id]: {
    twin: horizonTwin,
    inquiries: horizonInquiries,
    projects: horizonProjects,
    wbsProjects: horizonWbs,
    timesheetSubmissions: [
      { id: "hz-ts-1", employee: "Tom Bradley", entity: "ME", week: "Week 24", totalHours: 38, billableHours: 34, projects: "Northern Quarter Bridge", status: "Pending" },
    ],
    pendingExpenses: [],
    invoices: [],
    resources: [
      { id: "HZ-001", name: "Tom Bradley", type: "IN-HOUSE", entity: "ME", designation: "Principal Engineer", department: "Structures", costRate: "£78/h", billRate: "£130/h", utilization: 76, status: "Good", projects: ["Northern Quarter Bridge"] },
    ],
    governanceAgents: [
      { id: "hz-delay", name: "Project Delay Sentinel", trigger: "Milestone variance > 5 days", recommendation: "Review Northern Quarter Bridge feasibility timeline.", confidence: 82, status: "Pending", project: "Northern Quarter Bridge", entity: "ME" },
    ],
    auditLog: [],
    leaveRequests: horizonLeave,
  },
};

export function getTwinSeed(twinId: string): TwinSeedBundle {
  return twinSeeds[twinId] ?? twinSeeds[meridianTwin.id];
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "@/common/contexts/AuthContext";
import { useViewMode } from "@/common/contexts/ViewModeContext";
import {
  DEFAULT_TWIN_PROMPT,
  meridianTwin,
  type EnterpriseTwinSummary,
} from "@/domains/aec/data/meridian";
import { twinSeeds, getTwinSeed, type TwinSeedBundle } from "@/domains/aec/data/twinSeeds";
import {
  defaultProjectDraft,
  type Project,
  type ProjectDraft,
} from "@/domains/aec/data/projects";
import type { Inquiry } from "@/domains/aec/data/inquiries";
import type { WbsProject } from "@/domains/aec/data/wbs";
import type { TimesheetSubmission } from "@/domains/aec/data/timesheets";
import type { PendingExpense } from "@/domains/aec/data/expenses";
import type { Invoice } from "@/domains/aec/data/accounting";
import type { ResourceRecord } from "@/domains/aec/data/resources";
import type { GovernanceAgent, AuditLogEntry, AgentAction } from "@/domains/aec/data/agentGovernance";
import type { LeaveRequest } from "@/domains/aec/data/leave";
import {
  resolveProjectIdFromInquiry,
  billingTypeForInquiry,
  currencyForEntity,
  slugToProjectId,
} from "@/domains/aec/data/projectRegistry";
import { inquiryMetrics } from "@/domains/aec/data/inquiries";
import type { ResourceType } from "@/domains/aec/data/orgChart";

const STORAGE_KEY = "datonix-aec-workspaces-v1";

export interface NavBadges {
  inquiries: number;
  timesheets: number;
  expenses: number;
  leave: number;
  agents: number;
}

interface TwinWorkspace {
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
  projectDraft: ProjectDraft;
  activeProjectId: string | null;
}

function seedToWorkspace(seed: TwinSeedBundle): TwinWorkspace {
  return {
    inquiries: seed.inquiries.map((i) => ({ ...i })),
    projects: seed.projects.map((p) => ({ ...p, costs: { ...p.costs } })),
    wbsProjects: structuredClone(seed.wbsProjects),
    timesheetSubmissions: seed.timesheetSubmissions.map((t) => ({ ...t })),
    pendingExpenses: seed.pendingExpenses.map((e) => ({ ...e })),
    invoices: seed.invoices.map((i) => ({ ...i })),
    resources: seed.resources.map((r) => ({ ...r })),
    governanceAgents: seed.governanceAgents.map((a) => ({ ...a })),
    auditLog: seed.auditLog.map((e) => ({ ...e })),
    leaveRequests: seed.leaveRequests.map((l) => ({ ...l })),
    projectDraft: { ...defaultProjectDraft },
    activeProjectId: null,
  };
}

function defaultWorkspaces(): Record<string, TwinWorkspace> {
  const out: Record<string, TwinWorkspace> = {};
  for (const [id] of Object.entries(twinSeeds)) {
    out[id] = seedToWorkspace(getTwinSeed(id));
  }
  return out;
}

function loadWorkspaces(): Record<string, TwinWorkspace> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultWorkspaces();
    const parsed = JSON.parse(raw) as Record<string, TwinWorkspace>;
    const defaults = defaultWorkspaces();
    for (const id of Object.keys(defaults)) {
      if (!parsed[id]) parsed[id] = defaults[id];
    }
    return parsed;
  } catch {
    return defaultWorkspaces();
  }
}

interface AecAppContextValue {
  activeTwin: EnterpriseTwinSummary;
  activeTwinId: string;
  twins: EnterpriseTwinSummary[];
  isGenerating: boolean;
  twinGenerated: boolean;
  generateTwin: (prompt?: string) => Promise<void>;
  switchTwin: (twinId: string) => void;

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

  projectDraft: ProjectDraft;
  activeProjectId: string | null;
  updateDraft: (partial: Partial<ProjectDraft>) => void;
  setDraftFromInquiry: (inquiry: Inquiry) => void;
  resetDraft: () => void;
  setActiveProjectId: (id: string) => void;
  saveProjectFromDraft: () => string;

  submitTimesheet: (submission: Omit<TimesheetSubmission, "id" | "status">) => void;
  approveTimesheet: (id: string) => void;
  rejectTimesheet: (id: string) => void;
  bulkApproveTimesheets: (ids: string[]) => void;

  submitExpense: (expense: Omit<PendingExpense, "id" | "status">) => void;
  approveExpense: (id: string) => void;
  rejectExpense: (id: string) => void;

  createInvoice: (invoice: Omit<Invoice, "id" | "daysOutstanding" | "status">) => void;

  addResource: (resource: Omit<ResourceRecord, "id" | "utilization" | "status">) => void;

  handleAgentAction: (id: string, action: AgentAction) => void;
  approveLeave: (id: string) => void;
  rejectLeave: (id: string) => void;

  navBadges: NavBadges;
  inquiryMetrics: ReturnType<typeof inquiryMetrics>;
  projectNames: string[];
}

const AecAppContext = createContext<AecAppContextValue | null>(null);

export function AecAppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeTwinId, setActiveTwinId] = useState(meridianTwin.id);
  const [workspaces, setWorkspaces] = useState<Record<string, TwinWorkspace>>(loadWorkspaces);
  const [isGenerating, setIsGenerating] = useState(false);
  const [twinGenerated, setTwinGenerated] = useState(true);

  const twins = useMemo(() => Object.values(twinSeeds).map((s) => s.twin), []);
  const activeTwin = twins.find((t) => t.id === activeTwinId) ?? meridianTwin;
  const ws = workspaces[activeTwinId] ?? seedToWorkspace(getTwinSeed(activeTwinId));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
  }, [workspaces]);

  const patchWorkspace = useCallback(
    (updater: (prev: TwinWorkspace) => TwinWorkspace) => {
      setWorkspaces((all) => ({
        ...all,
        [activeTwinId]: updater(all[activeTwinId] ?? seedToWorkspace(getTwinSeed(activeTwinId))),
      }));
    },
    [activeTwinId]
  );

  const generateTwin = useCallback(async (_prompt?: string) => {
    setIsGenerating(true);
    setTwinGenerated(false);
    await new Promise((r) => setTimeout(r, 1500));
    setIsGenerating(false);
    setTwinGenerated(true);
    toast.success("Enterprise Twin generated");
  }, []);

  const switchTwin = useCallback((twinId: string) => {
    if (!twinSeeds[twinId] || twinId === activeTwinId) return;
    setActiveTwinId(twinId);
    toast.success(`Switched to ${twinSeeds[twinId].twin.name}`);
  }, [activeTwinId]);

  const updateDraft = useCallback(
    (partial: Partial<ProjectDraft>) => {
      patchWorkspace((prev) => ({
        ...prev,
        projectDraft: { ...prev.projectDraft, ...partial },
      }));
    },
    [patchWorkspace]
  );

  const setDraftFromInquiry = useCallback(
    (inquiry: Inquiry) => {
      const projectId = resolveProjectIdFromInquiry(inquiry);
      patchWorkspace((prev) => ({
        ...prev,
        activeProjectId: projectId,
        projectDraft: {
          name: inquiry.projectName,
          client: inquiry.client,
          entity: inquiry.entity,
          type: inquiry.projectType,
          billingType: billingTypeForInquiry(inquiry),
          currency: currencyForEntity(inquiry.entity),
          budget: inquiry.valueGbp,
          startDate: "2026-04-01",
          endDate: "2027-12-31",
          projectManager: inquiry.contact,
        },
      }));
    },
    [patchWorkspace]
  );

  const resetDraft = useCallback(() => {
    patchWorkspace((prev) => ({
      ...prev,
      projectDraft: { ...defaultProjectDraft },
      activeProjectId: null,
    }));
  }, [patchWorkspace]);

  const setActiveProjectId = useCallback(
    (id: string) => {
      patchWorkspace((prev) => ({ ...prev, activeProjectId: id }));
    },
    [patchWorkspace]
  );

  const saveProjectFromDraft = useCallback(() => {
    const draft = ws.projectDraft;
    const id = ws.activeProjectId ?? slugToProjectId(draft.name);
    const existing = ws.projects.find((p) => p.id === id);
    const project: Project = existing ?? {
      id,
      name: draft.name,
      client: draft.client,
      entity: draft.entity,
      type: draft.type,
      billingType: draft.billingType,
      currency: draft.currency,
      budget: draft.budget,
      budgetDisplay:
        draft.currency === "AED"
          ? `AED ${(draft.budget / 1_000_000).toFixed(1)}M`
          : `£${Math.round(draft.budget / 1000)}K`,
      health: "Good",
      marginPct: 30,
      progressPct: 0,
      revenue: 0,
      revenueDisplay: draft.currency === "AED" ? "AED 0" : "£0",
      projectManager: draft.projectManager ?? "TBD",
      costs: { employee: 0, contractor: 0, freelancer: 0, other: 0 },
    };

    patchWorkspace((prev) => {
      const projects = existing
        ? prev.projects.map((p) =>
            p.id === id
              ? {
                  ...project,
                  progressPct: p.progressPct,
                  health: p.health,
                  costs: p.costs,
                  revenue: p.revenue,
                  revenueDisplay: p.revenueDisplay,
                  marginPct: p.marginPct,
                }
              : p
          )
        : [...prev.projects, project];
      const hasWbs = prev.wbsProjects.some((w) => w.id === id);
      const wbsProjects = hasWbs
        ? prev.wbsProjects
        : [
            ...prev.wbsProjects,
            {
              id,
              name: draft.name,
              riskSignal: {
                severity: "Low" as const,
                title: "New Project — WBS Draft",
                message:
                  "Work breakdown structure generated from project setup. Review and approve before mobilisation.",
                recommendation: "Assign PM and confirm milestone dates with the client.",
              },
              phases: [
                {
                  id: `${id}-ph-1`,
                  name: "Phase 1 · Mobilisation",
                  status: "Not Started" as const,
                  progress: 0,
                  budgetGbp: Math.round(draft.budget * 0.15),
                  spentGbp: 0,
                  tasks: [{ id: `${id}-t1`, name: "Project kick-off", progress: 0 }],
                },
              ],
              milestones: [
                {
                  id: `${id}-ms-1`,
                  name: "Kick-off",
                  phase: "Phase 1",
                  plannedDate: draft.startDate,
                  actualDate: null,
                  varianceDays: 0,
                  status: "On Track" as const,
                },
              ],
            },
          ];
      return { ...prev, projects, wbsProjects, activeProjectId: id };
    });

    return id;
  }, [ws.projectDraft, ws.activeProjectId, ws.projects, patchWorkspace]);

  const submitTimesheet = useCallback(
    (submission: Omit<TimesheetSubmission, "id" | "status">) => {
      patchWorkspace((prev) => ({
        ...prev,
        timesheetSubmissions: [
          ...prev.timesheetSubmissions,
          { ...submission, id: `ts-${Date.now()}`, status: "Pending" },
        ],
      }));
    },
    [patchWorkspace]
  );

  const approveTimesheet = useCallback(
    (id: string) => {
      patchWorkspace((prev) => ({
        ...prev,
        timesheetSubmissions: prev.timesheetSubmissions.map((t) =>
          t.id === id ? { ...t, status: "Approved" as const } : t
        ),
      }));
    },
    [patchWorkspace]
  );

  const rejectTimesheet = useCallback(
    (id: string) => {
      patchWorkspace((prev) => ({
        ...prev,
        timesheetSubmissions: prev.timesheetSubmissions.map((t) =>
          t.id === id ? { ...t, status: "Rejected" as const } : t
        ),
      }));
    },
    [patchWorkspace]
  );

  const bulkApproveTimesheets = useCallback(
    (ids: string[]) => {
      patchWorkspace((prev) => ({
        ...prev,
        timesheetSubmissions: prev.timesheetSubmissions.map((t) =>
          ids.includes(t.id) ? { ...t, status: "Approved" as const } : t
        ),
      }));
    },
    [patchWorkspace]
  );

  const submitExpense = useCallback(
    (expense: Omit<PendingExpense, "id" | "status">) => {
      patchWorkspace((prev) => ({
        ...prev,
        pendingExpenses: [
          ...prev.pendingExpenses,
          { ...expense, id: `exp-${Date.now()}`, status: "Pending" },
        ],
      }));
    },
    [patchWorkspace]
  );

  const approveExpense = useCallback(
    (id: string) => {
      patchWorkspace((prev) => ({
        ...prev,
        pendingExpenses: prev.pendingExpenses.map((e) =>
          e.id === id ? { ...e, status: "Approved" as const } : e
        ),
      }));
    },
    [patchWorkspace]
  );

  const rejectExpense = useCallback(
    (id: string) => {
      patchWorkspace((prev) => ({
        ...prev,
        pendingExpenses: prev.pendingExpenses.filter((e) => e.id !== id),
      }));
    },
    [patchWorkspace]
  );

  const createInvoice = useCallback(
    (invoice: Omit<Invoice, "id" | "daysOutstanding" | "status">) => {
      const entityPrefix = invoice.entity;
      const seq = ws.invoices.filter((i) => i.entity === entityPrefix).length + 40;
      patchWorkspace((prev) => ({
        ...prev,
        invoices: [
          {
            ...invoice,
            id: `INV-${entityPrefix}-${seq}`,
            daysOutstanding: 0,
            status: "Pending",
          },
          ...prev.invoices,
        ],
      }));
    },
    [patchWorkspace, ws.invoices]
  );

  const addResource = useCallback(
    (resource: Omit<ResourceRecord, "id" | "utilization" | "status">) => {
      patchWorkspace((prev) => ({
        ...prev,
        resources: [
          ...prev.resources,
          {
            ...resource,
            id: `EMP-${String(prev.resources.length + 1).padStart(3, "0")}`,
            utilization: 0,
            status: "Bench",
          },
        ],
      }));
    },
    [patchWorkspace]
  );

  const handleAgentAction = useCallback(
    (id: string, action: AgentAction) => {
      const agent = ws.governanceAgents.find((a) => a.id === id);
      if (!agent) return;
      patchWorkspace((prev) => ({
        ...prev,
        governanceAgents: prev.governanceAgents.map((a) =>
          a.id === id ? { ...a, status: action } : a
        ),
        auditLog: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
            agent: agent.name,
            action,
            user: user?.name ?? "Current User",
            detail: `${action}: ${agent.recommendation}`,
          },
          ...prev.auditLog,
        ],
      }));
    },
    [patchWorkspace, ws.governanceAgents, user?.name]
  );

  const approveLeave = useCallback(
    (id: string) => {
      patchWorkspace((prev) => ({
        ...prev,
        leaveRequests: prev.leaveRequests.map((l) =>
          l.id === id ? { ...l, status: "Approved" as const } : l
        ),
      }));
    },
    [patchWorkspace]
  );

  const rejectLeave = useCallback(
    (id: string) => {
      patchWorkspace((prev) => ({
        ...prev,
        leaveRequests: prev.leaveRequests.map((l) =>
          l.id === id ? { ...l, status: "Rejected" as const } : l
        ),
      }));
    },
    [patchWorkspace]
  );

  const navBadges = useMemo<NavBadges>(
    () => ({
      inquiries: ws.inquiries.filter((i) => i.stage !== "Won" && i.stage !== "Lost").length,
      timesheets: ws.timesheetSubmissions.filter((t) => t.status === "Pending").length,
      expenses: ws.pendingExpenses.filter((e) => e.status === "Pending").length,
      leave: ws.leaveRequests.filter((l) => l.status === "Pending").length,
      agents: ws.governanceAgents.filter((a) => a.status === "Pending").length,
    }),
    [ws]
  );

  const metrics = useMemo(() => inquiryMetrics(ws.inquiries), [ws.inquiries]);
  const projectNames = useMemo(() => ws.projects.map((p) => p.name), [ws.projects]);

  const value = useMemo(
    () => ({
      activeTwin,
      activeTwinId,
      twins,
      isGenerating,
      twinGenerated,
      generateTwin,
      switchTwin,
      inquiries: ws.inquiries,
      projects: ws.projects,
      wbsProjects: ws.wbsProjects,
      timesheetSubmissions: ws.timesheetSubmissions,
      pendingExpenses: ws.pendingExpenses,
      invoices: ws.invoices,
      resources: ws.resources,
      governanceAgents: ws.governanceAgents,
      auditLog: ws.auditLog,
      leaveRequests: ws.leaveRequests,
      projectDraft: ws.projectDraft,
      activeProjectId: ws.activeProjectId,
      updateDraft,
      setDraftFromInquiry,
      resetDraft,
      setActiveProjectId,
      saveProjectFromDraft,
      submitTimesheet,
      approveTimesheet,
      rejectTimesheet,
      bulkApproveTimesheets,
      submitExpense,
      approveExpense,
      rejectExpense,
      createInvoice,
      addResource,
      handleAgentAction,
      approveLeave,
      rejectLeave,
      navBadges,
      inquiryMetrics: metrics,
      projectNames,
    }),
    [
      activeTwin,
      activeTwinId,
      twins,
      isGenerating,
      twinGenerated,
      generateTwin,
      switchTwin,
      ws,
      updateDraft,
      setDraftFromInquiry,
      resetDraft,
      setActiveProjectId,
      saveProjectFromDraft,
      submitTimesheet,
      approveTimesheet,
      rejectTimesheet,
      bulkApproveTimesheets,
      submitExpense,
      approveExpense,
      rejectExpense,
      createInvoice,
      addResource,
      handleAgentAction,
      approveLeave,
      rejectLeave,
      navBadges,
      metrics,
      projectNames,
    ]
  );

  return <AecAppContext.Provider value={value}>{children}</AecAppContext.Provider>;
}

export function useAecApp() {
  const ctx = useContext(AecAppContext);
  if (!ctx) throw new Error("useAecApp must be used within AecAppProvider");
  return ctx;
}

export function useAecTwin() {
  const app = useAecApp();
  return {
    activeTwin: app.activeTwin,
    activeTwinId: app.activeTwinId,
    isGenerating: app.isGenerating,
    twinGenerated: app.twinGenerated,
    generateTwin: app.generateTwin,
    switchTwin: app.switchTwin,
  };
}

export function useAecProject() {
  const app = useAecApp();
  return {
    draft: app.projectDraft,
    setDraft: (draft: ProjectDraft) => app.updateDraft(draft),
    updateDraft: app.updateDraft,
    setDraftFromInquiry: app.setDraftFromInquiry,
    resetDraft: app.resetDraft,
    wbsProjectId: app.activeProjectId,
    setWbsProjectId: app.setActiveProjectId,
  };
}

export { DEFAULT_TWIN_PROMPT };

export function useAecDashboardData() {
  const app = useAecApp();
  const { user } = useAuth();
  const { viewMode } = useViewMode();
  const isManagerView = viewMode === "admin" && user?.isManager;

  return useMemo(() => {
    const pendingTs = app.timesheetSubmissions.filter((t) => t.status === "Pending").length;
    const pendingExp = app.pendingExpenses.filter((e) => e.status === "Pending").length;
    const pendingLeave = app.leaveRequests.filter((l) => l.status === "Pending").length;

    const myName = user?.name ?? "";
    const surname = myName.split(" ").pop() ?? "";
    const myProjects = app.projects
      .filter(
        (p) =>
          p.projectManager.toLowerCase().includes(surname.toLowerCase()) ||
          (myName.includes("Alex") && p.name === "Holborn Retrofit") ||
          (myName.includes("Priya") && p.name.includes("Kings Cross"))
      )
      .slice(0, isManagerView ? 6 : 3)
      .map((p) => ({
        name: p.name,
        role: isManagerView ? `PM: ${p.projectManager}` : "Team member",
        progress: p.progressPct,
        health: (p.health === "Critical" ? "At Risk" : p.health) as "Good" | "At Risk",
      }));

    const projects =
      myProjects.length > 0
        ? myProjects
        : [
            { name: "Kings Cross Tower", role: "Lead Architect", progress: 64, health: "Good" as const },
            { name: "Holborn Retrofit", role: "Design Review", progress: 20, health: "Good" as const },
          ];

    return {
      utilizationPct: isManagerView ? 73 : 82,
      leaveBalanceDays: 12,
      myProjects: projects,
      pendingApprovals: [
        { type: "TS", label: "Timesheets pending", count: pendingTs },
        { type: "EXP", label: "Expenses pending", count: pendingExp },
        { type: "Leave", label: "Leave requests", count: pendingLeave },
      ],
      agentNotifications: app.governanceAgents
        .filter((a) => a.status === "Pending")
        .slice(0, 3)
        .map((a) => ({
          agent: a.name,
          message: a.recommendation,
          time: "Recently",
        })),
      teamUtilization: isManagerView
        ? app.resources.slice(0, 5).map((r) => ({
            name: r.name,
            utilization: r.utilization,
            entity: r.entity,
          }))
        : [],
    };
  }, [app, user, isManagerView]);
}

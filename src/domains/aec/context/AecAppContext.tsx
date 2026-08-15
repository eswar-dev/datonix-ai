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
  adminTenants,
  twinGenerate,
  twinGet,
  twinLayers,
  twinList,
  twinSummary,
  extractKeyedArray,
} from "@/common/api";
import {
  aecApproveWbs,
  aecConvertInquiry,
  aecCreateInquiry,
  aecCreateProject,
  aecDeleteInquiry,
  aecGenerateProposal,
  aecGenerateQuotation,
  aecGenerateWbs,
  aecGetWbs,
  aecInquiryMetrics,
  aecListInquiries,
  aecListProjects,
  aecProjectProfitability,
  aecUpdateInquiryStage,
  aecUpdateProject,
} from "@/common/api/aecPipeline";
import {
  aecArchiveResource,
  aecApproveRateCard,
  aecCreateRateCard,
  aecCreateResource,
  aecListResources,
  aecOrgChart,
  aecRateCardExpiryWatcher,
  aecRateCardHistory,
  aecRateCardPendingRevisions,
  aecRateCardSummary,
  aecRateCards,
  aecResourceAllocations,
  aecResourceSummary,
  aecResourceUtilization,
  aecSkillsMatrix,
  aecUpdateResource,
} from "@/common/api/aecResources";
import {
  aecApproveTimesheets,
  aecCreateExpense,
  aecExpenseCategories,
  aecListExpenses,
  aecListTimesheets,
  aecMyTimesheet,
  aecSaveTimesheet,
  aecSubmitTimesheet,
  aecTimesheetSummary,
} from "@/common/api/aecTimesheets";
import {
  aecApprovalAction,
  aecCreateReport,
  aecExecutiveDashboard,
  aecHolidays,
  aecLeaveDecision,
  aecListLeaveRequests,
  aecMyDashboard,
  aecReportFilters,
  aecReportsLibrary,
  aecRunReport,
  aecSubmitLeave,
  type ApprovalAction,
} from "@/common/api/aecDashboards";
import {
  aecAccountingSummary,
  aecChaseInvoice,
  aecCreateAp,
  aecCreateGlJournal,
  aecCreateInvoice,
  aecCurrencyIntelligence,
  aecEscalateInvoice,
  aecListAp,
  aecListGlJournals,
  aecListInvoices,
  aecMarkInvoicePaid,
  aecPayroll,
  aecPreviewInvoice,
  aecProcessPayroll,
  aecRefreshCurrencyRates,
  aecTaxRules,
  aecUpdateAp,
} from "@/common/api/aecAccounting";
import {
  EMPTY_TWIN,
  mapTwinDetailView,
  mapTwinListItem,
  resolveTenantIdFromUser,
  type TwinDetailView,
} from "@/domains/aec/api/twinMappers";
import {
  cacheProfitability,
  cacheProposal,
  cacheQuotation,
  cacheWbs,
  isApiTwinId,
  loadPipelineCache,
  savePipelineCache,
} from "@/domains/aec/api/pipelineCache";
import {
  draftToCreatePayload,
  mapInquiry,
  mapInquiryMetrics,
  mapProfitability,
  mapProject,
  mapWbs,
  type ProfitabilityView,
} from "@/domains/aec/api/pipelineMappers";
import {
  leaveTypeToApi,
  mapExecutiveDashboard,
  mapLeaveList,
  mapLeaveRequest,
  mapLeaveSummaryFromList,
  mapMyDashboard,
  mapOrgChartForest,
  mapReportRows,
  mapReportsLibrary,
  wrapOrgForest,
  type ExecutiveDashboardView,
  type MyDashboardView,
} from "@/domains/aec/api/dashboardsMappers";
import type { OrgMember } from "@/domains/aec/data/orgChart";
import type { ReportItem, ReportTableRow } from "@/domains/aec/data/reports";
import {
  draftToCreateResourcePayload,
  mapAllocations,
  mapRateCards,
  mapResource,
  mapResourceSummary,
  mapSkillsMatrix,
  mapUtilization,
  type RateCardView,
  type ResourceSummaryView,
  type SkillsMatrixView,
  type UtilizationHeatmapView,
} from "@/domains/aec/api/resourcesMappers";
import {
  gridRowsToSavePayload,
  mapExpense,
  mapExpenseCategories,
  mapTimesheetDetail,
  mapTimesheetSubmission,
  mapTimesheetSummary,
  mondayOf,
  type ExpenseCategoryOption,
  type TimesheetDetailView,
  type TimesheetSummaryView,
} from "@/domains/aec/api/timesheetsMappers";
import {
  currentPayrollPeriod,
  mapAccountingSummary,
  mapApEntry,
  mapCurrencyIntelligence,
  mapGlList,
  mapInvoice,
  mapInvoicePreview,
  mapPayrollRows,
  mapTaxRules,
  type AccountingSummaryView,
  type CurrencyIntelligenceView,
  type InvoicePreviewView,
  type TaxRuleOption,
} from "@/domains/aec/api/accountingMappers";
import type { CrossEntityAllocation } from "@/domains/aec/data/resources";
import type { ResourceType } from "@/domains/aec/data/orgChart";
import { DEFAULT_TWIN_PROMPT, type EnterpriseTwinSummary } from "@/domains/aec/data/meridian";
import {
  defaultProjectDraft,
  type Project,
  type ProjectDraft,
} from "@/domains/aec/data/projects";
import type { Inquiry } from "@/domains/aec/data/inquiries";
import type { WbsProject } from "@/domains/aec/data/wbs";
import type { TimesheetRow, TimesheetSubmission } from "@/domains/aec/data/timesheets";
import type { PendingExpense } from "@/domains/aec/data/expenses";
import type {
  ApEntry,
  GlJournalEntry,
  Invoice,
  PayrollInput,
} from "@/domains/aec/data/accounting";
import type { ResourceRecord } from "@/domains/aec/data/resources";
import type { GovernanceAgent, AuditLogEntry, AgentAction } from "@/domains/aec/data/agentGovernance";
import type { LeaveRequest } from "@/domains/aec/data/leave";
import {
  billingTypeForInquiry,
  currencyForEntity,
} from "@/domains/aec/data/projectRegistry";
import { inquiryMetrics as computeInquiryMetrics } from "@/domains/aec/data/inquiries";

const STORAGE_KEY = "datonix-aec-workspaces-v1";
const ACTIVE_TWIN_KEY = "datonix-aec-active-twin-id";

function loadStoredActiveTwinId(): string {
  try {
    return localStorage.getItem(ACTIVE_TWIN_KEY) || "";
  } catch {
    return "";
  }
}

function pickDefaultTwinId(
  listed: EnterpriseTwinSummary[],
  currentId: string
): string {
  if (!listed.length) return "";
  if (currentId && listed.some((t) => t.id === currentId)) return currentId;
  const stored = loadStoredActiveTwinId();
  if (stored && listed.some((t) => t.id === stored)) return stored;
  const live = listed.find((t) => t.status === "Live");
  return live?.id ?? listed[0].id;
}

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

/** Empty operational workspace for API-backed twins (no Meridian seed remap). */
function emptyWorkspace(): TwinWorkspace {
  return {
    inquiries: [],
    projects: [],
    wbsProjects: [],
    timesheetSubmissions: [],
    pendingExpenses: [],
    invoices: [],
    resources: [],
    governanceAgents: [],
    auditLog: [],
    leaveRequests: [],
    projectDraft: { ...defaultProjectDraft },
    activeProjectId: null,
  };
}

function workspaceForTwinId(
  workspaces: Record<string, TwinWorkspace>,
  twinId: string
): TwinWorkspace {
  if (!twinId) return emptyWorkspace();
  if (workspaces[twinId]) return workspaces[twinId];
  return emptyWorkspace();
}

/** Persist only API-twin workspaces — never rehydrate Meridian/Horizon seed bundles. */
function loadWorkspaces(): Record<string, TwinWorkspace> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, TwinWorkspace>;
    const cleaned: Record<string, TwinWorkspace> = {};
    for (const [id, ws] of Object.entries(parsed)) {
      if (!isApiTwinId(id)) continue;
      cleaned[id] = ws;
    }
    return cleaned;
  } catch {
    return {};
  }
}

interface AecAppContextValue {
  activeTwin: EnterpriseTwinSummary;
  activeTwinId: string;
  twins: EnterpriseTwinSummary[];
  twinDetail: TwinDetailView | null;
  isGenerating: boolean;
  twinGenerated: boolean;
  twinsLoading: boolean;
  twinDetailLoading: boolean;
  twinError: string | null;
  generateTwin: (prompt?: string) => Promise<void>;
  switchTwin: (twinId: string) => void;
  refreshTwins: () => Promise<void>;
  loadTwinDetail: (id: string) => Promise<EnterpriseTwinSummary | null>;

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
  pipelineLoading: boolean;
  pipelineError: string | null;
  updateDraft: (partial: Partial<ProjectDraft>) => void;
  setDraftFromInquiry: (inquiry: Inquiry) => void;
  resetDraft: () => void;
  setActiveProjectId: (id: string) => void;
  saveProjectFromDraft: () => Promise<string>;
  refreshPipeline: () => Promise<void>;
  generateInquiryProposal: (inquiry: Inquiry) => Promise<unknown>;
  generateInquiryQuotation: (inquiry: Inquiry) => Promise<unknown>;
  convertInquiryToProject: (inquiry: Inquiry) => Promise<string | null>;
  updateInquiryStage: (inquiryId: string, stage: string) => Promise<void>;
  createInquiry: (input: {
    clientName: string;
    entityId: string;
    projectName: string;
    projectType: string;
    currency?: string;
    receivedDate: string;
    stage?: string;
    estimatedValue?: number;
    contactName?: string;
  }) => Promise<Inquiry>;
  deleteInquiry: (inquiryId: string) => Promise<void>;
  updateProject: (projectId: string, body: Record<string, unknown>) => Promise<void>;
  loadProjectWbs: (projectId: string) => Promise<WbsProject | null>;
  generateProjectWbs: (projectId: string) => Promise<WbsProject | null>;
  approveProjectWbs: (projectId: string) => Promise<void>;
  loadProjectProfitability: (projectId: string) => Promise<ProfitabilityView | null>;

  resourcesLoading: boolean;
  resourcesError: string | null;
  resourceSummary: ResourceSummaryView | null;
  utilizationHeatmap: UtilizationHeatmapView | null;
  skillsMatrix: SkillsMatrixView | null;
  rateCards: RateCardView[];
  allocations: CrossEntityAllocation[];
  refreshResources: () => Promise<void>;
  loadSkillsMatrix: () => Promise<SkillsMatrixView | null>;
  loadRateCards: () => Promise<RateCardView[]>;
  loadAllocations: () => Promise<CrossEntityAllocation[]>;
  createResource: (input: {
    name: string;
    type: ResourceType;
    entityId: string;
    designation: string;
    department: string;
    costRate?: number;
    billRate?: number;
    contractExpiry?: string;
  }) => Promise<ResourceRecord>;
  updateResource: (resourceId: string, body: Record<string, unknown>) => Promise<ResourceRecord>;
  archiveResource: (resourceId: string) => Promise<void>;

  timesheetsLoading: boolean;
  timesheetsError: string | null;
  timesheetSummary: TimesheetSummaryView | null;
  timesheetWeekStart: string;
  setTimesheetWeekStart: (weekStart: string) => void;
  refreshTimesheets: (weekStart?: string) => Promise<void>;
  loadMyTimesheet: (resourceId: string, weekStart?: string) => Promise<TimesheetDetailView | null>;
  saveAndSubmitTimesheet: (input: {
    resourceId: string;
    weekStart: string;
    weekDates: string[];
    rows: TimesheetRow[];
  }) => Promise<void>;
  approveTimesheet: (id: string) => Promise<void>;
  rejectTimesheet: (id: string, notes?: string) => Promise<void>;
  bulkApproveTimesheets: (ids: string[]) => Promise<void>;
  decideApproval: (input: {
    id: string;
    type: "timesheet" | "expense" | "leave";
    action: ApprovalAction;
    notes?: string;
  }) => Promise<void>;

  expensesLoading: boolean;
  expensesError: string | null;
  expenseCategories: ExpenseCategoryOption[];
  refreshExpenses: () => Promise<void>;
  loadExpenseCategories: () => Promise<ExpenseCategoryOption[]>;
  approveExpense: (id: string, notes?: string) => Promise<void>;
  rejectExpense: (id: string, notes?: string) => Promise<void>;
  submitExpense: (input: {
    resourceId: string;
    expenseDate: string;
    category: string;
    categoryOther?: string;
    amount: number;
    projectId?: string;
    notes?: string;
    currency?: string;
  }) => Promise<PendingExpense>;

  leaveLoading: boolean;
  leaveError: string | null;
  leaveSummaryLive: ReturnType<typeof mapLeaveSummaryFromList> | null;
  refreshLeave: (opts?: { scope?: "team" | "mine"; status?: string }) => Promise<void>;
  submitLeaveRequest: (input: {
    startDate: string;
    endDate: string;
    leaveType: string;
    notes?: string;
    resourceId?: string;
  }) => Promise<void>;
  approveLeave: (id: string, notes?: string) => Promise<void>;
  rejectLeave: (id: string, notes?: string) => Promise<void>;

  orgChartRoot: OrgMember | null;
  orgChartLoading: boolean;
  orgChartError: string | null;
  loadOrgChart: () => Promise<OrgMember | null>;

  reportLibraryLive: ReportItem[];
  reportRows: ReportTableRow[];
  reportsLoading: boolean;
  reportsError: string | null;
  loadReportLibrary: () => Promise<ReportItem[]>;
  runReport: (reportId: string, query?: Record<string, string>) => Promise<ReportTableRow[]>;

  myDashboard: MyDashboardView | null;
  executiveDashboard: ExecutiveDashboardView | null;
  dashboardsLoading: boolean;
  dashboardsError: string | null;
  loadMyDashboard: () => Promise<MyDashboardView | null>;
  loadExecutiveDashboard: () => Promise<ExecutiveDashboardView | null>;

  rateCardPendingRevisions: {
    id: string;
    resourceId: string;
    resourceName: string;
    fromValue: string;
    toValue: string;
    status: string;
  }[];
  loadRateCardPendingRevisions: () => Promise<void>;
  approveRateCard: (rateCardId: string) => Promise<void>;
  createRateCardRevision: (input: {
    resourceId: string;
    effectiveDate: string;
    hourlyCostRate?: number;
    hourlyBillingRate?: number;
    dailyCostRate?: number;
    dailyBillingRate?: number;
    currency?: string;
    notes?: string;
  }) => Promise<void>;
  loadRateCardSummary: () => Promise<{
    inHouseRateCards: number;
    contractorRateCards: number;
    freelancerRateCards: number;
    pendingRevisions: number;
  } | null>;
  rateCardExpiry: { id: string; resourceName: string; contractEndDate: string; daysRemaining: number }[];
  loadRateCardExpiry: () => Promise<void>;
  loadRateCardHistory: (resourceId: string) => Promise<unknown[]>;

  holidays: { date: string; name: string; year: number }[];
  holidaysMeta: { countryCode: string; year: number; publicHolidaysLeft: number; publicHolidaysTotal: number } | null;
  loadHolidays: (year?: string) => Promise<void>;

  reportFilters: {
    projects: { id: string; name: string }[];
    entities: { id: string; name: string; code: string }[];
    departments: string[];
    resourceTypes: { value: string; label: string }[];
  } | null;
  loadReportFilters: () => Promise<void>;
  createCustomReport: (input: { name: string; description?: string }) => Promise<void>;

  createApBill: (input: {
    entityId: string;
    supplier: string;
    amount: number;
    currency?: string;
    dueDate?: string;
    reference?: string;
    notes?: string;
  }) => Promise<void>;
  markApPaid: (billId: string) => Promise<void>;
  createGlJournal: (input: {
    description: string;
    entityId?: string;
    date?: string;
    lines: { accountCode: string; accountName: string; debit?: number; credit?: number }[];
  }) => Promise<void>;

  accountingLoading: boolean;
  accountingError: string | null;
  accountingSummary: AccountingSummaryView | null;
  apEntries: ApEntry[];
  glEntries: GlJournalEntry[];
  payrollRows: PayrollInput[];
  payrollPeriod: string;
  taxRules: TaxRuleOption[];
  currencyIntelligence: CurrencyIntelligenceView | null;
  refreshAccounting: () => Promise<void>;
  refreshCurrency: () => Promise<void>;
  loadTaxRules: () => Promise<TaxRuleOption[]>;
  previewInvoice: (body: Record<string, unknown>) => Promise<InvoicePreviewView | null>;
  createInvoice: (input: {
    entityId: string;
    client: string;
    projectId?: string;
    invoiceType: string;
    currency: string;
    netAmount: number;
    taxRule: string;
    dueDate?: string;
  }) => Promise<Invoice>;
  markInvoicePaid: (id: string) => Promise<void>;
  chaseInvoice: (id: string) => Promise<void>;
  escalateInvoice: (id: string) => Promise<void>;
  processPayroll: () => Promise<void>;
  refreshFxRates: () => Promise<void>;

  addResource: (resource: Omit<ResourceRecord, "id" | "utilization" | "status">) => void; // @deprecated local-only

  handleAgentAction: (id: string, action: AgentAction) => void;

  navBadges: NavBadges;
  inquiryMetrics: ReturnType<typeof computeInquiryMetrics>;
  projectNames: string[];
}

const AecAppContext = createContext<AecAppContextValue | null>(null);

export function AecAppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [twins, setTwins] = useState<EnterpriseTwinSummary[]>([]);
  const [activeTwinId, setActiveTwinId] = useState(loadStoredActiveTwinId);
  const [twinDetail, setTwinDetail] = useState<TwinDetailView | null>(null);
  const [workspaces, setWorkspaces] = useState<Record<string, TwinWorkspace>>(loadWorkspaces);
  const [isGenerating, setIsGenerating] = useState(false);
  const [twinGenerated, setTwinGenerated] = useState(false);
  const [twinsLoading, setTwinsLoading] = useState(false);
  const [twinDetailLoading, setTwinDetailLoading] = useState(false);
  const [twinError, setTwinError] = useState<string | null>(null);

  const activeTwin = twins.find((t) => t.id === activeTwinId) ?? twins[0] ?? EMPTY_TWIN;
  const workspaceKey = activeTwin.id || "__none__";
  const ws = workspaceForTwinId(workspaces, activeTwin.id);

  const loadTwinDetail = useCallback(async (id: string) => {
    if (!id) {
      setTwinDetail(null);
      return null;
    }
    setTwinDetailLoading(true);
    try {
      let detailRaw: unknown;
      try {
        detailRaw = await twinSummary(id);
      } catch {
        detailRaw = await twinGet(id);
      }
      let layersRaw: unknown | undefined;
      try {
        layersRaw = await twinLayers(id);
      } catch {
        layersRaw = undefined;
      }
      const view = mapTwinDetailView(detailRaw, layersRaw);
      setTwinDetail(view);
      setTwins((prev) => {
        if (!prev.some((t) => t.id === view.summary.id)) return [view.summary, ...prev];
        return prev.map((t) => (t.id === view.summary.id ? view.summary : t));
      });
      return view.summary;
    } catch (e) {
      setTwinError(e instanceof Error ? e.message : "Failed to load twin detail");
      return null;
    } finally {
      setTwinDetailLoading(false);
    }
  }, []);

  const refreshTwins = useCallback(async () => {
    if (!user) return;
    setTwinsLoading(true);
    setTwinError(null);
    try {
      const raw = await twinList();
      const rows = extractKeyedArray<Record<string, unknown>>(raw, "twins");
      const listed = rows.map(mapTwinListItem).filter((t) => t.id);
      setTwins(listed);
      if (listed.length === 0) {
        setActiveTwinId("");
        setTwinDetail(null);
        setTwinGenerated(false);
        return;
      }
      setTwinGenerated(true);
      setActiveTwinId((prev) => pickDefaultTwinId(listed, prev));
    } catch (e) {
      setTwins([]);
      setActiveTwinId("");
      setTwinDetail(null);
      setTwinGenerated(false);
      setTwinError(e instanceof Error ? e.message : "Failed to load twins");
    } finally {
      setTwinsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshTwins();
  }, [refreshTwins]);

  // Clear stale twin detail when switching; pages load detail/pipeline on demand.
  useEffect(() => {
    setTwinDetail(null);
  }, [activeTwinId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    try {
      if (activeTwinId) localStorage.setItem(ACTIVE_TWIN_KEY, activeTwinId);
    } catch {
      /* ignore */
    }
  }, [activeTwinId]);

  const patchWorkspace = useCallback(
    (updater: (prev: TwinWorkspace) => TwinWorkspace) => {
      setWorkspaces((all) => {
        const current = workspaceForTwinId(all, workspaceKey === "__none__" ? "" : workspaceKey);
        return {
          ...all,
          [workspaceKey]: updater(current),
        };
      });
    },
    [workspaceKey]
  );

  const resolveTenantId = useCallback(async (): Promise<string | null> => {
    const fromUser = resolveTenantIdFromUser(user?.tenant);
    if (fromUser) return fromUser;
    try {
      const raw = await adminTenants({ page: "1", page_size: "1" });
      const rows = extractKeyedArray<Record<string, unknown>>(raw, "tenants");
      const id = rows[0] ? String(rows[0].id ?? "") : "";
      return id || null;
    } catch {
      return null;
    }
  }, [user?.tenant]);

  const generateTwin = useCallback(
    async (prompt?: string) => {
      const text = (prompt ?? "").trim();
      if (!text) {
        toast.error("Prompt is required to generate a twin");
        return;
      }
      setIsGenerating(true);
      setTwinGenerated(false);
      setTwinError(null);
      try {
        const tenantId = await resolveTenantId();
        if (!tenantId) {
          throw new Error("No tenant available. Create a tenant in Administration first.");
        }
        const preview = await twinGenerate({ tenant_id: tenantId, prompt: text });
        const view = mapTwinDetailView(preview);
        setTwins((prev) => {
          const rest = prev.filter((t) => t.id !== view.summary.id);
          return [view.summary, ...rest];
        });
        setTwinDetail(view);
        setActiveTwinId(view.summary.id);
        setTwinGenerated(true);
        toast.success(`Enterprise Twin "${view.summary.name}" generated`);
        void loadTwinDetail(view.summary.id);
      } catch (e) {
        setTwinGenerated(twins.length > 0);
        const message = e instanceof Error ? e.message : "Twin generation failed";
        setTwinError(message);
        toast.error(message);
      } finally {
        setIsGenerating(false);
      }
    },
    [resolveTenantId, twins.length, loadTwinDetail]
  );

  const switchTwin = useCallback(
    (twinId: string) => {
      if (twinId === activeTwinId) return;
      const target = twins.find((t) => t.id === twinId);
      if (!target) return;
      setActiveTwinId(twinId);
      setTwinGenerated(true);
      toast.success(`Switched to ${target.name}`);
    },
    [activeTwinId, twins]
  );

  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [apiInquiryMetrics, setApiInquiryMetrics] = useState<ReturnType<
    typeof mapInquiryMetrics
  > | null>(null);

  useEffect(() => {
    setApiInquiryMetrics(null);
    setPipelineError(null);
  }, [activeTwinId]);

  const twinEntities = activeTwin.entities;

  const refreshPipeline = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) {
      setApiInquiryMetrics(null);
      setPipelineError(null);
      return;
    }
    setPipelineLoading(true);
    setPipelineError(null);

    let entities = twinEntities;
    if (!entities.length) {
      const summary = await loadTwinDetail(twinId);
      entities = summary?.entities ?? [];
    }

    const cached = loadPipelineCache(twinId);
    if (cached.inquiries.length || cached.projects.length) {
      patchWorkspace((prev) => ({
        ...prev,
        inquiries: cached.inquiries.length ? cached.inquiries : prev.inquiries,
        projects: cached.projects.length ? cached.projects : prev.projects,
        wbsProjects:
          Object.keys(cached.wbsByProjectId).length > 0
            ? Object.values(cached.wbsByProjectId)
            : prev.wbsProjects,
      }));
      if (cached.inquiryMetrics) setApiInquiryMetrics(cached.inquiryMetrics);
    }
    try {
      const [inqRaw, metricsRaw, projRaw] = await Promise.all([
        aecListInquiries(twinId),
        aecInquiryMetrics(twinId),
        aecListProjects(twinId),
      ]);
      const inquiries = (Array.isArray(inqRaw) ? inqRaw : []).map((row) =>
        mapInquiry(row, entities)
      );
      const projects = (Array.isArray(projRaw) ? projRaw : []).map((row) =>
        mapProject(row, entities)
      );
      const metrics = mapInquiryMetrics(metricsRaw);
      setApiInquiryMetrics(metrics);
      savePipelineCache(twinId, { inquiries, projects, inquiryMetrics: metrics });
      patchWorkspace((prev) => ({
        ...prev,
        inquiries,
        projects,
        activeProjectId:
          prev.activeProjectId && projects.some((p) => p.id === prev.activeProjectId)
            ? prev.activeProjectId
            : projects[0]?.id ?? null,
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load pipeline";
      setPipelineError(message);
      if (!cached.inquiries.length && !cached.projects.length) {
        toast.error(`Pipeline API: ${message}`);
      }
    } finally {
      setPipelineLoading(false);
    }
  }, [activeTwinId, twinEntities, patchWorkspace, loadTwinDetail]);

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
      const today = new Date();
      const start = today.toISOString().slice(0, 10);
      const end = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
        .toISOString()
        .slice(0, 10);
      patchWorkspace((prev) => ({
        ...prev,
        projectDraft: {
          name: inquiry.projectName,
          client: inquiry.client,
          entity: inquiry.entity,
          entityId: inquiry.entityId,
          type: inquiry.projectType,
          billingType: billingTypeForInquiry(inquiry),
          currency: currencyForEntity(inquiry.entity),
          budget: inquiry.valueGbp,
          startDate: start,
          endDate: end,
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

  const saveProjectFromDraft = useCallback(async () => {
    const draft = ws.projectDraft;
    const twinId = activeTwinId;

    if (!twinId || !isApiTwinId(twinId)) {
      toast.error("Select a live Enterprise Twin before creating a project");
      throw new Error("No API twin selected");
    }
    if (!draft.entity && !draft.entityId) {
      toast.error("Select an entity/organization for the project");
      throw new Error("Entity required");
    }

    try {
      const created = mapProject(
        await aecCreateProject(twinId, draftToCreatePayload(draft)),
        twinEntities
      );
      patchWorkspace((prev) => ({
        ...prev,
        projects: prev.projects.some((p) => p.id === created.id)
          ? prev.projects.map((p) => (p.id === created.id ? created : p))
          : [...prev.projects, created],
        activeProjectId: created.id,
      }));
      const cache = loadPipelineCache(twinId);
      savePipelineCache(twinId, {
        projects: [created, ...cache.projects.filter((p) => p.id !== created.id)],
      });
      toast.success(`Project "${created.name}" created`);
      return created.id;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create project failed");
      throw e;
    }
  }, [ws.projectDraft, patchWorkspace, activeTwinId, twinEntities]);

  const generateInquiryProposal = useCallback(
    async (inquiry: Inquiry) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) {
        throw new Error("Select an API-backed enterprise twin first");
      }
      const data = await aecGenerateProposal(twinId, inquiry.id);
      cacheProposal(twinId, inquiry.id, data);
      return data;
    },
    [activeTwinId]
  );

  const generateInquiryQuotation = useCallback(
    async (inquiry: Inquiry) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) {
        throw new Error("Select an API-backed enterprise twin first");
      }
      const data = await aecGenerateQuotation(twinId, inquiry.id);
      cacheQuotation(twinId, inquiry.id, data);
      return data;
    },
    [activeTwinId]
  );

  const convertInquiryToProject = useCallback(
    async (inquiry: Inquiry) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return null;
      if (inquiry.stage !== "Won") {
        toast.error("Only Won inquiries can be converted via API");
        return null;
      }
      try {
        const today = new Date();
        const start = today.toISOString().slice(0, 10);
        const end = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
          .toISOString()
          .slice(0, 10);
        const raw = (await aecConvertInquiry(twinId, inquiry.id, {
          billingType: billingTypeForInquiry(inquiry),
          startDate: start,
          endDate: end,
        })) as Record<string, unknown>;
        const projectId = String(raw.projectId ?? "");
        if (projectId) {
          await refreshPipeline();
          patchWorkspace((prev) => ({ ...prev, activeProjectId: projectId }));
          toast.success("Inquiry converted to project");
          return projectId;
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Convert failed");
      }
      return null;
    },
    [activeTwinId, refreshPipeline, patchWorkspace]
  );

  const updateInquiryStage = useCallback(
    async (inquiryId: string, stage: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      const updated = mapInquiry(await aecUpdateInquiryStage(twinId, inquiryId, stage), twinEntities);
      patchWorkspace((prev) => ({
        ...prev,
        inquiries: prev.inquiries.map((i) => (i.id === inquiryId ? updated : i)),
      }));
      await refreshPipeline();
    },
    [activeTwinId, twinEntities, patchWorkspace, refreshPipeline]
  );

  const createInquiry = useCallback(
    async (input: {
      clientName: string;
      entityId: string;
      projectName: string;
      projectType: string;
      currency?: string;
      receivedDate: string;
      stage?: string;
      estimatedValue?: number;
      contactName?: string;
    }) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) {
        throw new Error("Select a live Enterprise Twin first");
      }
      const body: Record<string, unknown> = {
        clientName: input.clientName,
        entityId: input.entityId,
        projectName: input.projectName,
        projectType: input.projectType,
        currency: input.currency ?? "GBP",
        receivedDate: input.receivedDate,
        stage: (input.stage ?? "inquiry").toLowerCase(),
      };
      if (input.estimatedValue != null) body.value = input.estimatedValue;
      if (input.contactName) body.contactName = input.contactName;
      const created = mapInquiry(await aecCreateInquiry(twinId, body), twinEntities);
      await refreshPipeline();
      return created;
    },
    [activeTwinId, twinEntities, refreshPipeline]
  );

  const deleteInquiry = useCallback(
    async (inquiryId: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      try {
        await aecDeleteInquiry(twinId, inquiryId);
        patchWorkspace((prev) => ({
          ...prev,
          inquiries: prev.inquiries.filter((i) => i.id !== inquiryId),
        }));
        await refreshPipeline();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Delete inquiry failed");
        throw e;
      }
    },
    [activeTwinId, patchWorkspace, refreshPipeline]
  );

  const updateProject = useCallback(
    async (projectId: string, body: Record<string, unknown>) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      try {
        const updated = mapProject(await aecUpdateProject(twinId, projectId, body), twinEntities);
        patchWorkspace((prev) => ({
          ...prev,
          projects: prev.projects.map((p) => (p.id === projectId ? updated : p)),
        }));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Update project failed");
        throw e;
      }
    },
    [activeTwinId, twinEntities, patchWorkspace]
  );

  const loadProjectWbs = useCallback(
    async (projectId: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId) || !projectId) return null;
      try {
        const wbs = mapWbs(await aecGetWbs(twinId, projectId));
        cacheWbs(twinId, projectId, wbs);
        patchWorkspace((prev) => ({
          ...prev,
          wbsProjects: prev.wbsProjects.some((w) => w.id === projectId)
            ? prev.wbsProjects.map((w) => (w.id === projectId ? wbs : w))
            : [...prev.wbsProjects, wbs],
          activeProjectId: projectId,
        }));
        return wbs;
      } catch (e) {
        const cached = loadPipelineCache(twinId).wbsByProjectId[projectId];
        if (cached) {
          patchWorkspace((prev) => ({
            ...prev,
            wbsProjects: prev.wbsProjects.some((w) => w.id === projectId)
              ? prev.wbsProjects.map((w) => (w.id === projectId ? cached : w))
              : [...prev.wbsProjects, cached],
          }));
          return cached;
        }
        toast.error(e instanceof Error ? e.message : "Failed to load WBS");
        return null;
      }
    },
    [activeTwinId, patchWorkspace]
  );

  const generateProjectWbs = useCallback(
    async (projectId: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return null;
      try {
        await aecGenerateWbs(twinId, projectId);
        toast.success("WBS draft generated");
        return await loadProjectWbs(projectId);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "WBS generate failed");
        return null;
      }
    },
    [activeTwinId, loadProjectWbs]
  );

  const approveProjectWbs = useCallback(
    async (projectId: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      try {
        await aecApproveWbs(twinId, projectId);
        toast.success("WBS approved");
        await loadProjectWbs(projectId);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "WBS approve failed");
      }
    },
    [activeTwinId, loadProjectWbs]
  );

  const loadProjectProfitability = useCallback(
    async (projectId: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId) || !projectId) return null;
      try {
        const view = mapProfitability(await aecProjectProfitability(twinId, projectId), twinEntities);
        cacheProfitability(twinId, projectId, view);
        return view;
      } catch (e) {
        const cached = loadPipelineCache(twinId).profitabilityByProjectId[projectId];
        if (cached) return mapProfitability(cached, twinEntities);
        toast.error(e instanceof Error ? e.message : "Failed to load profitability");
        return null;
      }
    },
    [activeTwinId, twinEntities]
  );

  const [timesheetsLoading, setTimesheetsLoading] = useState(false);
  const [timesheetsError, setTimesheetsError] = useState<string | null>(null);
  const [timesheetSummary, setTimesheetSummary] = useState<TimesheetSummaryView | null>(null);
  const [timesheetWeekStart, setTimesheetWeekStart] = useState(() => mondayOf());
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expensesError, setExpensesError] = useState<string | null>(null);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryOption[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [leaveSummaryLive, setLeaveSummaryLive] = useState<ReturnType<
    typeof mapLeaveSummaryFromList
  > | null>(null);
  const [orgChartRoot, setOrgChartRoot] = useState<OrgMember | null>(null);
  const [orgChartLoading, setOrgChartLoading] = useState(false);
  const [orgChartError, setOrgChartError] = useState<string | null>(null);
  const [reportLibraryLive, setReportLibraryLive] = useState<ReportItem[]>([]);
  const [reportRows, setReportRows] = useState<ReportTableRow[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [myDashboard, setMyDashboard] = useState<MyDashboardView | null>(null);
  const [executiveDashboard, setExecutiveDashboard] = useState<ExecutiveDashboardView | null>(null);
  const [dashboardsLoading, setDashboardsLoading] = useState(false);
  const [dashboardsError, setDashboardsError] = useState<string | null>(null);
  const [rateCardPendingRevisions, setRateCardPendingRevisions] = useState<
    {
      id: string;
      resourceId: string;
      resourceName: string;
      fromValue: string;
      toValue: string;
      status: string;
    }[]
  >([]);
  const [rateCardExpiry, setRateCardExpiry] = useState<
    { id: string; resourceName: string; contractEndDate: string; daysRemaining: number }[]
  >([]);
  const [holidays, setHolidays] = useState<{ date: string; name: string; year: number }[]>([]);
  const [holidaysMeta, setHolidaysMeta] = useState<{
    countryCode: string;
    year: number;
    publicHolidaysLeft: number;
    publicHolidaysTotal: number;
  } | null>(null);
  const [reportFilters, setReportFilters] = useState<{
    projects: { id: string; name: string }[];
    entities: { id: string; name: string; code: string }[];
    departments: string[];
    resourceTypes: { value: string; label: string }[];
  } | null>(null);

  useEffect(() => {
    setTimesheetSummary(null);
    setTimesheetsError(null);
    setExpensesError(null);
    setExpenseCategories([]);
    setTimesheetWeekStart(mondayOf());
    setLeaveError(null);
    setLeaveSummaryLive(null);
    setOrgChartRoot(null);
    setOrgChartError(null);
    setReportLibraryLive([]);
    setReportRows([]);
    setReportsError(null);
    setMyDashboard(null);
    setExecutiveDashboard(null);
    setDashboardsError(null);
    setRateCardPendingRevisions([]);
    setRateCardExpiry([]);
    setHolidays([]);
    setHolidaysMeta(null);
    setReportFilters(null);
  }, [activeTwinId]);

  const refreshTimesheets = useCallback(
    async (weekStart?: string) => {
      const twinId = activeTwinId;
      const week = weekStart ?? timesheetWeekStart;
      if (weekStart) setTimesheetWeekStart(weekStart);
      if (!twinId || !isApiTwinId(twinId)) {
        setTimesheetsError(null);
        return;
      }
      setTimesheetsLoading(true);
      setTimesheetsError(null);
      try {
        const [listRaw, summaryRaw] = await Promise.all([
          aecListTimesheets(twinId, { weekStart: week }),
          aecTimesheetSummary(twinId, week),
        ]);
        const list = (Array.isArray(listRaw) ? listRaw : []).map(mapTimesheetSubmission);
        const summary = mapTimesheetSummary(summaryRaw);
        setTimesheetSummary(summary);
        patchWorkspace((prev) => ({ ...prev, timesheetSubmissions: list }));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load timesheets";
        setTimesheetsError(message);
        toast.error(`Timesheets API: ${message}`);
      } finally {
        setTimesheetsLoading(false);
      }
    },
    [activeTwinId, timesheetWeekStart, patchWorkspace]
  );

  const loadMyTimesheet = useCallback(
    async (resourceId: string, weekStart?: string) => {
      const twinId = activeTwinId;
      const week = weekStart ?? timesheetWeekStart;
      if (!twinId || !isApiTwinId(twinId) || !resourceId) return null;
      try {
        return mapTimesheetDetail(
          await aecMyTimesheet(twinId, { weekStart: week, resourceId })
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load timesheet");
        return null;
      }
    },
    [activeTwinId, timesheetWeekStart]
  );

  const saveAndSubmitTimesheet = useCallback(
    async (input: {
      resourceId: string;
      weekStart: string;
      weekDates: string[];
      rows: TimesheetRow[];
    }) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) {
        throw new Error("Select a live Enterprise Twin first");
      }
      const payload = gridRowsToSavePayload(input.rows, input.weekDates, {
        resourceId: input.resourceId,
        weekStart: input.weekStart,
      });
      const saved = mapTimesheetDetail(await aecSaveTimesheet(twinId, payload));
      if (!saved.id) throw new Error("Timesheet save did not return an id");
      await aecSubmitTimesheet(twinId, saved.id);
      await refreshTimesheets(input.weekStart);
    },
    [activeTwinId, refreshTimesheets]
  );

  const decideApproval = useCallback(
    async (input: {
      id: string;
      type: "timesheet" | "expense" | "leave";
      action: ApprovalAction;
      notes?: string;
    }) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      try {
        await aecApprovalAction(twinId, {
          id: input.id,
          type: input.type,
          action: input.action,
          notes: input.notes,
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Approval action failed");
        throw e;
      }
    },
    [activeTwinId]
  );

  const approveTimesheet = useCallback(
    async (id: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      try {
        await aecApproveTimesheets(twinId, [id]);
        await refreshTimesheets();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Approve failed");
        throw e;
      }
    },
    [activeTwinId, refreshTimesheets]
  );

  const rejectTimesheet = useCallback(
    async (id: string, notes?: string) => {
      await decideApproval({ id, type: "timesheet", action: "reject", notes });
      await refreshTimesheets();
    },
    [decideApproval, refreshTimesheets]
  );

  const bulkApproveTimesheets = useCallback(
    async (ids: string[]) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId) || !ids.length) return;
      try {
        await aecApproveTimesheets(twinId, ids);
        await refreshTimesheets();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Bulk approve failed");
        throw e;
      }
    },
    [activeTwinId, refreshTimesheets]
  );

  const refreshExpenses = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) {
      setExpensesError(null);
      return;
    }
    setExpensesLoading(true);
    setExpensesError(null);
    try {
      const listRaw = await aecListExpenses(twinId);
      const list = (Array.isArray(listRaw) ? listRaw : []).map(mapExpense);
      patchWorkspace((prev) => ({ ...prev, pendingExpenses: list }));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load expenses";
      setExpensesError(message);
      toast.error(`Expenses API: ${message}`);
    } finally {
      setExpensesLoading(false);
    }
  }, [activeTwinId, patchWorkspace]);

  const loadExpenseCategories = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return [];
    try {
      const cats = mapExpenseCategories(await aecExpenseCategories(twinId));
      setExpenseCategories(cats);
      return cats;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load categories");
      return [];
    }
  }, [activeTwinId]);

  const submitExpense = useCallback(
    async (input: {
      resourceId: string;
      expenseDate: string;
      category: string;
      categoryOther?: string;
      amount: number;
      projectId?: string;
      notes?: string;
      currency?: string;
    }) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) {
        throw new Error("Select a live Enterprise Twin first");
      }
      const body: Record<string, unknown> = {
        resourceId: input.resourceId,
        expenseDate: input.expenseDate,
        category: input.category,
        amount: input.amount,
        currency: input.currency ?? "GBP",
        notes: input.notes ?? "",
      };
      if (input.categoryOther) body.categoryOther = input.categoryOther;
      if (input.projectId) body.projectId = input.projectId;
      const created = mapExpense(await aecCreateExpense(twinId, body));
      patchWorkspace((prev) => ({
        ...prev,
        pendingExpenses: [created, ...prev.pendingExpenses.filter((e) => e.id !== created.id)],
      }));
      return created;
    },
    [activeTwinId, patchWorkspace]
  );

  const approveExpense = useCallback(
    async (id: string, notes?: string) => {
      await decideApproval({ id, type: "expense", action: "approve", notes });
      await refreshExpenses();
    },
    [decideApproval, refreshExpenses]
  );

  const rejectExpense = useCallback(
    async (id: string, notes?: string) => {
      await decideApproval({ id, type: "expense", action: "reject", notes });
      await refreshExpenses();
    },
    [decideApproval, refreshExpenses]
  );

  const [accountingLoading, setAccountingLoading] = useState(false);
  const [accountingError, setAccountingError] = useState<string | null>(null);
  const [accountingSummary, setAccountingSummary] = useState<AccountingSummaryView | null>(null);
  const [apEntries, setApEntries] = useState<ApEntry[]>([]);
  const [glEntries, setGlEntries] = useState<GlJournalEntry[]>([]);
  const [payrollRows, setPayrollRows] = useState<PayrollInput[]>([]);
  const [payrollPeriod, setPayrollPeriod] = useState(() => currentPayrollPeriod());
  const [taxRules, setTaxRules] = useState<TaxRuleOption[]>([]);
  const [currencyIntelligence, setCurrencyIntelligence] =
    useState<CurrencyIntelligenceView | null>(null);

  useEffect(() => {
    setAccountingSummary(null);
    setApEntries([]);
    setGlEntries([]);
    setPayrollRows([]);
    setTaxRules([]);
    setCurrencyIntelligence(null);
    setAccountingError(null);
    setPayrollPeriod(currentPayrollPeriod());
  }, [activeTwinId]);

  const refreshAccounting = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) {
      setAccountingError(null);
      return;
    }
    const period = payrollPeriod || currentPayrollPeriod();
    setAccountingLoading(true);
    setAccountingError(null);
    try {
      const [summaryRaw, invoicesRaw, apRaw, glRaw, payrollRaw] = await Promise.all([
        aecAccountingSummary(twinId),
        aecListInvoices(twinId),
        aecListAp(twinId),
        aecListGlJournals(twinId),
        aecPayroll(twinId, period),
      ]);
      setAccountingSummary(mapAccountingSummary(summaryRaw));
      setApEntries((Array.isArray(apRaw) ? apRaw : []).map(mapApEntry));
      setGlEntries(mapGlList(glRaw));
      setPayrollRows(mapPayrollRows(payrollRaw, period));
      const invoices = (Array.isArray(invoicesRaw) ? invoicesRaw : []).map(mapInvoice);
      patchWorkspace((prev) => ({ ...prev, invoices }));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load accounting";
      setAccountingError(message);
      toast.error(`Accounting API: ${message}`);
    } finally {
      setAccountingLoading(false);
    }
  }, [activeTwinId, payrollPeriod, patchWorkspace]);

  const refreshCurrency = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return;
    try {
      setCurrencyIntelligence(mapCurrencyIntelligence(await aecCurrencyIntelligence(twinId)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load currency");
    }
  }, [activeTwinId]);

  const loadTaxRules = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return [];
    try {
      const rules = mapTaxRules(await aecTaxRules(twinId));
      setTaxRules(rules);
      return rules;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load tax rules");
      return [];
    }
  }, [activeTwinId]);

  const previewInvoice = useCallback(
    async (body: Record<string, unknown>) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return null;
      try {
        return mapInvoicePreview(await aecPreviewInvoice(twinId, body));
      } catch {
        return null;
      }
    },
    [activeTwinId]
  );

  const createInvoice = useCallback(
    async (input: {
      entityId: string;
      client: string;
      projectId?: string;
      invoiceType: string;
      currency: string;
      netAmount: number;
      taxRule: string;
      dueDate?: string;
    }) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) {
        throw new Error("Select a live Enterprise Twin first");
      }
      const body: Record<string, unknown> = {
        entityId: input.entityId,
        client: input.client,
        invoiceType: input.invoiceType.toLowerCase(),
        currency: input.currency,
        netAmount: input.netAmount,
        taxRule: input.taxRule,
      };
      if (input.projectId) body.projectId = input.projectId;
      if (input.dueDate) body.dueDate = input.dueDate;
      const created = mapInvoice(await aecCreateInvoice(twinId, body));
      patchWorkspace((prev) => ({
        ...prev,
        invoices: [created, ...prev.invoices.filter((i) => i.id !== created.id)],
      }));
      return created;
    },
    [activeTwinId, patchWorkspace]
  );

  const markInvoicePaid = useCallback(
    async (id: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      const updated = mapInvoice(await aecMarkInvoicePaid(twinId, id));
      patchWorkspace((prev) => ({
        ...prev,
        invoices: prev.invoices.map((i) => (i.id === id ? updated : i)),
      }));
    },
    [activeTwinId, patchWorkspace]
  );

  const chaseInvoice = useCallback(
    async (id: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      const updated = mapInvoice(await aecChaseInvoice(twinId, id));
      patchWorkspace((prev) => ({
        ...prev,
        invoices: prev.invoices.map((i) => (i.id === id ? updated : i)),
      }));
    },
    [activeTwinId, patchWorkspace]
  );

  const escalateInvoice = useCallback(
    async (id: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      const updated = mapInvoice(await aecEscalateInvoice(twinId, id));
      patchWorkspace((prev) => ({
        ...prev,
        invoices: prev.invoices.map((i) => (i.id === id ? updated : i)),
      }));
    },
    [activeTwinId, patchWorkspace]
  );

  const processPayroll = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return;
    const period = payrollPeriod || currentPayrollPeriod();
    const raw = await aecProcessPayroll(twinId, period);
    setPayrollRows(mapPayrollRows(raw, period));
  }, [activeTwinId, payrollPeriod]);

  const refreshFxRates = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return;
    await aecRefreshCurrencyRates(twinId);
    await refreshCurrency();
  }, [activeTwinId, refreshCurrency]);

  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  const [resourceSummary, setResourceSummary] = useState<ResourceSummaryView | null>(null);
  const [utilizationHeatmap, setUtilizationHeatmap] = useState<UtilizationHeatmapView | null>(null);
  const [skillsMatrix, setSkillsMatrix] = useState<SkillsMatrixView | null>(null);
  const [rateCards, setRateCards] = useState<RateCardView[]>([]);
  const [allocations, setAllocations] = useState<CrossEntityAllocation[]>([]);

  useEffect(() => {
    setResourceSummary(null);
    setUtilizationHeatmap(null);
    setSkillsMatrix(null);
    setRateCards([]);
    setAllocations([]);
    setResourcesError(null);
  }, [activeTwinId]);

  const refreshResources = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) {
      setResourcesError(null);
      return;
    }
    setResourcesLoading(true);
    setResourcesError(null);
    let entities = twinEntities;
    if (!entities.length) {
      const summary = await loadTwinDetail(twinId);
      entities = summary?.entities ?? [];
    }
    try {
      const [listRaw, summaryRaw, utilRaw] = await Promise.all([
        aecListResources(twinId),
        aecResourceSummary(twinId),
        aecResourceUtilization(twinId, { weeks: "8" }),
      ]);
      const list = (Array.isArray(listRaw) ? listRaw : []).map((row) => mapResource(row, entities));
      const summary = mapResourceSummary(summaryRaw);
      const util = mapUtilization(utilRaw);
      setResourceSummary(summary);
      setUtilizationHeatmap(util);
      patchWorkspace((prev) => ({ ...prev, resources: list }));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load resources";
      setResourcesError(message);
      toast.error(`Resources API: ${message}`);
    } finally {
      setResourcesLoading(false);
    }
  }, [activeTwinId, twinEntities, patchWorkspace, loadTwinDetail]);

  const loadSkillsMatrix = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return null;
    try {
      const view = mapSkillsMatrix(await aecSkillsMatrix(twinId));
      setSkillsMatrix(view);
      return view;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load skills");
      return null;
    }
  }, [activeTwinId]);

  const loadRateCards = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return [];
    let entities = twinEntities;
    if (!entities.length) {
      const summary = await loadTwinDetail(twinId);
      entities = summary?.entities ?? [];
    }
    try {
      const cards = mapRateCards(await aecRateCards(twinId), entities);
      setRateCards(cards);
      return cards;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load rate cards");
      return [];
    }
  }, [activeTwinId, twinEntities, loadTwinDetail]);

  const loadAllocations = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return [];
    let entities = twinEntities;
    if (!entities.length) {
      const summary = await loadTwinDetail(twinId);
      entities = summary?.entities ?? [];
    }
    try {
      const rows = mapAllocations(await aecResourceAllocations(twinId), entities);
      setAllocations(rows);
      return rows;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load allocations");
      return [];
    }
  }, [activeTwinId, twinEntities, loadTwinDetail]);

  const createResource = useCallback(
    async (input: {
      name: string;
      type: ResourceType;
      entityId: string;
      designation: string;
      department: string;
      costRate?: number;
      billRate?: number;
      contractExpiry?: string;
    }) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) {
        throw new Error("Select a live Enterprise Twin first");
      }
      const created = mapResource(
        await aecCreateResource(twinId, draftToCreateResourcePayload(input)),
        twinEntities
      );
      patchWorkspace((prev) => ({
        ...prev,
        resources: prev.resources.some((r) => r.id === created.id || r.resourceId === created.resourceId)
          ? prev.resources.map((r) =>
              r.id === created.id || r.resourceId === created.resourceId ? created : r
            )
          : [...prev.resources, created],
      }));
      return created;
    },
    [activeTwinId, twinEntities, patchWorkspace]
  );

  const updateResource = useCallback(
    async (resourceId: string, body: Record<string, unknown>) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) {
        throw new Error("Select a live Enterprise Twin first");
      }
      const updated = mapResource(await aecUpdateResource(twinId, resourceId, body), twinEntities);
      patchWorkspace((prev) => ({
        ...prev,
        resources: prev.resources.map((r) =>
          r.id === resourceId || r.resourceId === resourceId ? updated : r
        ),
      }));
      return updated;
    },
    [activeTwinId, twinEntities, patchWorkspace]
  );

  const archiveResource = useCallback(
    async (resourceId: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      try {
        await aecArchiveResource(twinId, resourceId);
        patchWorkspace((prev) => ({
          ...prev,
          resources: prev.resources.filter(
            (r) => r.id !== resourceId && r.resourceId !== resourceId
          ),
        }));
        await refreshResources();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Archive resource failed");
        throw e;
      }
    },
    [activeTwinId, patchWorkspace, refreshResources]
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

  const refreshLeave = useCallback(
    async (opts?: { scope?: "team" | "mine"; status?: string }) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) {
        setLeaveError(null);
        return;
      }
      setLeaveLoading(true);
      setLeaveError(null);
      try {
        const raw = await aecListLeaveRequests(twinId, {
          scope: opts?.scope ?? "team",
          status: opts?.status ?? "all",
        });
        const list = mapLeaveList(raw);
        setLeaveSummaryLive(mapLeaveSummaryFromList(list));
        patchWorkspace((prev) => ({ ...prev, leaveRequests: list }));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load leave";
        setLeaveError(message);
        toast.error(`Leave API: ${message}`);
      } finally {
        setLeaveLoading(false);
      }
    },
    [activeTwinId, patchWorkspace]
  );

  const submitLeaveRequest = useCallback(
    async (input: {
      startDate: string;
      endDate: string;
      leaveType: string;
      notes?: string;
      resourceId?: string;
    }) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) {
        throw new Error("Select a live Enterprise Twin first");
      }
      const created = mapLeaveRequest(
        await aecSubmitLeave(twinId, {
          startDate: input.startDate,
          endDate: input.endDate,
          leaveType: leaveTypeToApi(input.leaveType),
          notes: input.notes,
          resourceId: input.resourceId,
        })
      );
      patchWorkspace((prev) => ({
        ...prev,
        leaveRequests: [created, ...prev.leaveRequests.filter((l) => l.id !== created.id)],
      }));
      await refreshLeave();
    },
    [activeTwinId, patchWorkspace, refreshLeave]
  );

  const approveLeave = useCallback(
    async (id: string, notes?: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      try {
        await aecLeaveDecision(twinId, id, { action: "approve", notes });
        await refreshLeave();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Leave approve failed");
        throw e;
      }
    },
    [activeTwinId, refreshLeave]
  );

  const rejectLeave = useCallback(
    async (id: string, notes?: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      try {
        await aecLeaveDecision(twinId, id, { action: "reject", notes });
        await refreshLeave();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Leave reject failed");
        throw e;
      }
    },
    [activeTwinId, refreshLeave]
  );

  const loadOrgChart = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return null;
    setOrgChartLoading(true);
    setOrgChartError(null);
    try {
      const forest = mapOrgChartForest(await aecOrgChart(twinId));
      const root = wrapOrgForest(forest);
      setOrgChartRoot(root);
      return root;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load org chart";
      setOrgChartError(message);
      toast.error(`Org chart: ${message}`);
      return null;
    } finally {
      setOrgChartLoading(false);
    }
  }, [activeTwinId]);

  const loadReportLibrary = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return [];
    setReportsLoading(true);
    setReportsError(null);
    try {
      const items = mapReportsLibrary(await aecReportsLibrary(twinId));
      setReportLibraryLive(items);
      return items;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load reports";
      setReportsError(message);
      toast.error(`Reports: ${message}`);
      return [];
    } finally {
      setReportsLoading(false);
    }
  }, [activeTwinId]);

  const runReport = useCallback(
    async (reportId: string, query: Record<string, string> = {}) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return [];
      setReportsLoading(true);
      setReportsError(null);
      try {
        const raw = await aecRunReport(twinId, reportId, query);
        const rows = mapReportRows(reportId, raw);
        setReportRows(rows);
        return rows;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to run report";
        setReportsError(message);
        toast.error(`Report run: ${message}`);
        return [];
      } finally {
        setReportsLoading(false);
      }
    },
    [activeTwinId]
  );

  const loadMyDashboard = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return null;
    setDashboardsLoading(true);
    setDashboardsError(null);
    try {
      const view = mapMyDashboard(await aecMyDashboard(twinId));
      setMyDashboard(view);
      return view;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load my dashboard";
      setDashboardsError(message);
      toast.error(`Dashboard: ${message}`);
      return null;
    } finally {
      setDashboardsLoading(false);
    }
  }, [activeTwinId]);

  const loadExecutiveDashboard = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return null;
    setDashboardsLoading(true);
    setDashboardsError(null);
    try {
      const view = mapExecutiveDashboard(await aecExecutiveDashboard(twinId));
      setExecutiveDashboard(view);
      return view;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load executive dashboard";
      setDashboardsError(message);
      toast.error(`Executive dashboard: ${message}`);
      return null;
    } finally {
      setDashboardsLoading(false);
    }
  }, [activeTwinId]);

  const loadRateCardPendingRevisions = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return;
    try {
      const raw = await aecRateCardPendingRevisions(twinId);
      const list = (Array.isArray(raw) ? raw : []).map((row) => {
        const o = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
        return {
          id: String(o.id ?? ""),
          resourceId: String(o.resourceId ?? ""),
          resourceName: String(o.resourceName ?? ""),
          fromValue: String(o.fromValue ?? "—"),
          toValue: String(o.toValue ?? "—"),
          status: String(o.status ?? "Pending"),
        };
      });
      setRateCardPendingRevisions(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load pending revisions");
    }
  }, [activeTwinId]);

  const approveRateCard = useCallback(
    async (rateCardId: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      try {
        await aecApproveRateCard(twinId, rateCardId);
        await Promise.all([loadRateCards(), loadRateCardPendingRevisions()]);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Rate card approve failed");
        throw e;
      }
    },
    [activeTwinId, loadRateCards, loadRateCardPendingRevisions]
  );

  const createRateCardRevision = useCallback(
    async (input: {
      resourceId: string;
      effectiveDate: string;
      hourlyCostRate?: number;
      hourlyBillingRate?: number;
      dailyCostRate?: number;
      dailyBillingRate?: number;
      currency?: string;
      notes?: string;
    }) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) {
        throw new Error("Select a live Enterprise Twin first");
      }
      const body: Record<string, unknown> = {
        resourceId: input.resourceId,
        effectiveDate: input.effectiveDate,
        currency: input.currency ?? "GBP",
      };
      if (input.hourlyCostRate != null) body.hourlyCostRate = input.hourlyCostRate;
      if (input.hourlyBillingRate != null) body.hourlyBillingRate = input.hourlyBillingRate;
      if (input.dailyCostRate != null) body.dailyCostRate = input.dailyCostRate;
      if (input.dailyBillingRate != null) body.dailyBillingRate = input.dailyBillingRate;
      if (input.notes) body.notes = input.notes;
      await aecCreateRateCard(twinId, body);
      await Promise.all([loadRateCards(), loadRateCardPendingRevisions()]);
    },
    [activeTwinId, loadRateCards, loadRateCardPendingRevisions]
  );

  const loadRateCardSummary = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return null;
    try {
      const raw = (await aecRateCardSummary(twinId)) as Record<string, unknown>;
      return {
        inHouseRateCards: Number(raw.inHouseRateCards ?? 0) || 0,
        contractorRateCards: Number(raw.contractorRateCards ?? 0) || 0,
        freelancerRateCards: Number(raw.freelancerRateCards ?? 0) || 0,
        pendingRevisions: Number(raw.pendingRevisions ?? 0) || 0,
      };
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load rate card summary");
      return null;
    }
  }, [activeTwinId]);

  const loadRateCardExpiry = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return;
    try {
      const raw = await aecRateCardExpiryWatcher(twinId);
      setRateCardExpiry(
        (Array.isArray(raw) ? raw : []).map((row) => {
          const o = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
          return {
            id: String(o.id ?? ""),
            resourceName: String(o.resourceName ?? ""),
            contractEndDate: String(o.contractEndDate ?? ""),
            daysRemaining: Number(o.daysRemaining ?? 0) || 0,
          };
        })
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load expiry watcher");
    }
  }, [activeTwinId]);

  const loadRateCardHistory = useCallback(
    async (resourceId: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId) || !resourceId) return [];
      try {
        const raw = await aecRateCardHistory(twinId, resourceId);
        return Array.isArray(raw) ? raw : [];
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load rate card history");
        return [];
      }
    },
    [activeTwinId]
  );

  const loadHolidays = useCallback(
    async (year?: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      try {
        const raw = (await aecHolidays(twinId, year ? { year } : {})) as Record<string, unknown>;
        setHolidaysMeta({
          countryCode: String(raw.countryCode ?? ""),
          year: Number(raw.year ?? new Date().getFullYear()) || new Date().getFullYear(),
          publicHolidaysLeft: Number(raw.publicHolidaysLeft ?? 0) || 0,
          publicHolidaysTotal: Number(raw.publicHolidaysTotal ?? 0) || 0,
        });
        setHolidays(
          (Array.isArray(raw.holidays) ? raw.holidays : []).map((h) => {
            const o = h && typeof h === "object" ? (h as Record<string, unknown>) : {};
            return {
              date: String(o.date ?? ""),
              name: String(o.name ?? ""),
              year: Number(o.year ?? raw.year ?? 0) || 0,
            };
          })
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load holidays");
      }
    },
    [activeTwinId]
  );

  const loadReportFilters = useCallback(async () => {
    const twinId = activeTwinId;
    if (!twinId || !isApiTwinId(twinId)) return;
    try {
      const raw = (await aecReportFilters(twinId)) as Record<string, unknown>;
      setReportFilters({
        projects: (Array.isArray(raw.projects) ? raw.projects : []).map((p) => {
          const o = p && typeof p === "object" ? (p as Record<string, unknown>) : {};
          return { id: String(o.id ?? ""), name: String(o.name ?? "") };
        }),
        entities: (Array.isArray(raw.entities) ? raw.entities : []).map((e) => {
          const o = e && typeof e === "object" ? (e as Record<string, unknown>) : {};
          return {
            id: String(o.id ?? ""),
            name: String(o.name ?? ""),
            code: String(o.code ?? ""),
          };
        }),
        departments: (Array.isArray(raw.departments) ? raw.departments : []).map(String),
        resourceTypes: (Array.isArray(raw.resourceTypes) ? raw.resourceTypes : []).map((r) => {
          const o = r && typeof r === "object" ? (r as Record<string, unknown>) : {};
          return { value: String(o.value ?? ""), label: String(o.label ?? o.value ?? "") };
        }),
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load report filters");
    }
  }, [activeTwinId]);

  const createCustomReport = useCallback(
    async (input: { name: string; description?: string }) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      await aecCreateReport(twinId, input);
      await loadReportLibrary();
    },
    [activeTwinId, loadReportLibrary]
  );

  const createApBill = useCallback(
    async (input: {
      entityId: string;
      supplier: string;
      amount: number;
      currency?: string;
      dueDate?: string;
      reference?: string;
      notes?: string;
    }) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) {
        throw new Error("Select a live Enterprise Twin first");
      }
      await aecCreateAp(twinId, {
        entityId: input.entityId,
        supplier: input.supplier,
        amount: input.amount,
        currency: input.currency ?? "GBP",
        dueDate: input.dueDate,
        reference: input.reference,
        notes: input.notes,
      });
      await refreshAccounting();
    },
    [activeTwinId, refreshAccounting]
  );

  const markApPaid = useCallback(
    async (billId: string) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) return;
      try {
        await aecUpdateAp(twinId, billId, { status: "paid" });
        await refreshAccounting();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "AP update failed");
        throw e;
      }
    },
    [activeTwinId, refreshAccounting]
  );

  const createGlJournal = useCallback(
    async (input: {
      description: string;
      entityId?: string;
      date?: string;
      lines: { accountCode: string; accountName: string; debit?: number; credit?: number }[];
    }) => {
      const twinId = activeTwinId;
      if (!twinId || !isApiTwinId(twinId)) {
        throw new Error("Select a live Enterprise Twin first");
      }
      await aecCreateGlJournal(twinId, {
        description: input.description,
        entityId: input.entityId,
        date: input.date,
        lines: input.lines,
      });
      await refreshAccounting();
    },
    [activeTwinId, refreshAccounting]
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

  const metrics = useMemo(
    () => apiInquiryMetrics ?? computeInquiryMetrics(ws.inquiries),
    [apiInquiryMetrics, ws.inquiries]
  );
  const projectNames = useMemo(() => ws.projects.map((p) => p.name), [ws.projects]);

  const value = useMemo(
    () => ({
      activeTwin,
      activeTwinId,
      twins,
      twinDetail,
      isGenerating,
      twinGenerated,
      twinsLoading,
      twinDetailLoading,
      twinError,
      generateTwin,
      switchTwin,
      refreshTwins,
      loadTwinDetail,
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
      pipelineLoading,
      pipelineError,
      updateDraft,
      setDraftFromInquiry,
      resetDraft,
      setActiveProjectId,
      saveProjectFromDraft,
      refreshPipeline,
      generateInquiryProposal,
      generateInquiryQuotation,
      convertInquiryToProject,
      updateInquiryStage,
      createInquiry,
      deleteInquiry,
      updateProject,
      loadProjectWbs,
      generateProjectWbs,
      approveProjectWbs,
      loadProjectProfitability,
      resourcesLoading,
      resourcesError,
      resourceSummary,
      utilizationHeatmap,
      skillsMatrix,
      rateCards,
      allocations,
      refreshResources,
      loadSkillsMatrix,
      loadRateCards,
      loadAllocations,
      createResource,
      updateResource,
      archiveResource,
      timesheetsLoading,
      timesheetsError,
      timesheetSummary,
      timesheetWeekStart,
      setTimesheetWeekStart,
      refreshTimesheets,
      loadMyTimesheet,
      saveAndSubmitTimesheet,
      approveTimesheet,
      rejectTimesheet,
      bulkApproveTimesheets,
      decideApproval,
      expensesLoading,
      expensesError,
      expenseCategories,
      refreshExpenses,
      loadExpenseCategories,
      approveExpense,
      rejectExpense,
      submitExpense,
      leaveLoading,
      leaveError,
      leaveSummaryLive,
      refreshLeave,
      submitLeaveRequest,
      accountingLoading,
      accountingError,
      accountingSummary,
      apEntries,
      glEntries,
      payrollRows,
      payrollPeriod,
      taxRules,
      currencyIntelligence,
      refreshAccounting,
      refreshCurrency,
      loadTaxRules,
      previewInvoice,
      createInvoice,
      markInvoicePaid,
      chaseInvoice,
      escalateInvoice,
      processPayroll,
      refreshFxRates,
      addResource,
      handleAgentAction,
      approveLeave,
      rejectLeave,
      orgChartRoot,
      orgChartLoading,
      orgChartError,
      loadOrgChart,
      reportLibraryLive,
      reportRows,
      reportsLoading,
      reportsError,
      loadReportLibrary,
      runReport,
      myDashboard,
      executiveDashboard,
      dashboardsLoading,
      dashboardsError,
      loadMyDashboard,
      loadExecutiveDashboard,
      rateCardPendingRevisions,
      loadRateCardPendingRevisions,
      approveRateCard,
      createRateCardRevision,
      loadRateCardSummary,
      rateCardExpiry,
      loadRateCardExpiry,
      loadRateCardHistory,
      holidays,
      holidaysMeta,
      loadHolidays,
      reportFilters,
      loadReportFilters,
      createCustomReport,
      createApBill,
      markApPaid,
      createGlJournal,
      navBadges,
      inquiryMetrics: metrics,
      projectNames,
    }),
    [
      activeTwin,
      activeTwinId,
      twins,
      twinDetail,
      isGenerating,
      twinGenerated,
      twinsLoading,
      twinDetailLoading,
      twinError,
      generateTwin,
      switchTwin,
      refreshTwins,
      loadTwinDetail,
      ws,
      updateDraft,
      setDraftFromInquiry,
      resetDraft,
      setActiveProjectId,
      saveProjectFromDraft,
      pipelineLoading,
      pipelineError,
      refreshPipeline,
      generateInquiryProposal,
      generateInquiryQuotation,
      convertInquiryToProject,
      updateInquiryStage,
      createInquiry,
      deleteInquiry,
      updateProject,
      loadProjectWbs,
      generateProjectWbs,
      approveProjectWbs,
      loadProjectProfitability,
      resourcesLoading,
      resourcesError,
      resourceSummary,
      utilizationHeatmap,
      skillsMatrix,
      rateCards,
      allocations,
      refreshResources,
      loadSkillsMatrix,
      loadRateCards,
      loadAllocations,
      createResource,
      updateResource,
      archiveResource,
      timesheetsLoading,
      timesheetsError,
      timesheetSummary,
      timesheetWeekStart,
      refreshTimesheets,
      loadMyTimesheet,
      saveAndSubmitTimesheet,
      approveTimesheet,
      rejectTimesheet,
      bulkApproveTimesheets,
      decideApproval,
      expensesLoading,
      expensesError,
      expenseCategories,
      refreshExpenses,
      loadExpenseCategories,
      approveExpense,
      rejectExpense,
      submitExpense,
      leaveLoading,
      leaveError,
      leaveSummaryLive,
      refreshLeave,
      submitLeaveRequest,
      accountingLoading,
      accountingError,
      accountingSummary,
      apEntries,
      glEntries,
      payrollRows,
      payrollPeriod,
      taxRules,
      currencyIntelligence,
      refreshAccounting,
      refreshCurrency,
      loadTaxRules,
      previewInvoice,
      createInvoice,
      markInvoicePaid,
      chaseInvoice,
      escalateInvoice,
      processPayroll,
      refreshFxRates,
      addResource,
      handleAgentAction,
      approveLeave,
      rejectLeave,
      orgChartRoot,
      orgChartLoading,
      orgChartError,
      loadOrgChart,
      reportLibraryLive,
      reportRows,
      reportsLoading,
      reportsError,
      loadReportLibrary,
      runReport,
      myDashboard,
      executiveDashboard,
      dashboardsLoading,
      dashboardsError,
      loadMyDashboard,
      loadExecutiveDashboard,
      rateCardPendingRevisions,
      loadRateCardPendingRevisions,
      approveRateCard,
      createRateCardRevision,
      loadRateCardSummary,
      rateCardExpiry,
      loadRateCardExpiry,
      loadRateCardHistory,
      holidays,
      holidaysMeta,
      loadHolidays,
      reportFilters,
      loadReportFilters,
      createCustomReport,
      createApBill,
      markApPaid,
      createGlJournal,
      createInquiry,
      deleteInquiry,
      updateProject,
      updateResource,
      archiveResource,
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
    twins: app.twins,
    twinDetail: app.twinDetail,
    isGenerating: app.isGenerating,
    twinGenerated: app.twinGenerated,
    twinsLoading: app.twinsLoading,
    twinDetailLoading: app.twinDetailLoading,
    twinError: app.twinError,
    generateTwin: app.generateTwin,
    switchTwin: app.switchTwin,
    refreshTwins: app.refreshTwins,
    loadTwinDetail: app.loadTwinDetail,
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
    if (app.myDashboard) {
      return {
        ...app.myDashboard,
        teamUtilization: isManagerView
          ? app.myDashboard.teamUtilization.length
            ? app.myDashboard.teamUtilization
            : app.resources.slice(0, 5).map((r) => ({
                name: r.name,
                utilization: r.utilization,
                entity: r.entity,
              }))
          : [],
      };
    }

    const pendingTs = app.timesheetSubmissions.filter((t) => t.status === "Pending").length;
    const pendingExp = app.pendingExpenses.filter((e) => e.status === "Pending").length;
    const pendingLeave = app.leaveRequests.filter((l) => l.status === "Pending").length;

    return {
      utilizationPct: app.resourceSummary?.avgUtilization ?? 0,
      leaveBalanceDays: app.leaveSummaryLive?.avgBalanceDays ?? 0,
      myProjects: app.projects.slice(0, isManagerView ? 6 : 3).map((p) => ({
        name: p.name,
        role: isManagerView ? `PM: ${p.projectManager}` : "Team member",
        progress: p.progressPct,
        health: (p.health === "Critical" ? "At Risk" : p.health === "At Risk" ? "At Risk" : "Good") as
          | "Good"
          | "At Risk",
      })),
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
  }, [app, isManagerView]);
}

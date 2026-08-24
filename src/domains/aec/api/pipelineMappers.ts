import type { Inquiry, InquiryEntity, InquiryStage } from "@/domains/aec/data/inquiries";
import type {
  BillingType,
  Project,
  ProjectDraft,
  ProjectEntity,
  ProjectHealth,
  StaffRecommendation,
} from "@/domains/aec/data/projects";
import type { Milestone, WbsPhase, WbsProject } from "@/domains/aec/data/wbs";
import type { TwinEntity } from "@/domains/aec/data/meridian";

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

const STAGES: InquiryStage[] = [
  "Inquiry",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

function mapStage(raw: unknown): InquiryStage {
  const s = String(raw ?? "Inquiry");
  const hit = STAGES.find((x) => x.toLowerCase() === s.toLowerCase());
  return hit ?? "Inquiry";
}

function mapEntityCode(
  raw: unknown,
  entityId: string | undefined,
  twinEntities: TwinEntity[]
): string {
  if (entityId) {
    const byId = twinEntities.find((e) => e.id === entityId);
    if (byId?.code) return byId.code;
  }
  const rawStr = String(raw ?? "").trim();
  if (!rawStr) return twinEntities[0]?.code ?? "";
  // Short codes (MG, MA, …)
  if (rawStr.length <= 12 && !/\s/.test(rawStr)) {
    const upper = rawStr.toUpperCase();
    const byCode = twinEntities.find((e) => e.code.toUpperCase() === upper);
    return byCode?.code ?? upper;
  }
  // Full organization name from project list APIs
  const byName = twinEntities.find((e) => e.name.toLowerCase() === rawStr.toLowerCase());
  if (byName) return byName.code;
  return rawStr;
}

function mapHealth(raw: unknown): ProjectHealth {
  const s = String(raw ?? "Good");
  if (/critical/i.test(s)) return "Critical";
  if (/risk/i.test(s)) return "At Risk";
  return "Good";
}

function mapBilling(raw: unknown): BillingType {
  const s = String(raw ?? "Milestone");
  if (/lump|fixed/i.test(s)) return "Lump Sum";
  if (/t\s*&\s*m|t_and_m|tm/i.test(s)) return "T&M";
  return "Milestone";
}

export function mapInquiry(raw: unknown, twinEntities: TwinEntity[] = []): Inquiry {
  const o = asRecord(raw);
  const entityId = o.entityId != null ? String(o.entityId) : undefined;
  return {
    id: String(o.id ?? ""),
    client: String(o.client ?? o.clientName ?? ""),
    projectName: String(o.projectName ?? ""),
    entity: mapEntityCode(o.entity, entityId, twinEntities) as InquiryEntity,
    entityId,
    projectType: String(o.projectType ?? ""),
    stage: mapStage(o.stage),
    stageLabel: String(o.stageLabel ?? o.stage ?? "Inquiry"),
    score: Number(o.score ?? 0) || 0,
    valueGbp: Number(o.valueGbp ?? o.value ?? 0) || 0,
    valueDisplay: String(o.valueDisplay ?? "—"),
    contact: String(o.contact ?? o.contactName ?? ""),
    receivedDate: String(o.receivedDate ?? ""),
    suggestedAction: String(o.suggestedAction ?? ""),
  };
}

export function mapInquiryMetrics(raw: unknown) {
  const o = asRecord(raw);
  return {
    activeInquiries: Number(o.activeInquiries ?? 0) || 0,
    proposals: Number(o.proposals ?? 0) || 0,
    pipelineGbp: Number(o.pipelineGbp ?? 0) || 0,
    winRatePct: Number(o.winRatePct ?? 0) || 0,
  };
}

export function mapProject(raw: unknown, twinEntities: TwinEntity[] = []): Project {
  const o = asRecord(raw);
  const costs = asRecord(o.costs);
  const entityId = o.entityId != null ? String(o.entityId) : undefined;
  const currency = String(o.currency ?? "GBP");
  const budget = Number(o.budget ?? 0) || 0;
  const revenue = Number(o.revenue ?? 0) || 0;
  return {
    id: String(o.id ?? ""),
    name: String(o.name ?? ""),
    client: String(o.client ?? ""),
    entity: mapEntityCode(o.entity, entityId, twinEntities) as ProjectEntity,
    entityId,
    type: String(o.type ?? ""),
    billingType: mapBilling(o.billingType),
    currency,
    budget,
    budgetDisplay: String(o.budgetDisplay ?? (currency === "AED" ? `AED ${budget}` : `£${Math.round(budget / 1000)}K`)),
    revenue,
    revenueDisplay: String(o.revenueDisplay ?? (currency === "AED" ? `AED ${revenue}` : `£${Math.round(revenue / 1000)}K`)),
    health: mapHealth(o.health),
    marginPct: Number(o.marginPct ?? 0) || 0,
    progressPct: Number(o.progressPct ?? 0) || 0,
    projectManager: String(o.projectManager ?? "TBD"),
    costs: {
      employee: Number(costs.employee ?? 0) || 0,
      contractor: Number(costs.contractor ?? 0) || 0,
      freelancer: Number(costs.freelancer ?? 0) || 0,
      other: Number(costs.other ?? 0) || 0,
    },
  };
}

function mapPhaseStatus(raw: unknown): WbsPhase["status"] {
  const s = String(raw ?? "");
  if (/complete/i.test(s)) return "Complete";
  if (/progress/i.test(s)) return "In Progress";
  return "Not Started";
}

function mapMilestoneStatus(raw: unknown): Milestone["status"] {
  const s = String(raw ?? "");
  if (/complete/i.test(s)) return "Complete";
  if (/overdue/i.test(s)) return "Overdue";
  if (/risk/i.test(s)) return "At Risk";
  return "On Track";
}

export function mapWbs(raw: unknown): WbsProject {
  const o = asRecord(raw);
  const risk = asRecord(o.riskSignal);
  const phases = asArray(o.phases).map((p, i) => {
    const ph = asRecord(p);
    const tasks = asArray(ph.tasks).map((t, j) => {
      const task = asRecord(t);
      const children = asArray(task.children).map(String);
      return {
        id: String(task.id ?? `t-${i}-${j}`),
        name: String(task.name ?? "Task"),
        progress: Number(task.progress ?? 0) || 0,
        children: children.length ? children : undefined,
      };
    });
    return {
      id: String(ph.id ?? `ph-${i}`),
      name: String(ph.name ?? `Phase ${i + 1}`),
      status: mapPhaseStatus(ph.status),
      progress: Number(ph.progress ?? 0) || 0,
      budgetGbp: Number(ph.budgetGbp ?? ph.budget ?? 0) || 0,
      spentGbp: Number(ph.spentGbp ?? ph.spent ?? 0) || 0,
      tasks,
    } satisfies WbsPhase;
  });

  const milestones = asArray(o.milestones).map((m, i) => {
    const ms = asRecord(m);
    return {
      id: String(ms.id ?? `ms-${i}`),
      name: String(ms.name ?? "Milestone"),
      phase: String(ms.phase ?? ""),
      plannedDate: String(ms.plannedDate ?? ""),
      actualDate: ms.actualDate != null ? String(ms.actualDate) : null,
      varianceDays: Number(ms.varianceDays ?? 0) || 0,
      status: mapMilestoneStatus(ms.status),
    } satisfies Milestone;
  });

  const severityRaw = String(risk.severity ?? "Low");
  const severity: WbsProject["riskSignal"]["severity"] = /high/i.test(severityRaw)
    ? "High"
    : /medium/i.test(severityRaw)
      ? "Medium"
      : "Low";

  return {
    id: String(o.id ?? ""),
    name: String(o.name ?? "Project"),
    phases,
    milestones,
    riskSignal: {
      severity,
      title: String(risk.title ?? (o.status ? `WBS — ${o.status}` : "WBS")),
      message: String(risk.message ?? (phases.length ? `${phases.length} phases loaded from API.` : "No WBS phases yet. Generate a draft.")),
      recommendation: String(
        risk.recommendation ?? "Review phases and approve when ready."
      ),
    },
  };
}

export function mapRecommendations(raw: unknown): StaffRecommendation[] {
  const o = asRecord(raw);
  const buckets = Object.values(o);
  const out: StaffRecommendation[] = [];
  for (const bucket of buckets) {
    for (const item of asArray(bucket)) {
      const r = asRecord(item);
      out.push({
        name: String(r.name ?? r.fullName ?? "Candidate"),
        role: String(r.role ?? r.designation ?? "Team"),
        score: Number(r.score ?? 0) || 0,
        rationale: String(r.rationale ?? r.reason ?? ""),
      });
    }
  }
  return out;
}

export function draftToCreatePayload(draft: ProjectDraft): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: draft.name,
    client: draft.client,
    entity: draft.entity,
    type: draft.type,
    billingType: draft.billingType,
    currency: draft.currency,
    budget: draft.budget,
    startDate: draft.startDate || null,
    endDate: draft.endDate || null,
  };
  if (draft.projectManagerId) payload.projectManagerId = draft.projectManagerId;
  return payload;
}

export interface ProfitabilityView {
  project: Project;
  statement: { line: string; amount: number; type: "revenue" | "cost" | "total" | "margin" }[];
  costLogic: { resource: string; rate: string; hours?: number; days?: number; total: string; logic: string }[];
  recommendations: { scenario: string; recommendation: string; saving: string; reason: string }[];
}

export function mapProfitability(raw: unknown, twinEntities: TwinEntity[] = []): ProfitabilityView {
  const o = asRecord(raw);
  const project = mapProject(o.project ?? {}, twinEntities);
  const statement = asArray(o.statement).map((line) => {
    const l = asRecord(line);
    const typeRaw = String(l.type ?? "cost");
    const type =
      typeRaw === "revenue" || typeRaw === "total" || typeRaw === "margin" ? typeRaw : "cost";
    return {
      line: String(l.line ?? ""),
      amount: Number(l.amount ?? 0) || 0,
      type: type as "revenue" | "cost" | "total" | "margin",
    };
  });
  const costLogic = asArray(o.costLogic).map((row) => {
    const r = asRecord(row);
    return {
      resource: String(r.resource ?? ""),
      rate: String(r.rate ?? ""),
      hours: r.hours != null ? Number(r.hours) : undefined,
      days: r.days != null ? Number(r.days) : undefined,
      total: String(r.total ?? ""),
      logic: String(r.logic ?? ""),
    };
  });
  const recommendations = asArray(o.recommendations).map((row) => {
    const r = asRecord(row);
    return {
      scenario: String(r.scenario ?? ""),
      recommendation: String(r.recommendation ?? ""),
      saving: String(r.saving ?? ""),
      reason: String(r.reason ?? ""),
    };
  });
  return { project, statement, costLogic, recommendations };
}

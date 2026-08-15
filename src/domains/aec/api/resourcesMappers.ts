import type { TwinEntity } from "@/domains/aec/data/meridian";
import type { ResourceType } from "@/domains/aec/data/orgChart";
import type {
  CrossEntityAllocation,
  ResourceRecord,
  UtilizationStatus,
} from "@/domains/aec/data/resources";

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

export function mapResourceType(raw: unknown): ResourceType {
  const s = String(raw ?? "").toUpperCase();
  if (s.includes("CONTRACT")) return "CONTRACTOR";
  if (s.includes("FREE")) return "FREELANCER";
  return "IN-HOUSE";
}

function mapUtilizationStatus(raw: unknown): UtilizationStatus {
  const s = String(raw ?? "");
  if (/over/i.test(s)) return "Over";
  if (/risk/i.test(s)) return "At Risk";
  if (/bench/i.test(s)) return "Bench";
  return "Good";
}

function formatRate(amount: unknown, currency: unknown, per: "hr" | "day" = "hr"): string {
  if (amount == null || amount === "") return "—";
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  const cur = String(currency ?? "GBP").toUpperCase();
  const symbol = cur === "GBP" ? "£" : cur === "EUR" ? "€" : cur === "AED" ? "AED " : "$";
  return `${symbol}${n}/${per}`;
}

function entityCode(
  entityNameOrCode: unknown,
  entityId: string | undefined,
  twinEntities: TwinEntity[]
): string {
  if (entityId) {
    const byId = twinEntities.find((e) => e.id === entityId);
    if (byId?.code) return byId.code;
  }
  const raw = String(entityNameOrCode ?? "").trim();
  if (!raw) return twinEntities[0]?.code ?? "";
  if (raw.length <= 12 && !/\s/.test(raw)) return raw.toUpperCase();
  const byName = twinEntities.find((e) => e.name.toLowerCase() === raw.toLowerCase());
  return byName?.code ?? raw;
}

export function mapResource(raw: unknown, twinEntities: TwinEntity[] = []): ResourceRecord {
  const o = asRecord(raw);
  const entityId = o.entityId != null ? String(o.entityId) : undefined;
  const type = mapResourceType(o.type);
  const currency = o.currency;
  return {
    id: String(o.id ?? o.resourceId ?? ""),
    resourceId: o.resourceId != null ? String(o.resourceId) : undefined,
    name: String(o.name ?? ""),
    type,
    entity: entityCode(o.entity, entityId, twinEntities),
    entityId,
    designation: String(o.designation ?? ""),
    department: String(o.department ?? ""),
    costRate: formatRate(o.costRate, currency, type === "CONTRACTOR" ? "day" : "hr"),
    billRate: formatRate(o.billRate, currency, type === "CONTRACTOR" ? "day" : "hr"),
    utilization: Number(o.utilization ?? 0) || 0,
    status: mapUtilizationStatus(o.status),
    projects: asArray(o.projects).map(String),
  };
}

export interface ResourceSummaryView {
  inHouse: number;
  contractors: number;
  freelancers: number;
  avgUtilization: number;
  capacityRisk: number;
  benchCount: number;
}

export function mapResourceSummary(raw: unknown): ResourceSummaryView {
  const o = asRecord(raw);
  return {
    inHouse: Number(o.inHouse ?? 0) || 0,
    contractors: Number(o.contractors ?? 0) || 0,
    freelancers: Number(o.freelancers ?? 0) || 0,
    avgUtilization: Number(o.avgUtilization ?? 0) || 0,
    capacityRisk: Number(o.capacityRisk ?? 0) || 0,
    benchCount: Number(o.benchCount ?? 0) || 0,
  };
}

export interface UtilizationHeatmapView {
  weeks: string[];
  rows: { name: string; entity?: string; values: number[] }[];
}

export function mapUtilization(raw: unknown): UtilizationHeatmapView {
  const o = asRecord(raw);
  return {
    weeks: asArray(o.weeks).map(String),
    rows: asArray(o.rows).map((row) => {
      const r = asRecord(row);
      return {
        name: String(r.name ?? ""),
        entity: r.entity != null ? String(r.entity) : undefined,
        values: asArray(r.values).map((v) => Number(v) || 0),
      };
    }),
  };
}

export function mapAllocations(
  raw: unknown,
  twinEntities: TwinEntity[] = []
): CrossEntityAllocation[] {
  return asArray(raw).map((row) => {
    const o = asRecord(row);
    const homeId = o.homeEntityId != null ? String(o.homeEntityId) : undefined;
    const allocId = o.allocatedEntityId != null ? String(o.allocatedEntityId) : undefined;
    const pct = Number(o.allocationPct ?? 0) || 0;
    const project = String(o.project ?? "");
    const allocatedEntity = entityCode(o.allocatedEntity, allocId, twinEntities);
    return {
      id: o.id != null ? String(o.id) : undefined,
      resource: String(o.resource ?? ""),
      type: mapResourceType(o.type ?? "employee"),
      homeEntity: entityCode(o.homeEntity, homeId, twinEntities),
      allocatedTo: project
        ? `${allocatedEntity} · ${String(o.period ?? project)}`
        : allocatedEntity,
      allocationPct: pct,
      costSplitHome: Math.max(0, 100 - pct),
      costSplitHost: pct,
    };
  });
}

export interface SkillsMatrixView {
  byEntity: { entity: string; skills: string[]; coverage: number }[];
  individuals: {
    name: string;
    role: string;
    entity: string;
    skills: { name: string; rating: number }[];
  }[];
}

export function mapSkillsMatrix(raw: unknown): SkillsMatrixView {
  const o = asRecord(raw);
  return {
    byEntity: asArray(o.byEntity).map((row) => {
      const r = asRecord(row);
      return {
        entity: String(r.entity ?? ""),
        skills: asArray(r.skills).map(String),
        coverage: Number(r.coverage ?? 0) || 0,
      };
    }),
    individuals: asArray(o.individuals).map((row) => {
      const r = asRecord(row);
      return {
        name: String(r.name ?? ""),
        role: String(r.role ?? ""),
        entity: String(r.entity ?? ""),
        skills: asArray(r.skills).map((s) => {
          const sk = asRecord(s);
          return { name: String(sk.name ?? ""), rating: Number(sk.rating ?? 0) || 0 };
        }),
      };
    }),
  };
}

export interface RateCardView {
  id: string;
  role: string;
  entity: string;
  type: ResourceType;
  costRate: string;
  billRate: string;
  currency: string;
  effectiveFrom: string;
  status: string;
}

export function mapRateCards(raw: unknown, twinEntities: TwinEntity[] = []): RateCardView[] {
  return asArray(raw).map((row) => {
    const o = asRecord(row);
    const entityId = o.entityId != null ? String(o.entityId) : undefined;
    const type = mapResourceType(o.type);
    const currency = String(o.currency ?? "GBP");
    return {
      id: String(o.id ?? ""),
      role: String(o.role ?? ""),
      entity: entityCode(o.entity, entityId, twinEntities),
      type,
      costRate: formatRate(o.costRate, currency, type === "CONTRACTOR" ? "day" : "hr"),
      billRate: formatRate(o.billRate, currency, type === "CONTRACTOR" ? "day" : "hr"),
      currency,
      effectiveFrom: String(o.effectiveFrom ?? ""),
      status: String(o.status ?? "Active"),
    };
  });
}

export function draftToCreateResourcePayload(input: {
  name: string;
  type: ResourceType;
  entityId: string;
  designation: string;
  department: string;
  costRate?: number;
  billRate?: number;
  contractExpiry?: string;
}): Record<string, unknown> {
  return {
    name: input.name,
    type: input.type,
    entityId: input.entityId,
    designation: input.designation,
    department: input.department,
    ...(input.costRate != null ? { costRate: input.costRate } : {}),
    ...(input.billRate != null ? { billRate: input.billRate } : {}),
    ...(input.contractExpiry ? { contractExpiry: input.contractExpiry } : {}),
  };
}

export interface SkillOverviewCategory {
  id: string;
  title: string;
  entityCode?: string;
  skills: { name: string; skillId: string; resources: number; available: number; utilPct: number }[];
}

export interface SkillsOverviewView {
  categories: SkillOverviewCategory[];
}

export function mapSkillsOverview(raw: unknown): SkillsOverviewView {
  const o = asRecord(raw);
  return {
    categories: asArray(o.categories).map((item) => {
      const c = asRecord(item);
      return {
        id: String(c.id ?? ""),
        title: String(c.title ?? ""),
        entityCode: c.entityCode != null ? String(c.entityCode) : undefined,
        skills: asArray(c.skills).map((sk) => {
          const s = asRecord(sk);
          return {
            name: String(s.name ?? ""),
            skillId: String(s.skillId ?? ""),
            resources: Number(s.resources ?? 0) || 0,
            available: Number(s.available ?? 0) || 0,
            utilPct: Number(s.utilPct ?? 0) || 0,
          };
        }),
      };
    }),
  };
}

export interface SkillsFullMatrixView {
  legend: { rating: number; label: string }[];
  groups: {
    id: string;
    label: string;
    columns: { key: string; label: string; skillId: string }[];
  }[];
  people: {
    resourceId: string;
    name: string;
    role: string;
    employmentType: string;
    entityCode: string;
    ratings: Record<string, number | null | undefined>;
  }[];
}

export function mapSkillsFullMatrix(raw: unknown): SkillsFullMatrixView {
  const o = asRecord(raw);
  return {
    legend: asArray(o.legend).map((item) => {
      const l = asRecord(item);
      return { rating: Number(l.rating ?? 0) || 0, label: String(l.label ?? "") };
    }),
    groups: asArray(o.groups).map((item) => {
      const g = asRecord(item);
      return {
        id: String(g.id ?? ""),
        label: String(g.label ?? ""),
        columns: asArray(g.columns).map((col) => {
          const c = asRecord(col);
          return {
            key: String(c.key ?? ""),
            label: String(c.label ?? ""),
            skillId: String(c.skillId ?? ""),
          };
        }),
      };
    }),
    people: asArray(o.people).map((item) => {
      const p = asRecord(item);
      const ratingsRaw = asRecord(p.ratings);
      const ratings: Record<string, number | null> = {};
      for (const [k, v] of Object.entries(ratingsRaw)) {
        ratings[k] = v == null ? null : Number(v) || 0;
      }
      return {
        resourceId: String(p.resourceId ?? ""),
        name: String(p.name ?? ""),
        role: String(p.role ?? ""),
        employmentType: String(p.employmentType ?? ""),
        entityCode: String(p.entityCode ?? ""),
        ratings,
      };
    }),
  };
}

export interface SkillReviewItem {
  id: string;
  resourceId: string;
  resourceName: string;
  skillName: string;
  matchedSkillId: string | null;
  suggestedRating: number;
  source: string;
  status: string;
}

export function mapSkillReviewQueue(raw: unknown): SkillReviewItem[] {
  return asArray(raw).map((item) => {
    const o = asRecord(item);
    return {
      id: String(o.id ?? ""),
      resourceId: String(o.resourceId ?? ""),
      resourceName: String(o.resourceName ?? ""),
      skillName: String(o.skillName ?? ""),
      matchedSkillId: o.matchedSkillId != null ? String(o.matchedSkillId) : null,
      suggestedRating: Number(o.suggestedRating ?? 3) || 3,
      source: String(o.source ?? ""),
      status: String(o.status ?? "Pending"),
    };
  });
}

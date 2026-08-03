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
      resource: String(o.resource ?? ""),
      type: "IN-HOUSE" as ResourceType,
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

import type { GeneratedAgent } from "@/domains/aec/data/agents";
import type { ConnectorMapping } from "@/domains/aec/data/connectors";
import type { LayerSummary } from "@/domains/aec/data/enterpriseTwin";
import type { KpiItem } from "@/domains/aec/data/kpis";
import type { EnterpriseTwinSummary, TwinEntity, TwinStatus } from "@/domains/aec/data/meridian";

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function mapStatus(raw: unknown): TwinStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s === "published") return "Live";
  if (s === "archived" || s === "failed" || s === "inactive") return "Inactive";
  return "Draft";
}

function mapEntityStatus(raw: unknown): TwinEntity["status"] {
  const s = String(raw ?? "").toLowerCase();
  if (s === "at_risk" || s === "at risk") return "At Risk";
  if (s === "pending" || s === "draft") return "Pending";
  return "Active";
}

function mapEntity(raw: unknown, index: number): TwinEntity {
  const o = asRecord(raw);
  const id = String(o.id ?? o.code ?? `entity-${index}`);
  return {
    id,
    code: String(o.code ?? id).slice(0, 8).toUpperCase(),
    name: String(o.name ?? "Entity"),
    staffCount: Number(o.staff_count ?? o.staffCount ?? 0) || 0,
    region: String(o.country_code ?? o.country ?? o.region ?? "—"),
    currency: String(o.currency_code ?? o.currency ?? "USD"),
    status: mapEntityStatus(o.status),
  };
}

function formatMoney(amount: number, currency = "USD"): string {
  if (!Number.isFinite(amount) || amount === 0) return `${currency === "GBP" ? "£" : "$"}0`;
  if (Math.abs(amount) >= 1000) {
    const prefix = currency === "GBP" ? "£" : "$";
    return `${prefix}${Math.round(amount / 1000)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "GBP" ? "GBP" : "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const EMPTY_TWIN: EnterpriseTwinSummary = {
  id: "",
  name: "No twin selected",
  status: "Draft",
  staffCount: 0,
  projectCount: 0,
  entities: [],
  prompt: "",
  reportingCurrency: "USD",
  description: "",
};

export interface TwinGovernanceView {
  sharedResources: boolean;
  sharedSkillMatrix: boolean;
  sharedRateCardEngine: boolean;
  reportingCurrency: string;
}

export interface TwinHierarchyRow {
  level: string;
  headcount: number;
}

export interface TwinResourceBreakdown {
  inHouse: number;
  contractor: number;
  freelancer: number;
}

export interface TwinSkillCategoryView {
  name: string;
  domain: string;
  skills: string[];
}

export interface TwinComplianceView {
  region: string;
  requirement: string;
  status: string;
}

export interface TwinMetadataView {
  version: string;
  status: string;
  lastGenerated: string;
  reportingCurrency: string;
  entities: number;
  totalStaff: number;
  activeProjects: number;
  agentsGenerated: number;
  connectorsMapped: number;
  kpis: number;
  layers: string[];
}

export interface TwinDetailView {
  summary: EnterpriseTwinSummary;
  layers: LayerSummary[];
  governance: TwinGovernanceView;
  orgHierarchy: TwinHierarchyRow[];
  resourceBreakdown: TwinResourceBreakdown;
  connectors: ConnectorMapping[];
  kpis: KpiItem[];
  agents: GeneratedAgent[];
  skillCategories: TwinSkillCategoryView[];
  compliance: TwinComplianceView[];
  metadata: TwinMetadataView;
}

const LAYER_META: Record<
  LayerSummary["id"],
  Pick<LayerSummary, "title" | "subtitle" | "linkTo" | "linkLabel">
> = {
  org: {
    title: "Organizational Layer",
    subtitle: "Hierarchy, entities, and reporting structure",
    linkTo: "/org-chart",
    linkLabel: "Open Org Chart →",
  },
  resource: {
    title: "Resource Layer",
    subtitle: "Staff, contractors, utilization, and capacity",
    linkTo: "/resources/planning",
    linkLabel: "Open Resource Planning →",
  },
  financial: {
    title: "Financial Layer",
    subtitle: "Margins, cost composition, and multi-currency",
    linkTo: "/accounting",
    linkLabel: "Open Accounting →",
  },
  operational: {
    title: "Operational Layer",
    subtitle: "Projects, delivery, and cross-entity work",
    linkTo: "/projects/profitability",
    linkLabel: "View Profitability →",
  },
};

/** Map GET /api/twins list item → UI summary (sparse until detail loaded). */
export function mapTwinListItem(raw: unknown): EnterpriseTwinSummary {
  const o = asRecord(raw);
  return {
    id: String(o.id ?? ""),
    name: String(o.name ?? "Enterprise Twin"),
    status: mapStatus(o.status),
    staffCount: 0,
    projectCount: 0,
    entities: [],
    prompt: "",
    generatedAt: o.created_at != null ? String(o.created_at) : undefined,
    reportingCurrency: "USD",
    description: `Status: ${String(o.status ?? "draft")} · v${String(o.version ?? 1)}`,
  };
}

/** Map twin preview / summary payload → full UI summary. */
export function mapTwinDetail(raw: unknown): EnterpriseTwinSummary {
  const o = asRecord(raw);
  const governance = asRecord(o.governance);
  const resource = asRecord(o.resource_summary);
  const counts = asRecord(o.counts);
  const draft = asRecord(o.draft);
  const entitiesRaw = Array.isArray(o.entities)
    ? o.entities
    : Array.isArray(draft.entities)
      ? draft.entities
      : [];
  const entities = entitiesRaw.map(mapEntity);
  const staffFromEntities = entities.reduce((sum, e) => sum + e.staffCount, 0);
  const staffFromResource =
    Number(resource.in_house ?? 0) +
    Number(resource.contractor ?? 0) +
    Number(resource.freelancer ?? 0);

  return {
    id: String(o.id ?? ""),
    name: String(o.name ?? "Enterprise Twin"),
    status: mapStatus(o.status),
    staffCount: staffFromEntities || staffFromResource || Number(counts.entities ?? 0) || 0,
    projectCount:
      Number(counts.business_functions ?? 0) ||
      Number(asRecord(o.operational).active_projects ?? 0) ||
      0,
    entities,
    prompt: String(o.prompt_text ?? o.prompt ?? ""),
    generatedAt:
      o.published_at != null
        ? String(o.published_at)
        : o.created_at != null
          ? String(o.created_at)
          : undefined,
    reportingCurrency: String(governance.reporting_currency ?? "USD") || "USD",
    description: String(o.prompt_text ?? "").slice(0, 160) || `Twin ${String(o.status ?? "draft")}`,
  };
}

export function mapTwinLayers(raw: unknown, currency = "USD"): LayerSummary[] {
  const o = asRecord(raw);
  const org = asRecord(o.organization);
  const resource = asRecord(o.resource);
  const financial = asRecord(o.financial);
  const operational = asRecord(o.operational);

  return [
    {
      id: "org",
      ...LAYER_META.org,
      metrics: [
        { label: "Hierarchy Levels", value: String(Number(org.reporting_levels ?? 0) || 0) },
        { label: "Org Units", value: String(Number(org.org_units ?? 0) || 0) },
        {
          label: "Entities",
          value: String(Number(org.resource_distribution_entities ?? 0) || 0),
        },
      ],
    },
    {
      id: "resource",
      ...LAYER_META.resource,
      metrics: [
        {
          label: "Avg Utilization",
          value: `${Number(resource.avg_utilization_pct ?? 0) || 0}%`,
        },
        { label: "On Bench", value: String(Number(resource.bench_available ?? 0) || 0) },
        {
          label: "Over-Allocated",
          value: String(Number(resource.capacity_risk_over_alloc ?? 0) || 0),
        },
      ],
    },
    {
      id: "financial",
      ...LAYER_META.financial,
      metrics: [
        {
          label: "Group Margin",
          value: `${Number(financial.group_gross_margin_pct ?? 0) || 0}%`,
        },
        {
          label: "Employee Cost",
          value: formatMoney(Number(financial.employee_cost_monthly ?? 0) || 0, currency),
        },
        {
          label: "Contractor Cost",
          value: formatMoney(Number(financial.contractor_cost_monthly ?? 0) || 0, currency),
        },
      ],
    },
    {
      id: "operational",
      ...LAYER_META.operational,
      metrics: [
        {
          label: "Active Projects",
          value: String(Number(operational.active_projects ?? 0) || 0),
        },
        {
          label: "Cross-Entity",
          value: String(Number(operational.cross_entity_projects ?? 0) || 0),
        },
        {
          label: "Unmet Roles",
          value: String(Number(operational.unmet_resource_demand_roles ?? 0) || 0),
        },
      ],
    },
  ];
}

function mapConnectors(raw: unknown): ConnectorMapping[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item, i) => {
    const o = asRecord(item);
    const mappings = Array.isArray(o.mappings) ? o.mappings : [null];
    return mappings.map((m, j) => {
      const map = asRecord(m);
      const statusRaw = String(map.status ?? o.status ?? "Pending");
      const status: ConnectorMapping["status"] =
        /live|active|ok/i.test(statusRaw)
          ? "Live"
          : /partial/i.test(statusRaw)
            ? "Partial"
            : "Pending";
      const entities = Array.isArray(map.entity_codes)
        ? map.entity_codes.map(String).join(" · ")
        : "—";
      return {
        id: `${String(o.source_system ?? "src")}-${i}-${j}`,
        source: String(o.source_system ?? "Source"),
        connector: String(o.connector_type ?? "Connector"),
        targetModule: String(map.target_module ?? "—"),
        status,
        entities: entities || "—",
        lastSync: "—",
        coverage: map.coverage_pct != null ? `${map.coverage_pct}%` : "—",
        recordsMapped: 0,
      };
    });
  });
}

const KPI_CATEGORY_LABELS: Record<string, string> = {
  financial: "Financial KPIs",
  project: "Project KPIs",
  people: "People KPIs",
  agent: "Agent KPIs",
};

function mapKpis(raw: unknown): KpiItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const o = asRecord(item);
    const category = String(o.category ?? "general").toLowerCase();
    const description = String(o.description ?? "").trim();
    const target = o.target != null && String(o.target) !== "" ? String(o.target) : "";
    const actual =
      o.actual != null && String(o.actual) !== ""
        ? String(o.actual)
        : o.value != null && String(o.value) !== ""
          ? String(o.value)
          : "";
    return {
      id: `kpi-${i}-${String(o.name ?? i)}`,
      name: String(o.name ?? "KPI"),
      category,
      categoryLabel: KPI_CATEGORY_LABELS[category] ?? `${category.charAt(0).toUpperCase()}${category.slice(1)} KPIs`,
      description: description || undefined,
      target,
      actual,
      status: "On Track",
      layer: category,
    };
  });
}

function mapAgents(raw: unknown): GeneratedAgent[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const o = asRecord(item);
    const statusRaw = String(o.status ?? "Draft");
    const status: GeneratedAgent["status"] = /active|live/i.test(statusRaw)
      ? "Active"
      : /pause/i.test(statusRaw)
        ? "Paused"
        : "Draft";
    return {
      id: `agent-${i}-${String(o.name ?? i)}`,
      name: String(o.name ?? "Agent"),
      trigger: String(o.type ?? "Event-driven"),
      layer: String(o.type ?? "Operational"),
      status,
      lastRun: "—",
      confidence: 0,
    };
  });
}

function mapSkillCategories(raw: unknown): TwinSkillCategoryView[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const o = asRecord(item);
    const skills = Array.isArray(o.skills) ? o.skills.map(String) : [];
    return {
      name: String(o.name ?? "Category"),
      domain: String(o.domain ?? "—"),
      skills,
    };
  });
}

function mapCompliance(raw: unknown): TwinComplianceView[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const o = asRecord(item);
    return {
      region: String(o.region ?? o.country ?? "—"),
      requirement: String(o.requirement ?? o.name ?? o.type ?? "Requirement"),
      status: String(o.status ?? "Pending"),
    };
  });
}

function mapOrgHierarchy(raw: unknown): TwinHierarchyRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const o = asRecord(item);
    return {
      level: String(o.level ?? o.level_name ?? "Level"),
      headcount: Number(o.headcount ?? 0) || 0,
    };
  });
}

/** Combine twin summary/preview (+ optional layers response) into UI bundle. */
export function mapTwinDetailView(detailRaw: unknown, layersRaw?: unknown): TwinDetailView {
  const summary = mapTwinDetail(detailRaw);
  const o = asRecord(detailRaw);
  const draft = asRecord(o.draft);
  const governanceRaw = asRecord(o.governance ?? draft.governance);
  const resourceRaw = asRecord(o.resource_summary ?? draft.resource_summary);
  const counts = asRecord(o.counts);
  const currency = summary.reportingCurrency || "USD";

  const layers =
    layersRaw != null
      ? mapTwinLayers(layersRaw, currency)
      : mapTwinLayers(
          {
            organization: {
              reporting_levels: Array.isArray(o.org_hierarchy)
                ? o.org_hierarchy.length
                : Array.isArray(draft.org_hierarchy)
                  ? draft.org_hierarchy.length
                  : 0,
              org_units: summary.entities.length,
              resource_distribution_entities: summary.entities.length,
            },
            resource: {
              total_staff: summary.staffCount,
              in_house: Number(resourceRaw.in_house ?? 0) || 0,
              contractor: Number(resourceRaw.contractor ?? 0) || 0,
              freelancer: Number(resourceRaw.freelancer ?? 0) || 0,
              avg_utilization_pct: 0,
              bench_available: 0,
              capacity_risk_over_alloc: 0,
            },
            financial: {
              group_gross_margin_pct: 0,
              employee_cost_monthly: 0,
              contractor_cost_monthly: 0,
            },
            operational: {
              active_projects: summary.projectCount,
              cross_entity_projects: 0,
              unmet_resource_demand_roles: 0,
            },
          },
          currency
        );

  const connectors = mapConnectors(o.connectors ?? draft.connectors);
  const kpis = mapKpis(o.kpis ?? draft.kpis);
  const agents = mapAgents(o.agents ?? draft.agents);
  const skillCategories = mapSkillCategories(o.skill_categories ?? draft.skill_categories);
  const compliance = mapCompliance(o.compliance ?? draft.compliance);
  const orgHierarchy = mapOrgHierarchy(o.org_hierarchy ?? draft.org_hierarchy);

  return {
    summary,
    layers,
    governance: {
      sharedResources: Boolean(governanceRaw.shared_resources),
      sharedSkillMatrix: Boolean(governanceRaw.shared_skill_matrix),
      sharedRateCardEngine: Boolean(governanceRaw.shared_rate_card_engine),
      reportingCurrency: String(governanceRaw.reporting_currency ?? currency) || currency,
    },
    orgHierarchy,
    resourceBreakdown: {
      inHouse: Number(resourceRaw.in_house ?? 0) || 0,
      contractor: Number(resourceRaw.contractor ?? 0) || 0,
      freelancer: Number(resourceRaw.freelancer ?? 0) || 0,
    },
    connectors,
    kpis,
    agents,
    skillCategories,
    compliance,
    metadata: {
      version: String(o.version ?? o.schema_version ?? "1"),
      status: String(o.status ?? summary.status),
      lastGenerated: summary.generatedAt ?? "—",
      reportingCurrency: currency,
      entities: summary.entities.length || Number(counts.entities ?? 0) || 0,
      totalStaff: summary.staffCount,
      activeProjects: summary.projectCount || Number(counts.business_functions ?? 0) || 0,
      agentsGenerated: agents.length || Number(counts.ai_agents ?? 0) || 0,
      connectorsMapped: connectors.length || Number(counts.source_systems ?? 0) || 0,
      kpis: kpis.length || Number(counts.kpis ?? 0) || 0,
      layers: ["Organizational", "Resource", "Financial", "Operational"],
    },
  };
}

export function resolveTenantIdFromUser(tenant: Record<string, unknown> | null | undefined): string | null {
  if (!tenant) return null;
  const id = tenant.tenant_id ?? tenant.id;
  if (id == null || String(id).trim() === "") return null;
  return String(id);
}

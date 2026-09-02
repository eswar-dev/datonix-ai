export interface ComplianceRuleView {
  id: string;
  code: string;
  region: string;
  requirement: string;
  description: string;
  status: string;
  entityCode: string;
  entityName: string;
  jurisdiction: string;
  autoApply: boolean;
  moduleKey: string;
  moduleLabel: string;
  enforcement: string;
}

export interface ComplianceEntityView {
  code: string;
  name: string;
}

export interface ComplianceJurisdictionView {
  code: string;
  label: string;
  entityCodes: string[];
  entityNames: ComplianceEntityView[];
  rules: ComplianceRuleView[];
}

export interface ComplianceGapView {
  jurisdiction: string;
  ruleCode: string;
  message: string;
}

export interface ComplianceSummaryView {
  totalRules: number;
  activeRules: number;
  jurisdictionCount: number;
  entityCount: number;
  coveragePct: number;
  gaps: ComplianceGapView[];
}

export interface ComplianceLayerView {
  status: string;
  summary: ComplianceSummaryView;
  jurisdictions: ComplianceJurisdictionView[];
  rules: ComplianceRuleView[];
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function mapRule(raw: unknown, regionFallback = "—"): ComplianceRuleView {
  const r = asRecord(raw);
  const jurisdiction = String(r.jurisdiction ?? regionFallback);
  return {
    id: String(r.id ?? r.code ?? ""),
    code: String(r.code ?? ""),
    region: jurisdiction,
    requirement: String(r.title ?? r.code ?? "Rule"),
    description: String(r.description ?? ""),
    status: String(r.status ?? "active"),
    entityCode: String(r.entityCode ?? ""),
    entityName: String(r.entityName ?? ""),
    jurisdiction,
    autoApply: Boolean(r.autoApply ?? r.status === "active"),
    moduleKey: String(r.moduleKey ?? "compliance_layer"),
    moduleLabel: String(r.moduleLabel ?? "Compliance Layer"),
    enforcement: String(r.enforcement ?? "Monitored by compliance layer"),
  };
}

function emptySummary(): ComplianceSummaryView {
  return {
    totalRules: 0,
    activeRules: 0,
    jurisdictionCount: 0,
    entityCount: 0,
    coveragePct: 0,
    gaps: [],
  };
}

/** Map full compliance layer API / twin payload into structured SaaS view. */
export function mapComplianceLayerView(raw: unknown): ComplianceLayerView {
  const root = asRecord(raw);
  const summaryRaw = asRecord(root.summary);
  const jurisdictionsRaw = Array.isArray(root.jurisdictions) ? root.jurisdictions : [];
  const flatRulesRaw = Array.isArray(root.rules) ? root.rules : [];

  const jurisdictions: ComplianceJurisdictionView[] = jurisdictionsRaw.map((j) => {
    const ju = asRecord(j);
    const code = String(ju.code ?? ju.label ?? "—");
    const rulesArr = Array.isArray(ju.rules) ? ju.rules : [];
    const entityNamesRaw = Array.isArray(ju.entityNames) ? ju.entityNames : [];
    return {
      code,
      label: String(ju.label ?? code),
      entityCodes: Array.isArray(ju.entityCodes) ? ju.entityCodes.map(String) : [],
      entityNames: entityNamesRaw.map((e) => {
        const ent = asRecord(e);
        return { code: String(ent.code ?? ""), name: String(ent.name ?? ent.code ?? "") };
      }),
      rules: rulesArr.map((rule) => mapRule(rule, code)),
    };
  });

  const rulesFromFlat =
    flatRulesRaw.length > 0
      ? flatRulesRaw.map((r) => mapRule(r))
      : jurisdictions.flatMap((j) => j.rules);

  const summary: ComplianceSummaryView = root.summary
    ? {
        totalRules: Number(summaryRaw.totalRules ?? rulesFromFlat.length) || 0,
        activeRules: Number(summaryRaw.activeRules ?? 0) || 0,
        jurisdictionCount: Number(summaryRaw.jurisdictionCount ?? jurisdictions.length) || 0,
        entityCount: Number(summaryRaw.entityCount ?? 0) || 0,
        coveragePct: Number(summaryRaw.coveragePct ?? 0) || 0,
        gaps: Array.isArray(summaryRaw.gaps)
          ? summaryRaw.gaps.map((g) => {
              const gap = asRecord(g);
              return {
                jurisdiction: String(gap.jurisdiction ?? ""),
                ruleCode: String(gap.ruleCode ?? ""),
                message: String(gap.message ?? ""),
              };
            })
          : [],
      }
    : {
        ...emptySummary(),
        totalRules: rulesFromFlat.length,
        activeRules: rulesFromFlat.filter((r) => /active/i.test(r.status)).length,
        jurisdictionCount: jurisdictions.length,
        entityCount: new Set(rulesFromFlat.map((r) => r.entityCode).filter(Boolean)).size,
        coveragePct: complianceCoveragePercent(rulesFromFlat),
      };

  return {
    status: String(root.status ?? "empty"),
    summary,
    jurisdictions,
    rules: rulesFromFlat,
  };
}

/** @deprecated Use mapComplianceLayerView — kept for Enterprise Twin card list */
export function mapComplianceLayer(raw: unknown): ComplianceRuleView[] {
  return mapComplianceLayerView(raw).rules;
}

export function complianceCoveragePercent(rules: ComplianceRuleView[]): number {
  if (rules.length === 0) return 0;
  const active = rules.filter((r) => /active|enabled|live/i.test(r.status)).length;
  return Math.round((active / rules.length) * 100);
}

/** One row per rule code — merges duplicate provisions across entities. */
export interface ComplianceRuleGroupView {
  id: string;
  code: string;
  requirement: string;
  description: string;
  status: string;
  jurisdiction: string;
  moduleKey: string;
  moduleLabel: string;
  enforcement: string;
  autoApply: boolean;
  entityCodes: string[];
  /** Underlying rules — use first for detail when grouped. */
  rules: ComplianceRuleView[];
}

export function groupRulesByCode(rules: ComplianceRuleView[]): ComplianceRuleGroupView[] {
  const map = new Map<string, ComplianceRuleGroupView>();

  for (const rule of rules) {
    const key = rule.code.toUpperCase() || rule.id;
    const existing = map.get(key);
    if (existing) {
      existing.rules.push(rule);
      if (rule.entityCode && !existing.entityCodes.includes(rule.entityCode)) {
        existing.entityCodes.push(rule.entityCode);
      }
      if (!/active|enabled|live/i.test(existing.status) && /active/i.test(rule.status)) {
        existing.status = rule.status;
      }
    } else {
      map.set(key, {
        id: rule.id,
        code: rule.code,
        requirement: rule.requirement,
        description: rule.description,
        status: rule.status,
        jurisdiction: rule.jurisdiction,
        moduleKey: rule.moduleKey,
        moduleLabel: rule.moduleLabel,
        enforcement: rule.enforcement,
        autoApply: rule.autoApply,
        entityCodes: rule.entityCode ? [rule.entityCode] : [],
        rules: [rule],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.requirement.localeCompare(b.requirement));
}

/** Short subtitle for list rows — no repeated module/enforcement hash chains. */
export function ruleListCaption(group: ComplianceRuleGroupView): string {
  if (group.moduleKey === "compliance_layer") {
    return group.enforcement;
  }
  return `${group.moduleLabel} · ${group.enforcement}`;
}

export function countUniqueEntities(view: ComplianceLayerView): number {
  const codes = new Set<string>();
  for (const j of view.jurisdictions) {
    for (const code of j.entityCodes) {
      if (code) codes.add(code);
    }
    for (const r of j.rules) {
      if (r.entityCode) codes.add(r.entityCode);
    }
  }
  return codes.size || view.summary.entityCount;
}

export function countUniqueRuleCodes(view: ComplianceLayerView): number {
  return new Set(view.rules.map((r) => r.code.toUpperCase()).filter(Boolean)).size;
}

export function modulePathForKey(moduleKey: string): string | undefined {
  switch (moduleKey) {
    case "accounting":
      return "/accounting";
    case "payroll_analytics":
      return "/payroll";
    case "reports":
      return "/reports";
    default:
      return undefined;
  }
}

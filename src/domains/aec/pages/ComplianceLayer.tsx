import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { ComplianceJurisdictionList } from "@/domains/aec/components/ComplianceJurisdictionList";
import { ComplianceRuleDetailSheet } from "@/domains/aec/components/ComplianceRuleDetailSheet";
import { MetricStrip } from "@/domains/aec/components/MetricStrip";
import { PipelineEmptyState, PipelineLoadingBanner } from "@/domains/aec/components/PipelineUi";
import { useAecTwin } from "@/domains/aec/context/AecTwinContext";
import { aecCompliance } from "@/common/api/aecPipeline";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import {
  countUniqueEntities,
  countUniqueRuleCodes,
  mapComplianceLayerView,
  type ComplianceLayerView,
  type ComplianceRuleGroupView,
  type ComplianceRuleView,
} from "@/domains/aec/api/complianceMappers";

const EMPTY_VIEW: ComplianceLayerView = {
  status: "empty",
  summary: {
    totalRules: 0,
    activeRules: 0,
    jurisdictionCount: 0,
    entityCount: 0,
    coveragePct: 0,
    gaps: [],
  },
  jurisdictions: [],
  rules: [],
};

export default function ComplianceLayer() {
  const { activeTwinId, loadTwinDetail, twinDetailLoading, activeTwin } = useAecTwin();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<ComplianceLayerView>(EMPTY_VIEW);
  const [loading, setLoading] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ComplianceRuleView | null>(null);
  const [selectedEntityCodes, setSelectedEntityCodes] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (activeTwinId) void loadTwinDetail(activeTwinId);
  }, [activeTwinId, loadTwinDetail]);

  useEffect(() => {
    if (!activeTwinId || !isApiTwinId(activeTwinId)) {
      setView(EMPTY_VIEW);
      return;
    }
    setLoading(true);
    void aecCompliance(activeTwinId)
      .then((raw) => setView(mapComplianceLayerView(raw)))
      .catch(() => setView(EMPTY_VIEW))
      .finally(() => setLoading(false));
  }, [activeTwinId]);

  const openGroup = useCallback(
    (group: ComplianceRuleGroupView) => {
      setSelectedRule(group.rules[0] ?? null);
      setSelectedEntityCodes(group.entityCodes);
      setSheetOpen(true);
      if (group.code) setSearchParams({ rule: group.code }, { replace: true });
    },
    [setSearchParams],
  );

  const ruleParam = searchParams.get("rule");
  useEffect(() => {
    if (!ruleParam || view.rules.length === 0) return;
    const matches = view.rules.filter(
      (r) => r.code.toUpperCase() === ruleParam.toUpperCase() || r.id === ruleParam,
    );
    const match = matches[0];
    if (match) {
      const entities = [
        ...new Set(matches.map((r) => r.entityCode).filter(Boolean)),
      ];
      const jurisdiction = view.jurisdictions.find((j) =>
        j.rules.some((r) => r.code.toUpperCase() === match.code.toUpperCase()),
      );
      setSelectedRule(match);
      setSelectedEntityCodes(
        entities.length > 0 ? entities : jurisdiction?.entityCodes ?? [],
      );
      setSheetOpen(true);
    }
  }, [ruleParam, view.rules, view.jurisdictions]);

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      setSelectedRule(null);
      setSelectedEntityCodes([]);
      if (searchParams.has("rule")) {
        searchParams.delete("rule");
        setSearchParams(searchParams, { replace: true });
      }
    }
  };

  const { summary, jurisdictions } = view;
  const twinName = activeTwin.name;

  const entityCount = useMemo(() => countUniqueEntities(view), [view]);
  const ruleTypeCount = useMemo(() => countUniqueRuleCodes(view), [view]);

  const metrics = useMemo(
    () => [
      {
        label: "Rule types",
        value: String(ruleTypeCount || summary.totalRules),
        change: summary.activeRules ? `${summary.activeRules} active` : undefined,
        trend: "neutral" as const,
      },
      {
        label: "Jurisdictions",
        value: String(summary.jurisdictionCount),
      },
      {
        label: "Entities",
        value: String(entityCount),
      },
      {
        label: "Coverage",
        value: `${summary.coveragePct}%`,
        trend: (summary.coveragePct >= 100 ? "up" : "neutral") as "up" | "neutral",
      },
    ],
    [ruleTypeCount, summary, entityCount],
  );

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Compliance Layer"
        subtitle={
          twinName
            ? `Regulatory rules provisioned for ${twinName} from Enterprise Twin.`
            : "Regulatory rules provisioned from your Enterprise Twin."
        }
        breadcrumb={[
          { label: "Compliance Layer", href: "/compliance" },
          { label: "Overview" },
        ]}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/enterprise-twin">
              <ExternalLink className="mr-2 h-4 w-4" />
              Enterprise Twin
            </Link>
          </Button>
        }
      />

      {(loading || twinDetailLoading) && view.rules.length === 0 && (
        <PipelineLoadingBanner label="Loading compliance rules…" />
      )}

      <MetricStrip metrics={metrics} />

      {jurisdictions.length === 0 ? (
        <PipelineEmptyState>
          No compliance rules on this twin yet. Publish an Enterprise Twin with jurisdiction data to
          auto-provision VAT, payroll, and reporting rules per entity.
        </PipelineEmptyState>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-semibold">Rules by jurisdiction</p>
              <p className="text-xs text-muted-foreground">Select a rule to view full detail</p>
            </div>
          </div>
          <ComplianceJurisdictionList jurisdictions={jurisdictions} onSelectGroup={openGroup} />
        </div>
      )}

      <ComplianceRuleDetailSheet
        rule={selectedRule}
        entityCodes={selectedEntityCodes}
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
      />
    </div>
  );
}

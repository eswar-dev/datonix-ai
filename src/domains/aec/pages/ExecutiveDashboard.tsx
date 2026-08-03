import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { ExecutiveKpiGrid } from "@/domains/aec/components/ExecutiveKpiGrid";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { MetricStrip } from "@/domains/aec/components/MetricStrip";

export default function ExecutiveDashboard() {
  const {
    accountingSummary,
    resourceSummary,
    twinDetail,
    activeTwin,
    activeTwinId,
    refreshAccounting,
    refreshResources,
    loadTwinDetail,
    projects,
  } = useAecApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTwinId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void Promise.all([
      refreshAccounting(),
      refreshResources(),
      loadTwinDetail(activeTwinId),
    ])
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // Intentionally only re-fetch when twin changes — refresh* identities change after load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTwinId]);

  const kpis = useMemo(
    () => ({
      groupRevenueGbp: accountingSummary?.revenueYtd ?? 0,
      groupMarginPct: accountingSummary?.grossMarginPct ?? 0,
      projectsAtRisk: projects.filter((p) => p.health === "At Risk" || p.health === "Critical").length,
      activeProjects: projects.length || twinDetail?.metadata.activeProjects || 0,
      staffCount: activeTwin.staffCount || (resourceSummary
        ? resourceSummary.inHouse + resourceSummary.contractors + resourceSummary.freelancers
        : 0),
      avgUtilization: resourceSummary?.avgUtilization ?? 0,
      arDaysOutstanding: accountingSummary?.ar60Plus
        ? Math.round(accountingSummary.ar60Plus > 0 ? 60 : 0)
        : 0,
      cashRunwayDays: 0,
    }),
    [accountingSummary, resourceSummary, twinDetail, activeTwin.staffCount, projects]
  );

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Executive Dashboard"
        subtitle="Live KPIs from accounting, resources, and twin summary."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Executive" },
        ]}
      />

      {loading && <PipelineLoadingBanner label="Loading executive metrics…" />}
      <PipelineErrorBanner message={error ?? ""} />

      {!loading && !accountingSummary && !resourceSummary ? (
        <PipelineEmptyState>No dashboard metrics yet for this twin.</PipelineEmptyState>
      ) : (
        <>
          <ExecutiveKpiGrid kpis={kpis} />

          <MetricStrip
            metrics={[
              {
                label: "AR Outstanding",
                value: accountingSummary?.arOutstandingDisplay ?? "£0",
              },
              {
                label: "AR 60d+",
                value: accountingSummary?.ar60PlusDisplay ?? "£0",
              },
              {
                label: "Capacity risk",
                value: String(resourceSummary?.capacityRisk ?? 0),
              },
              {
                label: "Bench",
                value: String(resourceSummary?.benchCount ?? 0),
              },
            ]}
          />

          <Card className="rounded-card">
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Charts that need dedicated report APIs (revenue-by-entity trend, cost composition history)
              are omitted. Use Accounting, Resources, and Pipeline screens for detail.
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

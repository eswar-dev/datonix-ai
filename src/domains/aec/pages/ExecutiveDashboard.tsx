import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { ExecutiveKpiGrid } from "@/domains/aec/components/ExecutiveKpiGrid";
import { CostCompositionChart } from "@/domains/aec/components/CostCompositionChart";
import { AiAlertPanel } from "@/domains/aec/components/AiAlertPanel";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { MetricStrip } from "@/domains/aec/components/MetricStrip";
import { Button } from "@/common/components/ui/button";

export default function ExecutiveDashboard() {
  const {
    executiveDashboard,
    accountingSummary,
    resourceSummary,
    activeTwin,
    activeTwinId,
    projects,
    loadExecutiveDashboard,
    refreshAccounting,
    refreshResources,
    dashboardsLoading,
    dashboardsError,
  } = useAecApp();

  useEffect(() => {
    if (!activeTwinId) return;
    void loadExecutiveDashboard();
    void refreshAccounting();
    void refreshResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTwinId]);

  const kpis = useMemo(() => {
    if (executiveDashboard) {
      return {
        groupRevenueGbp: executiveDashboard.groupRevenueGbp,
        groupMarginPct: executiveDashboard.groupMarginPct,
        projectsAtRisk: executiveDashboard.projectsAtRisk,
        activeProjects: projects.length || executiveDashboard.activeProjects,
        staffCount:
          activeTwin.staffCount ||
          (resourceSummary
            ? resourceSummary.inHouse + resourceSummary.contractors + resourceSummary.freelancers
            : executiveDashboard.staffCount),
        avgUtilization: executiveDashboard.avgUtilization || resourceSummary?.avgUtilization || 0,
        arDaysOutstanding: executiveDashboard.arDaysOutstanding,
        cashRunwayDays: executiveDashboard.cashRunwayDays,
      };
    }
    return {
      groupRevenueGbp: accountingSummary?.revenueYtd ?? 0,
      groupMarginPct: accountingSummary?.grossMarginPct ?? 0,
      projectsAtRisk: projects.filter((p) => p.health === "At Risk" || p.health === "Critical").length,
      activeProjects: projects.length,
      staffCount: activeTwin.staffCount || (resourceSummary
        ? resourceSummary.inHouse + resourceSummary.contractors + resourceSummary.freelancers
        : 0),
      avgUtilization: resourceSummary?.avgUtilization ?? 0,
      arDaysOutstanding: 0,
      cashRunwayDays: 0,
    };
  }, [executiveDashboard, accountingSummary, resourceSummary, activeTwin.staffCount, projects]);

  const loading = dashboardsLoading;

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Executive Dashboard"
        subtitle="Live KPIs from the executive dashboard API."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Executive" },
        ]}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => void loadExecutiveDashboard()}
            disabled={loading}
          >
            Refresh
          </Button>
        }
      />

      {loading && <PipelineLoadingBanner label="Loading executive metrics…" />}
      <PipelineErrorBanner message={dashboardsError ?? ""} />

      {!loading && !executiveDashboard && !accountingSummary && !resourceSummary ? (
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
                label: "Revenue Δ",
                value: executiveDashboard
                  ? `${executiveDashboard.revenueChangePct}%`
                  : "—",
              },
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            {executiveDashboard && (
              <Card className="rounded-card">
                <CardHeader>
                  <CardTitle className="text-base">Cost composition</CardTitle>
                </CardHeader>
                <CardContent>
                  <CostCompositionChart
                    costs={executiveDashboard.costComposition}
                    currency={executiveDashboard.reportingCurrency}
                  />
                </CardContent>
              </Card>
            )}

            {executiveDashboard?.revenueByEntity?.length ? (
              <Card className="rounded-card">
                <CardHeader>
                  <CardTitle className="text-base">Revenue by entity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {executiveDashboard.revenueByEntity.map((row) => (
                    <div
                      key={row.entity}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{row.entity}</span>
                      <span className="tabular-nums">
                        £{Math.round(row.revenueGbp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>

          {executiveDashboard?.alerts?.length ? (
            <AiAlertPanel alerts={executiveDashboard.alerts} />
          ) : null}
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Database, FileText, Loader2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import { Skeleton } from "@/common/components/ui/skeleton";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { LayerSummaryCard } from "@/domains/aec/components/LayerSummaryCard";
import { EntityTree } from "@/domains/aec/components/EntityTree";
import { GenerateTwinPanel } from "@/domains/aec/components/GenerateTwinPanel";
import { ConnectorMappingTable } from "@/domains/aec/components/ConnectorMappingTable";
import { KpiFrameworkGrid } from "@/domains/aec/components/KpiFrameworkGrid";
import { AgentList } from "@/domains/aec/components/AgentList";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { useAecTwin } from "@/domains/aec/context/AecTwinContext";
import { buildEntityTree } from "@/domains/aec/data/meridian";

export default function EnterpriseTwin() {
  const {
    activeTwin,
    activeTwinId,
    twinDetail,
    isGenerating,
    twinGenerated,
    twinsLoading,
    twinDetailLoading,
    twinError,
    twins,
    loadTwinDetail,
  } = useAecTwin();
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    if (activeTwinId) void loadTwinDetail(activeTwinId);
  }, [activeTwinId, loadTwinDetail]);

  const entityTree = buildEntityTree(activeTwin);
  const layers = twinDetail?.layers ?? [];
  const metadata = twinDetail?.metadata;
  const detailBusy = twinDetailLoading && !twinDetail;
  const showContent =
    Boolean(activeTwin.id) && twinGenerated && !isGenerating && !twinsLoading && !detailBusy;

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Enterprise Twin"
        subtitle="Four-layer digital twin — organizational, resource, financial, and operational intelligence."
        breadcrumb={[
          { label: "Intelligence", href: "/enterprise-twin" },
          { label: "Enterprise Twin" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/data-ingestion">
                <Database className="mr-2 h-4 w-4" />
                Data Ingestion
              </Link>
            </Button>
            <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={!activeTwin.id}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Twin Summary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{activeTwin.name} — Twin Metadata</DialogTitle>
                </DialogHeader>
                <dl className="grid gap-3 text-sm">
                  {Object.entries({
                    Status: metadata?.status ?? activeTwin.status,
                    Version: metadata?.version ?? "—",
                    "Last Generated":
                      metadata?.lastGenerated && metadata.lastGenerated !== "—"
                        ? new Date(metadata.lastGenerated).toLocaleString()
                        : "—",
                    "Reporting Currency":
                      metadata?.reportingCurrency ?? activeTwin.reportingCurrency,
                    Entities: metadata?.entities ?? activeTwin.entities.length,
                    "Total Staff": metadata?.totalStaff ?? activeTwin.staffCount,
                    "Active Projects": metadata?.activeProjects ?? activeTwin.projectCount,
                    "Agents Generated": metadata?.agentsGenerated ?? 0,
                    "Connectors Mapped": metadata?.connectorsMapped ?? 0,
                    KPIs: metadata?.kpis ?? 0,
                    Layers: (metadata?.layers ?? []).join(", ") || "—",
                  }).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 border-b pb-2">
                      <dt className="text-muted-foreground">{key}</dt>
                      <dd className="font-medium text-right">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <GenerateTwinPanel />

      {twinError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {twinError}
        </p>
      )}

      {twinsLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading twins from API…
        </div>
      )}

      {!twinsLoading && twins.length === 0 && !isGenerating && (
        <Card className="rounded-card">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No enterprise twins yet. Describe your organization above and generate one from the API.
          </CardContent>
        </Card>
      )}

      {!showContent ? (
        (isGenerating || detailBusy) && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-card" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-card" />
          </div>
        )
      ) : (
        <>
          {twinDetailLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing twin layers…
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {layers.map((layer) => (
              <LayerSummaryCard key={layer.id} layer={layer} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-card">
              <CardHeader>
                <CardTitle className="text-base">Entity Structure</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {activeTwin.name} — {activeTwin.staffCount} staff across {activeTwin.entities.length}{" "}
                  entities
                </p>
              </CardHeader>
              <CardContent>
                {activeTwin.entities.length > 0 ? (
                  <EntityTree root={entityTree} />
                ) : (
                  <p className="text-sm text-muted-foreground">No entities returned for this twin yet.</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="rounded-card">
                <CardHeader>
                  <CardTitle className="text-base">Shared Governance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    {
                      label: "Shared Resources",
                      value: twinDetail?.governance.sharedResources ? "Enabled" : "Disabled",
                    },
                    {
                      label: "Shared Skill Matrix",
                      value: twinDetail?.governance.sharedSkillMatrix ? "Enabled" : "Disabled",
                    },
                    {
                      label: "Shared Rate Card Engine",
                      value: twinDetail?.governance.sharedRateCardEngine ? "Enabled" : "Disabled",
                    },
                    {
                      label: "Reporting Currency",
                      value: twinDetail?.governance.reportingCurrency || activeTwin.reportingCurrency,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <span className="text-sm">{item.label}</span>
                      <span className="text-xs font-medium text-success">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-card">
                <CardHeader>
                  <CardTitle className="text-base">Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(twinDetail?.compliance.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground">No compliance items on this twin.</p>
                  ) : (
                    twinDetail?.compliance.map((item) => (
                      <div
                        key={`${item.region}-${item.requirement}`}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.requirement}</p>
                          <p className="text-xs text-muted-foreground">{item.region}</p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="rounded-card">
            <CardHeader>
              <CardTitle className="text-base">Org Hierarchy Counts</CardTitle>
            </CardHeader>
            <CardContent>
              {(twinDetail?.orgHierarchy.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No hierarchy levels returned yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-5">
                  {twinDetail?.orgHierarchy.map((row) => (
                    <div key={row.level} className="rounded-lg bg-muted/50 p-3 text-center">
                      <p className="text-2xl font-semibold">{row.headcount}</p>
                      <p className="text-xs text-muted-foreground">{row.level}</p>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/org-chart" className="mt-3 inline-block text-xs font-medium text-accent hover:underline">
                Open Organization Chart →
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-card">
            <CardHeader>
              <CardTitle className="text-base">Resource Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { type: "In-House", count: twinDetail?.resourceBreakdown.inHouse ?? 0 },
                  { type: "Contractor", count: twinDetail?.resourceBreakdown.contractor ?? 0 },
                  { type: "Freelancer", count: twinDetail?.resourceBreakdown.freelancer ?? 0 },
                ].map((row) => (
                  <div key={row.type} className="rounded-lg border p-4">
                    <p className="text-sm font-medium">{row.type}</p>
                    <p className="mt-1 text-2xl font-semibold">{row.count}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/resources/planning"
                className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
              >
                Open Resource Planning →
              </Link>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Connector Mappings</h2>
            <ConnectorMappingTable connectors={twinDetail?.connectors ?? []} />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">KPI Framework</h2>
            {(twinDetail?.kpis.length ?? 0) > 0 ? (
              <KpiFrameworkGrid kpis={twinDetail?.kpis} />
            ) : (
              <p className="text-sm text-muted-foreground">No KPIs returned for this twin yet.</p>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">
              Generated Agents ({twinDetail?.agents.length ?? 0})
            </h2>
            {(twinDetail?.agents.length ?? 0) > 0 ? (
              <AgentList agents={twinDetail?.agents ?? []} />
            ) : (
              <p className="text-sm text-muted-foreground">No agents returned for this twin yet.</p>
            )}
          </div>

          <Card className="rounded-card">
            <CardHeader>
              <CardTitle className="text-base">Skill Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {(twinDetail?.skillCategories.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No skill categories returned yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  {twinDetail?.skillCategories.map((cat) => (
                    <div key={`${cat.domain}-${cat.name}`} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.domain}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {cat.skills.map((skill) => (
                          <span key={skill} className="rounded bg-muted px-2 py-0.5 text-[10px]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                to="/resources/skills"
                className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
              >
                Open Skills Matrix →
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

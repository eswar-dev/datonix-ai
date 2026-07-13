import { useState } from "react";
import { Link } from "react-router-dom";
import { Database, FileText } from "lucide-react";
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
import { layerSummaries, twinMetadata } from "@/domains/aec/data/enterpriseTwin";
import { connectors } from "@/domains/aec/data/connectors";
import { kpiFrameworkCategories } from "@/domains/aec/data/kpis";
import { generatedAgents } from "@/domains/aec/data/agents";
import {
  buildEntityTree,
  complianceItems,
  getMetricsForTwin,
  governanceShared,
  governanceItems,
  orgHierarchyCounts,
  resourceTypeBreakdown,
  resourceDepartments,
  skillCategories,
} from "@/domains/aec/data/meridian";

export default function EnterpriseTwin() {
  const { activeTwin, activeTwinId, isGenerating, twinGenerated } = useAecTwin();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const metrics = getMetricsForTwin(activeTwinId);
  const entityTree = buildEntityTree(activeTwin);

  const layers = layerSummaries.map((layer) => {
    if (layer.id === "org") {
      return {
        ...layer,
        metrics: [
          { label: "Hierarchy Levels", value: String(metrics.org.hierarchyLevels) },
          { label: "Business Units", value: String(metrics.org.businessUnits) },
          { label: "Entities", value: String(metrics.org.entities) },
        ],
      };
    }
    if (layer.id === "resource") {
      return {
        ...layer,
        metrics: [
          { label: "Avg Utilization", value: `${metrics.resource.avgUtilization}%` },
          { label: "On Bench", value: String(metrics.resource.benchCount) },
          { label: "Over-Allocated", value: String(metrics.resource.overAllocated) },
        ],
      };
    }
    if (layer.id === "financial") {
      return {
        ...layer,
        metrics: [
          { label: "Group Margin", value: `${metrics.financial.marginPct}%` },
          { label: "Employee Cost", value: `£${Math.round(metrics.financial.employeeCostGbp / 1000)}K` },
          { label: "Contractor Cost", value: `£${Math.round(metrics.financial.contractorCostGbp / 1000)}K` },
        ],
      };
    }
    return {
      ...layer,
      metrics: [
        { label: "Active Projects", value: String(metrics.operational.activeProjects) },
        { label: "Cross-Entity", value: String(metrics.operational.crossEntityProjects) },
        { label: "Unmet Roles", value: String(metrics.operational.unmetRoles) },
      ],
    };
  });

  const showContent = twinGenerated && !isGenerating;

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
                <Button size="sm">
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
                    Version: twinMetadata.version,
                    "Last Generated": new Date(twinMetadata.lastGenerated).toLocaleString(),
                    "Reporting Currency": twinMetadata.reportingCurrency,
                    Entities: twinMetadata.entities,
                    "Total Staff": twinMetadata.totalStaff,
                    "Active Projects": twinMetadata.activeProjects,
                    "Agents Generated": twinMetadata.agentsGenerated,
                    "Connectors Mapped": twinMetadata.connectorsMapped,
                    "Data Sources": twinMetadata.dataSources.join(", "),
                    Layers: twinMetadata.layers.join(", "),
                  }).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 border-b pb-2">
                      <dt className="text-muted-foreground">{key}</dt>
                      <dd className="font-medium text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <GenerateTwinPanel />

      {!showContent ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-card" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-card" />
        </div>
      ) : (
        <>
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
                  {activeTwin.name} — {activeTwin.staffCount} staff across {activeTwin.entities.length} entities
                </p>
              </CardHeader>
              <CardContent>
                <EntityTree root={entityTree} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="rounded-card">
                <CardHeader>
                  <CardTitle className="text-base">Shared Governance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {governanceShared.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <span className="text-sm">{item.label}</span>
                      <span className="text-xs font-medium text-success">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-card">
                <CardHeader>
                  <CardTitle className="text-base">Governance Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {governanceItems.map((item) => (
                    <div key={item.title} className="flex items-start justify-between gap-2 rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-card">
                <CardHeader>
                  <CardTitle className="text-base">Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {complianceItems.map((item) => (
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
                  ))}
                  <Link to="/accounting" className="inline-block text-xs font-medium text-accent hover:underline">
                    View compliance in Accounting →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="rounded-card">
            <CardHeader>
              <CardTitle className="text-base">Org Hierarchy Counts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-5">
                {orgHierarchyCounts.map((row) => (
                  <div key={row.level} className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-2xl font-semibold">{row.count}</p>
                    <p className="text-xs text-muted-foreground">{row.level}</p>
                  </div>
                ))}
              </div>
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
                {resourceTypeBreakdown.map((row) => (
                  <div key={row.type} className="rounded-lg border p-4">
                    <p className="text-sm font-medium">{row.type}</p>
                    <p className="mt-1 text-2xl font-semibold">{row.count}</p>
                    <p className="text-xs text-muted-foreground">{row.utilization}% avg utilization</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {resourceDepartments.map((dept) => (
                  <div key={dept.name} className="flex justify-between rounded-md bg-muted/40 px-3 py-2 text-sm">
                    <span>{dept.name}</span>
                    <span className="text-muted-foreground">{dept.staff} · {dept.entity}</span>
                  </div>
                ))}
              </div>
              <Link to="/resources/planning" className="mt-3 inline-block text-xs font-medium text-accent hover:underline">
                Open Resource Planning →
              </Link>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Connector Mappings</h2>
            <ConnectorMappingTable connectors={connectors} />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">KPI Framework</h2>
            <KpiFrameworkGrid categories={kpiFrameworkCategories} />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Generated Agents ({generatedAgents.length})</h2>
            <AgentList agents={generatedAgents} />
          </div>

          <Card className="rounded-card">
            <CardHeader>
              <CardTitle className="text-base">Skill Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {skillCategories.map((cat) => (
                  <div key={cat.entity} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{cat.entity}</p>
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
              <Link to="/resources/skills" className="mt-3 inline-block text-xs font-medium text-accent hover:underline">
                Open Skills Matrix →
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

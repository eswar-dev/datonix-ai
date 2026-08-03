import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { MetricStrip } from "@/domains/aec/components/MetricStrip";
import { UtilizationHeatmap } from "@/domains/aec/components/UtilizationHeatmap";
import { ResourceDirectoryTable } from "@/domains/aec/components/ResourceDirectoryTable";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";

export default function ResourcePlanning() {
  const {
    resources,
    activeTwin,
    resourceSummary,
    utilizationHeatmap,
    resourcesLoading,
    resourcesError,
    refreshResources,
  } = useAecApp();
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    void refreshResources();
  }, [refreshResources]);

  const entityOptions = useMemo(() => {
    const fromTwin = activeTwin.entities.map((e) => e.code).filter(Boolean);
    const fromData = resources.map((r) => r.entity).filter(Boolean);
    return [...new Set([...fromTwin, ...fromData])];
  }, [activeTwin.entities, resources]);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (entityFilter !== "all" && r.entity !== entityFilter) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      return true;
    });
  }, [resources, entityFilter, typeFilter]);

  const summary = resourceSummary ?? {
    inHouse: 0,
    contractors: 0,
    freelancers: 0,
    avgUtilization: 0,
    capacityRisk: 0,
    benchCount: 0,
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Resource Planning"
        subtitle={`Allocation, utilization, and capacity across ${resources.length || activeTwin.staffCount || 0} resources.`}
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Resource Planning" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void refreshResources()} disabled={resourcesLoading}>
              Refresh
            </Button>
            <Button size="sm" asChild>
              <Link to="/resources/add">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Resource
              </Link>
            </Button>
          </div>
        }
      />

      {resourcesLoading && <PipelineLoadingBanner label="Loading resources…" />}
      <PipelineErrorBanner message={resourcesError ?? ""} />

      <MetricStrip
        metrics={[
          { label: "In-House", value: String(summary.inHouse) },
          { label: "Contractors", value: String(summary.contractors) },
          { label: "Freelancers", value: String(summary.freelancers) },
          {
            label: "Avg Utilization",
            value: `${summary.avgUtilization}%`,
            trend: summary.capacityRisk > 0 ? "down" : "neutral",
            change: summary.capacityRisk > 0 ? `${summary.capacityRisk} at risk` : undefined,
          },
        ]}
      />

      <Card className="rounded-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Utilization Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          {utilizationHeatmap?.weeks.length && utilizationHeatmap.rows.length ? (
            <UtilizationHeatmap weeks={utilizationHeatmap.weeks} rows={utilizationHeatmap.rows} />
          ) : (
            <p className="py-6 text-sm text-muted-foreground">
              {resourcesLoading ? "Loading heatmap…" : "No utilization data yet."}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid max-w-lg gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Entity</Label>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                {entityOptions.map((code) => (
                  <SelectItem key={code} value={code}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Resource Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="IN-HOUSE">In-House</SelectItem>
                <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                <SelectItem value="FREELANCER">Freelancer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!resourcesLoading && !filtered.length ? (
        <PipelineEmptyState>No resources found for this twin.</PipelineEmptyState>
      ) : (
        <ResourceDirectoryTable resources={filtered} />
      )}
    </div>
  );
}

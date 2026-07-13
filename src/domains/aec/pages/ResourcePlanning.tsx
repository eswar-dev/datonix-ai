import { useMemo, useState } from "react";
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
import { resourceSummary, utilizationHeatmap } from "@/domains/aec/data/resources";
import { useAecApp } from "@/domains/aec/context/AecAppContext";

export default function ResourcePlanning() {
  const { resources, activeTwin } = useAecApp();
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (entityFilter !== "all" && r.entity !== entityFilter) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      return true;
    });
  }, [resources, entityFilter, typeFilter]);

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Resource Planning"
        subtitle={`Allocation, utilization heatmap, and capacity risk across ${activeTwin.staffCount} resources.`}
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Resource Planning" },
        ]}
      />

      <MetricStrip
        metrics={[
          { label: "In-House", value: String(resourceSummary.inHouse) },
          { label: "Contractors", value: String(resourceSummary.contractors) },
          { label: "Freelancers", value: String(resourceSummary.freelancers) },
          { label: "Avg Utilization", value: `${resourceSummary.avgUtilization}%`, trend: "down", change: "2 at risk" },
        ]}
      />

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">8-Week Utilization Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <UtilizationHeatmap weeks={utilizationHeatmap.weeks} rows={utilizationHeatmap.rows} />
        </CardContent>
      </Card>

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 max-w-lg">
          <div className="space-y-2">
            <Label>Entity</Label>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                <SelectItem value="MA">MA</SelectItem>
                <SelectItem value="ME">ME</SelectItem>
                <SelectItem value="MC">MC</SelectItem>
                <SelectItem value="MG">MG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Resource Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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

      <ResourceDirectoryTable resources={filtered} />
    </div>
  );
}

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { CrossEntityAllocationTable } from "@/domains/aec/components/CrossEntityAllocationTable";
import {
  PipelineEmptyState,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";

export default function SharedAllocation() {
  const { allocations, loadAllocations, resourcesLoading, activeTwin } = useAecApp();

  useEffect(() => {
    void loadAllocations();
  }, [loadAllocations]);

  const loading = resourcesLoading && !allocations.length;

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Shared Allocation"
        subtitle="Cross-entity resource sharing and cost split from live allocations."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Shared Allocation" },
        ]}
      />

      <Card className="rounded-card border-accent/20 bg-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cost Split Explanation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            When a resource from one entity works on another entity&apos;s project, costs are split
            based on allocation percentage. The home entity retains overhead; the host entity bears
            project delivery cost.
          </p>
          <p className="font-medium text-foreground">
            Reporting currency: {activeTwin.reportingCurrency || "GBP"}
          </p>
        </CardContent>
      </Card>

      {loading && <PipelineLoadingBanner label="Loading allocations…" />}

      {!loading && !allocations.length ? (
        <PipelineEmptyState>No cross-entity allocations for this twin.</PipelineEmptyState>
      ) : (
        <CrossEntityAllocationTable rows={allocations} />
      )}
    </div>
  );
}

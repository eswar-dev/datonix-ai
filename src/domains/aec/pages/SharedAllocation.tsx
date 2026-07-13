import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { CrossEntityAllocationTable } from "@/domains/aec/components/CrossEntityAllocationTable";
import { crossEntityAllocations } from "@/domains/aec/data/resources";

export default function SharedAllocation() {
  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Shared Allocation"
        subtitle="Cross-entity resource sharing and cost split rules across MA, ME, and MC."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Shared Allocation" },
        ]}
      />

      <Card className="rounded-card border-accent/20 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-base">Cost Split Explanation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            When a resource from one entity works on another entity&apos;s project, costs are split
            based on allocation percentage. The home entity retains overhead; the host entity bears
            project delivery cost.
          </p>
          <p>
            Example: Marcus Klein (ME contractor) at 60% on MA Kings Cross — 40% cost to ME bench,
            60% charged to MA project WBS.
          </p>
          <p className="font-medium text-foreground">
            Group reporting currency: GBP · Parent P&L roll-up enabled
          </p>
        </CardContent>
      </Card>

      <CrossEntityAllocationTable rows={crossEntityAllocations} />
    </div>
  );
}

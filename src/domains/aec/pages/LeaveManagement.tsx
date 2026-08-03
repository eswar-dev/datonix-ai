import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { PipelineEmptyState } from "@/domains/aec/components/PipelineUi";

export default function LeaveManagement() {
  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Leave & Downtime"
        subtitle="Manage leave, illness, and unscheduled absence with project impact."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Leave & Downtime" },
        ]}
      />

      <Card className="rounded-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pending backend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>No leave / downtime APIs exist under the AEC twin routes today.</p>
          <p>
            Needed (minimum): list, create, approve, reject — e.g.{" "}
            <code className="text-foreground">GET/POST …/leave</code> and{" "}
            <code className="text-foreground">PATCH …/leave/&#123;id&#125;/approve|reject</code>.
          </p>
        </CardContent>
      </Card>

      <PipelineEmptyState>
        Leave &amp; Downtime will integrate once leave APIs are available.
      </PipelineEmptyState>
    </div>
  );
}

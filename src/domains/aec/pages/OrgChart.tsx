import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { PipelineEmptyState } from "@/domains/aec/components/PipelineUi";

export default function OrgChart() {
  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Organization Chart"
        subtitle="Hierarchy of resources by reporting manager."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Organization Chart" },
        ]}
      />

      <Card className="rounded-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pending backend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Resource model already has <code className="text-foreground">reporting_manager</code>, but
            there is no org-chart / hierarchy API yet.
          </p>
          <p>
            Needed: <code className="text-foreground">GET /api/v1/aec/twins/&#123;twin_id&#125;/resources/org-chart</code>{" "}
            (or include <code className="text-foreground">reportingManagerId</code> on resource list).
          </p>
        </CardContent>
      </Card>

      <PipelineEmptyState>
        Organization Chart will light up once the hierarchy endpoint is available.
      </PipelineEmptyState>
    </div>
  );
}

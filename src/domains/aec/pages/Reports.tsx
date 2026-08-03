import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { PipelineEmptyState } from "@/domains/aec/components/PipelineUi";

export default function Reports() {
  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Reports"
        subtitle="AEC report library and drill-downs."
        breadcrumb={[{ label: "Reports" }]}
      />

      <Card className="rounded-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pending backend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            There are no AEC report list / run / export APIs under{" "}
            <code className="text-foreground">/api/v1/aec/twins/&#123;twin_id&#125;/…</code> yet.
          </p>
          <p>
            Needed: report catalog and execution endpoints (profitability, AR aging, P&amp;L, FX,
            agent audit).
          </p>
        </CardContent>
      </Card>

      <PipelineEmptyState>
        Reports will light up once dedicated report APIs are available.
      </PipelineEmptyState>
    </div>
  );
}

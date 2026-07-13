import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { FxRateCards } from "@/domains/aec/components/FxRateCards";
import { fxRates, fxSummary, projectFxImpacts } from "@/domains/aec/data/currency";
import { cn } from "@/common/lib/utils";

export default function CurrencyIntelligence() {
  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Currency Intelligence"
        subtitle="Live FX rates, group exposure, and project margin impact in GBP reporting currency."
        breadcrumb={[
          { label: "Accounting", href: "/accounting" },
          { label: "Currency Intelligence" },
        ]}
      />

      <FxRateCards
        rates={fxRates}
        exposureGbp={fxSummary.exposureGbp}
        fxPnlGbp={fxSummary.fxPnlGbp}
      />

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Project FX Margin Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-card border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Exposure</TableHead>
                  <TableHead className="text-right">FX Impact</TableHead>
                  <TableHead className="text-right">Margin Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectFxImpacts.map((p) => (
                  <TableRow key={p.project}>
                    <TableCell className="font-medium">{p.project}</TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{p.entity}</span>
                    </TableCell>
                    <TableCell>{p.currency}</TableCell>
                    <TableCell className="text-right">£{p.exposureGbp.toLocaleString()}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right",
                        p.fxImpactGbp < 0 && "text-destructive font-medium"
                      )}
                    >
                      {p.fxImpactGbp === 0 ? "—" : `−£${Math.abs(p.fxImpactGbp).toLocaleString()}`}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right",
                        p.marginImpactPct < 0 && "text-destructive"
                      )}
                    >
                      {p.marginImpactPct === 0 ? "—" : `${p.marginImpactPct}%`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Button } from "@/common/components/ui/button";
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
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { cn } from "@/common/lib/utils";
import { toast } from "sonner";

export default function CurrencyIntelligence() {
  const { currencyIntelligence, refreshCurrency, refreshFxRates } = useAecApp();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void refreshCurrency()
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [refreshCurrency]);

  const onRefreshRates = async () => {
    setRefreshing(true);
    try {
      await refreshFxRates();
      toast.success("FX rates refreshed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const view = currencyIntelligence;

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Currency Intelligence"
        subtitle="FX rates, group exposure, and project margin impact in reporting currency."
        breadcrumb={[
          { label: "Accounting", href: "/accounting" },
          { label: "Currency Intelligence" },
        ]}
        actions={
          <Button size="sm" variant="outline" onClick={() => void onRefreshRates()} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh rates"}
          </Button>
        }
      />

      {loading && <PipelineLoadingBanner label="Loading currency…" />}
      <PipelineErrorBanner message={error ?? ""} />

      {!loading && !view ? (
        <PipelineEmptyState>No currency data for this twin yet.</PipelineEmptyState>
      ) : view ? (
        <>
          <FxRateCards
            rates={view.rates}
            exposureGbp={view.fxExposure}
            fxPnlGbp={view.fxPnlImpactYtd}
          />

          <Card className="rounded-card">
            <CardHeader>
              <CardTitle className="text-base">
                Project FX Margin Impact ({view.reportingCurrency})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {view.projects.length === 0 ? (
                <PipelineEmptyState>No projects with FX exposure.</PipelineEmptyState>
              ) : (
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
                      {view.projects.map((p) => (
                        <TableRow key={p.project}>
                          <TableCell className="font-medium">{p.project}</TableCell>
                          <TableCell>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">
                              {p.entity}
                            </span>
                          </TableCell>
                          <TableCell>{p.currency}</TableCell>
                          <TableCell className="text-right">
                            £{Math.round(p.exposureGbp).toLocaleString()}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right",
                              p.fxImpactGbp < 0 && "text-destructive font-medium"
                            )}
                          >
                            {p.fxImpactGbp === 0
                              ? "—"
                              : `${p.fxImpactGbp < 0 ? "−" : ""}£${Math.abs(Math.round(p.fxImpactGbp)).toLocaleString()}`}
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
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

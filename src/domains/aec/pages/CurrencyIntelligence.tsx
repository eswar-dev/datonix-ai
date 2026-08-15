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
import { aecCurrencyRates } from "@/common/api/aecAccounting";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import { cn } from "@/common/lib/utils";
import { toast } from "sonner";

type RateRow = {
  pair: string;
  rate: number;
  changePct: number;
  asOf: string;
};

function mapRatesPayload(raw: unknown): RateRow[] {
  const root =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const list = Array.isArray(root.rates) ? root.rates : Array.isArray(raw) ? raw : [];
  return list.map((item) => {
    const r = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      pair: String(r.pair ?? `${r.baseCurrency ?? ""}/${r.quoteCurrency ?? ""}`),
      rate: Number(r.rate ?? 0) || 0,
      changePct: Number(r.changePct ?? r.change24h ?? 0) || 0,
      asOf: String(r.asOf ?? "—"),
    };
  });
}

export default function CurrencyIntelligence() {
  const { currencyIntelligence, refreshCurrency, refreshFxRates, activeTwinId } = useAecApp();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateRows, setRateRows] = useState<RateRow[]>([]);

  const loadRates = async () => {
    if (!activeTwinId || !isApiTwinId(activeTwinId)) {
      setRateRows([]);
      return;
    }
    const raw = await aecCurrencyRates(activeTwinId);
    setRateRows(mapRatesPayload(raw));
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    void Promise.all([refreshCurrency(), loadRates()])
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCurrency, activeTwinId]);

  const onRefreshRates = async () => {
    setRefreshing(true);
    try {
      await refreshFxRates();
      await loadRates();
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
              <CardTitle className="text-base">Stored FX rates</CardTitle>
            </CardHeader>
            <CardContent>
              {rateRows.length === 0 ? (
                <PipelineEmptyState>No stored rates from currency/rates yet.</PipelineEmptyState>
              ) : (
                <div className="overflow-x-auto rounded-card border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pair</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Change %</TableHead>
                        <TableHead>As of</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rateRows.map((r) => (
                        <TableRow key={r.pair}>
                          <TableCell className="font-medium">{r.pair}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {r.rate.toFixed(4)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right tabular-nums",
                              r.changePct < 0 && "text-destructive",
                              r.changePct > 0 && "text-success"
                            )}
                          >
                            {r.changePct === 0
                              ? "—"
                              : `${r.changePct > 0 ? "+" : ""}${r.changePct.toFixed(2)}%`}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.asOf !== "—" ? new Date(r.asOf).toLocaleString() : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

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

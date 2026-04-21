import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Database, Sparkles, GitCompare, Download, AlertTriangle, CheckCircle2,
  TrendingUp, TrendingDown, Sigma, Wand2, ShieldCheck,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { toast } from "sonner";
import {
  dataQualityColumns, rawQualityRows, syntheticQualityColumns, syntheticQualityRows,
  rawQualityKpis, syntheticQualityKpis, qualityComparison, qualityColumnComparison,
  cleaningOperations,
} from "@/data/machineData";

function KpiCard({
  label, value, icon: Icon, color, sub,
}: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string; sub?: string }) {
  return (
    <Card className="rounded-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
    </Card>
  );
}

function downloadCsv(filename: string, columns: string[], rows: (string | number | null)[][]) {
  const csv = [
    columns.join(","),
    ...rows.map((r) => r.map((c) => (c === null || c === undefined ? "" : String(c))).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename} downloaded`);
}

export default function DataQuality() {
  const newCols = useMemo(
    () => syntheticQualityColumns.filter((c) => !dataQualityColumns.includes(c)),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Data Quality Assessment</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Compare raw telemetry against the cleaned & enriched synthetic dataset to quantify data quality uplift.
        </p>
      </div>

      <Tabs defaultValue="raw" className="w-full">
        <TabsList>
          <TabsTrigger value="raw" className="gap-2"><Database className="h-4 w-4" /> Raw Data View</TabsTrigger>
          <TabsTrigger value="synthetic" className="gap-2"><Sparkles className="h-4 w-4" /> Synthetic Data View</TabsTrigger>
          <TabsTrigger value="compare" className="gap-2"><GitCompare className="h-4 w-4" /> Comparison View</TabsTrigger>
        </TabsList>

        {/* ───── RAW ───── */}
        <TabsContent value="raw" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Quality Score"  value={`${rawQualityKpis.qualityScore}/100`} icon={ShieldCheck} color="text-warning" sub="Below acceptance threshold (85)" />
            <KpiCard label="Data Accuracy"  value={`${rawQualityKpis.accuracy}%`}        icon={CheckCircle2} color="text-warning" sub={`Validity ${rawQualityKpis.validity}%`} />
            <KpiCard label="Missing Cells"  value={rawQualityKpis.missingCells.toLocaleString()} icon={AlertTriangle} color="text-destructive" sub={`${rawQualityKpis.missingPct}% of dataset`} />
            <KpiCard label="Outliers / Dupes" value={`${rawQualityKpis.outliers} / ${rawQualityKpis.duplicates}`} icon={Sigma} color="text-destructive" sub="Detected by IQR + key match" />
          </div>

          <Card className="rounded-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold">Raw Telemetry — first 12 rows</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Empty cells = missing values · highlighted = outliers</p>
              </div>
              <Badge variant="outline" className="text-[10px]">{rawQualityKpis.totalRows.toLocaleString()} total rows</Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    {dataQualityColumns.map((c) => (
                      <TableHead key={c} className="text-[11px] uppercase tracking-wide">{c}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rawQualityRows.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => {
                        const missing = cell === null || cell === undefined || cell === "";
                        const outlier = dataQualityColumns[j] === "temperature_c" && typeof cell === "number" && cell > 200;
                        return (
                          <TableCell
                            key={j}
                            className={`text-xs font-mono ${
                              missing ? "bg-destructive/10 text-destructive" : outlier ? "bg-warning/15 text-warning font-semibold" : ""
                            }`}
                          >
                            {missing ? "— null —" : String(cell)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ───── SYNTHETIC ───── */}
        <TabsContent value="synthetic" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Quality Score"  value={`${syntheticQualityKpis.qualityScore}/100`} icon={ShieldCheck} color="text-success" sub="Production-ready" />
            <KpiCard label="Data Accuracy"  value={`${syntheticQualityKpis.accuracy}%`}  icon={CheckCircle2} color="text-success" sub={`Validity ${syntheticQualityKpis.validity}%`} />
            <KpiCard label="Missing Cells"  value="0" icon={AlertTriangle} color="text-success" sub="100% complete" />
            <KpiCard label="Enriched Cols"  value={`+${syntheticQualityKpis.enrichedColumns}`} icon={Wand2} color="text-accent" sub={newCols.join(", ")} />
          </div>

          <Card className="rounded-card p-5">
            <h2 className="text-sm font-semibold mb-3">Cleaning & Enrichment Operations Applied</h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Operation</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Records Affected</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cleaningOperations.map((o, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-xs">{o.op}</TableCell>
                    <TableCell className="font-mono text-xs">{o.target}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{o.count.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{o.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="rounded-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold">Synthetic Dataset — first 12 rows</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cleaned values · <span className="text-accent font-medium">highlighted columns</span> are newly engineered features
                </p>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  downloadCsv(
                    "synthetic_telemetry_apr2026.csv",
                    syntheticQualityColumns,
                    syntheticQualityRows,
                  )
                }
              >
                <Download className="h-4 w-4" /> Download CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    {syntheticQualityColumns.map((c) => (
                      <TableHead
                        key={c}
                        className={`text-[11px] uppercase tracking-wide ${newCols.includes(c) ? "text-accent" : ""}`}
                      >
                        {c}{newCols.includes(c) && " ✦"}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syntheticQualityRows.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell
                          key={j}
                          className={`text-xs font-mono ${newCols.includes(syntheticQualityColumns[j]) ? "bg-accent/5 text-accent" : ""}`}
                        >
                          {String(cell)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ───── COMPARISON ───── */}
        <TabsContent value="compare" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-card p-5 border-l-4 border-l-warning">
              <p className="text-xs font-medium text-muted-foreground">Raw Quality Score</p>
              <p className="mt-2 text-3xl font-semibold text-warning">{rawQualityKpis.qualityScore}<span className="text-base text-muted-foreground">/100</span></p>
              <p className="mt-1 text-[11px] text-muted-foreground">Pre-cleaning baseline</p>
            </Card>
            <Card className="rounded-card p-5 border-l-4 border-l-success">
              <p className="text-xs font-medium text-muted-foreground">Synthetic Quality Score</p>
              <p className="mt-2 text-3xl font-semibold text-success">{syntheticQualityKpis.qualityScore}<span className="text-base text-muted-foreground">/100</span></p>
              <p className="mt-1 text-[11px] text-muted-foreground">Post cleaning + enrichment</p>
            </Card>
            <Card className="rounded-card p-5 border-l-4 border-l-accent">
              <p className="text-xs font-medium text-muted-foreground">Net Improvement</p>
              <p className="mt-2 text-3xl font-semibold text-accent flex items-center gap-2">
                +{syntheticQualityKpis.qualityScore - rawQualityKpis.qualityScore}<TrendingUp className="h-6 w-6" />
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">+33.3% relative gain</p>
            </Card>
          </div>

          <Card className="rounded-card p-5">
            <h2 className="text-sm font-semibold mb-3">Side-by-Side Metric Comparison</h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Raw</TableHead>
                  <TableHead className="text-right">Synthetic</TableHead>
                  <TableHead className="text-right">Δ Change</TableHead>
                  <TableHead>Outcome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualityComparison.map((c) => (
                  <TableRow key={c.metric}>
                    <TableCell className="font-medium text-xs">{c.metric}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">{c.raw}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold">{c.synthetic}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      <span className={c.deltaPct > 0 ? "text-success" : "text-success"}>
                        {c.deltaPct > 0 ? "+" : ""}{c.deltaPct}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">
                        {c.deltaPct > 0 ? <TrendingUp className="h-3 w-3 mr-1 inline" /> : <TrendingDown className="h-3 w-3 mr-1 inline" />}
                        Improved
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="rounded-card p-5">
            <h3 className="text-sm font-semibold mb-4">Missing Values per Column — Raw vs Synthetic</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qualityColumnComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="column" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="raw" name="Raw" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="synthetic" name="Synthetic" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-card p-5">
            <h3 className="text-sm font-semibold mb-3">Key Improvements Driving the Uplift</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span><span className="font-medium">2,148 missing cells imputed</span> across 4 critical telemetry columns using rolling-window means and operator-shift modes — completeness 88.4% → 100%.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span><span className="font-medium">136 sensor outliers capped</span> (e.g. M-106 reported 246°C — physically impossible — corrected to P99.5 of 96°C), removing noise from anomaly detection models.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span><span className="font-medium">3 engineered features added</span> (machine_age_yrs, energy_kwh, health_score) — boosting feature importance coverage and downstream model R² by an estimated +0.18.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span><span className="font-medium">38 duplicate records removed</span> via composite (timestamp + machine_id) key — preventing double-counting in OEE rollups.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span><span className="font-medium">Overall data quality score improved 72 → 96</span> — dataset is now production-ready for predictive maintenance and decision-intelligence workloads.</span>
              </li>
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
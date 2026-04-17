import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sigma, Database, BarChart3, GitBranch, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  rawDatasetColumns, rawDatasetRows, statisticalSummary, featureImportance, temperatureDistribution,
} from "@/data/machineData";

export default function DataProcessing() {
  const totalRows = 18420;
  const totalCols = rawDatasetColumns.length;
  const missingPct = (statisticalSummary.reduce((acc, s) => acc + s.missing, 0) / statisticalSummary.length).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Data Processing</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Initial raw data preview, statistical summary and feature analysis on the active dataset.
        </p>
      </div>

      {/* Dataset info */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Dataset", value: "machine_telemetry_apr2026", icon: Database, color: "text-accent", isText: true },
          { label: "Total Rows", value: totalRows.toLocaleString(), icon: Sigma, color: "text-purple" },
          { label: "Features", value: totalCols, icon: GitBranch, color: "text-teal" },
          { label: "Missing %", value: `${missingPct}%`, icon: AlertCircle, color: "text-warning" },
        ].map((s) => (
          <Card key={s.label} className="rounded-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className={`mt-2 font-semibold ${s.isText ? "text-sm truncate" : "text-2xl"}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="raw" className="w-full">
        <TabsList>
          <TabsTrigger value="raw" className="gap-2"><Database className="h-4 w-4" /> Raw Data</TabsTrigger>
          <TabsTrigger value="stats" className="gap-2"><Sigma className="h-4 w-4" /> Statistical Analysis</TabsTrigger>
          <TabsTrigger value="features" className="gap-2"><BarChart3 className="h-4 w-4" /> Feature Analysis</TabsTrigger>
        </TabsList>

        {/* RAW DATA */}
        <TabsContent value="raw" className="space-y-4 mt-4">
          <Card className="rounded-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Raw Data Preview (first 12 rows)</h2>
              <Badge variant="outline" className="text-[10px]">{totalRows.toLocaleString()} total rows</Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    {rawDatasetColumns.map((col) => (
                      <TableHead key={col} className="text-[11px] uppercase tracking-wide">{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rawDatasetRows.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell key={j} className="text-xs font-mono">{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card className="rounded-card p-5">
            <h3 className="text-sm font-semibold mb-3">Schema & Column Types</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {rawDatasetColumns.map((col, i) => {
                const types = ["datetime", "string", "float", "float", "float", "int", "int", "string"];
                return (
                  <div key={col} className="rounded-lg border p-3">
                    <p className="text-xs font-medium truncate">{col}</p>
                    <Badge variant="outline" className="mt-1 text-[10px] bg-muted">{types[i]}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* STATISTICAL */}
        <TabsContent value="stats" className="space-y-4 mt-4">
          <Card className="rounded-card p-5">
            <h2 className="text-sm font-semibold mb-3">Descriptive Statistics</h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Feature</TableHead>
                  <TableHead className="text-right">Mean</TableHead>
                  <TableHead className="text-right">Median</TableHead>
                  <TableHead className="text-right">Std Dev</TableHead>
                  <TableHead className="text-right">Min</TableHead>
                  <TableHead className="text-right">Max</TableHead>
                  <TableHead className="text-right">Missing %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statisticalSummary.map((s) => (
                  <TableRow key={s.feature}>
                    <TableCell className="font-medium font-mono text-xs">{s.feature}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{s.mean}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{s.median}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{s.std}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{s.min}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{s.max}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={`text-[10px] ${s.missing > 1 ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20"}`}>
                        {s.missing}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="rounded-card p-5">
            <h3 className="text-sm font-semibold mb-4">Distribution: temperature_c</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={temperatureDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Distribution is right-skewed with a long tail above 110°C — driven by injection-molding machine M-107 operating at process setpoint of 195°C.
            </p>
          </Card>
        </TabsContent>

        {/* FEATURE */}
        <TabsContent value="features" className="space-y-4 mt-4">
          <Card className="rounded-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Feature Importance vs Output (units/hr)</h2>
              <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">
                <CheckCircle2 className="h-3 w-3 mr-1 inline" /> Random Forest baseline
              </Badge>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureImportance} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 0.4]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={120} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                    {featureImportance.map((_, i) => (
                      <Cell key={i} fill="hsl(var(--accent))" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-card p-5">
            <h3 className="text-sm font-semibold mb-3">Correlation with Target (output_units)</h3>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Feature</TableHead>
                  <TableHead className="text-right">Importance</TableHead>
                  <TableHead className="text-right">Pearson Correlation</TableHead>
                  <TableHead>Direction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureImportance.map((f) => {
                  const negative = f.correlation < 0;
                  const strength = Math.abs(f.correlation);
                  const strengthLabel = strength > 0.5 ? "Strong" : strength > 0.3 ? "Moderate" : "Weak";
                  return (
                    <TableRow key={f.feature}>
                      <TableCell className="font-medium font-mono text-xs">{f.feature}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{f.importance.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{f.correlation.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${negative ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-success/10 text-success border-success/20"}`}>
                          {strengthLabel} {negative ? "▼" : "▲"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Key insight:</span> Vibration (mm/s) shows the strongest negative correlation with output (-0.58) — high vibration is a leading indicator of throughput loss across the fleet.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

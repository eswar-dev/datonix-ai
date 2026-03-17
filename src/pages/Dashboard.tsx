import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, X, Info } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data
const chartData = [
  { name: "Jan", value: 4200, prev: 3800 },
  { name: "Feb", value: 3800, prev: 4100 },
  { name: "Mar", value: 5100, prev: 4300 },
  { name: "Apr", value: 4600, prev: 4000 },
  { name: "May", value: 5400, prev: 4800 },
  { name: "Jun", value: 6200, prev: 5100 },
  { name: "Jul", value: 5800, prev: 5500 },
  { name: "Aug", value: 7100, prev: 5900 },
  { name: "Sep", value: 6700, prev: 6200 },
  { name: "Oct", value: 7400, prev: 6500 },
  { name: "Nov", value: 8100, prev: 7000 },
  { name: "Dec", value: 8900, prev: 7400 },
];

const sparkData = [
  [3, 5, 4, 7, 6, 8, 9],
  [8, 6, 7, 4, 5, 3, 2],
  [2, 4, 3, 5, 7, 6, 8],
  [5, 4, 6, 5, 7, 8, 9],
];

const kpis = [
  { label: "Total Records", value: "2.4M", delta: "+12.5%", up: true, sparkIdx: 0 },
  { label: "Data Quality Score", value: "94.2%", delta: "-1.3%", up: false, sparkIdx: 1 },
  { label: "Active Sources", value: "18", delta: "+3", up: true, sparkIdx: 2 },
  { label: "Insights Generated", value: "342", delta: "+28%", up: true, sparkIdx: 3 },
];

const risks = [
  { title: "Revenue anomaly detected in Q4 pipeline", severity: "High" as const },
  { title: "Customer churn rate above threshold", severity: "High" as const },
  { title: "Supplier delivery delays increasing", severity: "Med" as const },
  { title: "Inventory levels below safety stock", severity: "Med" as const },
  { title: "Marketing spend ROI declining", severity: "Low" as const },
];

const actions = [
  { priority: "High", summary: "Review Q4 revenue pipeline for data integrity issues" },
  { priority: "Med", summary: "Schedule vendor performance review meeting" },
  { priority: "Low", summary: "Update customer segmentation model with new data" },
];

const periods = ["Day", "Week", "Month", "Quarter"] as const;

function KPISkeleton() {
  return (
    <Card className="rounded-card p-5">
      <div className="h-4 w-24 skeleton-shimmer rounded mb-3" />
      <div className="h-8 w-20 skeleton-shimmer rounded mb-2" />
      <div className="h-3 w-16 skeleton-shimmer rounded" />
    </Card>
  );
}

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const points = data.map((v, i) => ({ v, i }));
  return (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={up ? "hsl(var(--success))" : "hsl(var(--destructive))"}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartInfoDialog({ title, description }: { title: string; description: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Chart info">
          <Info className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>{description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<typeof periods[number]>("Month");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex rounded-button border bg-card p-0.5">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-button px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)
          : kpis.map((kpi) => (
              <Card key={kpi.label} className="rounded-card p-5">
                <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-semibold">{kpi.value}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      {kpi.up ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                      <span className={kpi.up ? "text-success" : "text-destructive"}>
                        {kpi.delta}
                      </span>
                    </div>
                  </div>
                  <Sparkline data={sparkData[kpi.sparkIdx]} up={kpi.up} />
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">Updated 5m ago</p>
              </Card>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main chart */}
        <Card className="rounded-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Data Ingestion Trend</h2>
            <ChartInfoDialog
              title="Data Ingestion Trend"
              description="This chart displays the monthly data ingestion volume over the current and previous periods. The X-axis represents months (Jan–Dec) and the Y-axis represents the number of records ingested. The solid line shows the current period's ingestion, while the dashed line represents the previous period for comparison. Use this to identify seasonal patterns, growth trends, and any anomalies in your data pipeline throughput."
            />
          </div>
          {loading ? (
            <div className="h-[300px] skeleton-shimmer rounded" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Records", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    name="Current"
                  />
                  <Area
                    type="monotone"
                    dataKey="prev"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    fillOpacity={0}
                    name="Previous"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Risks */}
        <Card className="rounded-card p-5">
          <h2 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Risks & Opportunities
          </h2>
          <div className="space-y-3">
            {risks.map((r, i) => (
              <div key={i} className="flex items-start gap-2 rounded-button border p-3 text-xs">
                <Badge
                  variant={r.severity === "High" ? "destructive" : "secondary"}
                  className="shrink-0 text-[10px]"
                >
                  {r.severity}
                </Badge>
                <span className="leading-relaxed">{r.title}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recommended Actions */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Lightbulb className="h-4 w-4 text-accent" />
          Recommended Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((a, i) => (
            <Card key={i} className="flex items-start justify-between rounded-card p-4">
              <div className="flex items-start gap-2">
                <Badge
                  variant={a.priority === "High" ? "destructive" : "secondary"}
                  className="shrink-0 text-[10px]"
                >
                  {a.priority}
                </Badge>
                <span className="text-xs leading-relaxed">{a.summary}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" aria-label="Dismiss">
                <X className="h-3 w-3" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

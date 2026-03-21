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
import { useAuth } from "@/contexts/AuthContext";
import { roleData } from "@/data/roleData";

const sparkData = [
  [3, 5, 4, 7, 6, 8, 9],
  [8, 6, 7, 4, 5, 3, 2],
  [2, 4, 3, 5, 7, 6, 8],
  [5, 4, 6, 5, 7, 8, 9],
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<typeof periods[number]>("Month");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  if (!user) return null;
  const data = roleData[user.role].dashboard;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {user.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{user.industry} • {user.title}</p>
        </div>
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

      {/* KPI Cards — role-dynamic */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)
          : data.stats.map((kpi, idx) => {
              const up = kpi.trend === "up";
              return (
                <Card key={kpi.label} className="rounded-card p-5">
                  <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                  <div className="mt-2 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-semibold">{kpi.value}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs">
                        {up ? (
                          <TrendingUp className="h-3 w-3 text-success" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-destructive" />
                        )}
                        <span className={up ? "text-success" : "text-destructive"}>
                          {kpi.change}
                        </span>
                      </div>
                    </div>
                    <Sparkline data={sparkData[idx % 4]} up={up} />
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">Updated 5m ago</p>
                </Card>
              );
            })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main chart — role-dynamic */}
        <Card className="rounded-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">{data.chartTitle}</h2>
            <ChartInfoDialog
              title={data.chartTitle}
              description={`This chart displays the ${data.chartKeyLabels[0]} vs ${data.chartKeyLabels[1]} over time. Use this to identify trends, gaps, and performance against targets.`}
            />
          </div>
          {loading ? (
            <div className="h-[300px] skeleton-shimmer rounded" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
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
                    dataKey={data.chartKeys[0]}
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    name={data.chartKeyLabels[0]}
                  />
                  <Area
                    type="monotone"
                    dataKey={data.chartKeys[1]}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    fillOpacity={0}
                    name={data.chartKeyLabels[1]}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Risks — role-dynamic */}
        <Card className="rounded-card p-5">
          <h2 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Risks & Opportunities
          </h2>
          <div className="space-y-3">
            {data.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-2 rounded-button border p-3 text-xs">
                <Badge
                  variant={r.severity === "High" ? "destructive" : "secondary"}
                  className="shrink-0 text-[10px]"
                >
                  {r.severity}
                </Badge>
                <span className="leading-relaxed">{r.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recommended Actions — role-dynamic */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Lightbulb className="h-4 w-4 text-accent" />
          Recommended Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.actions.map((a, i) => (
            <Card key={i} className="flex items-start justify-between rounded-card p-4">
              <div className="flex items-start gap-2">
                <Badge
                  variant={a.severity === "High" ? "destructive" : "secondary"}
                  className="shrink-0 text-[10px]"
                >
                  {a.severity}
                </Badge>
                <span className="text-xs leading-relaxed">{a.label}</span>
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

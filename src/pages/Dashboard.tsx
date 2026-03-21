import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, X } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { roleData } from "@/data/roleData";

const sparkData = [
  [3, 5, 4, 7, 6, 8, 9],
  [8, 6, 7, 4, 5, 3, 2],
  [2, 4, 3, 5, 7, 6, 8],
  [5, 4, 6, 5, 7, 8, 9],
];

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
          <Line type="monotone" dataKey="v" stroke={up ? "hsl(var(--success))" : "hsl(var(--destructive))"} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const severityColor: Record<string, string> = {
  High: "destructive",
  Med: "secondary",
  Low: "secondary",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
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
      </div>

      {/* KPI Cards */}
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
                        <span className={up ? "text-success" : "text-destructive"}>{kpi.change}</span>
                      </div>
                    </div>
                    <Sparkline data={sparkData[idx % 4]} up={up} />
                  </div>
                </Card>
              );
            })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main chart */}
        <Card className="rounded-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-4">{data.chartTitle}</h2>
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
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey={data.chartKeys[0]} stroke="hsl(var(--accent))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" name={data.chartKeyLabels[0]} />
                  <Area type="monotone" dataKey={data.chartKeys[1]} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 4" fillOpacity={0} name={data.chartKeyLabels[1]} />
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
            {data.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-2 rounded-button border p-3 text-xs">
                <Badge variant={r.severity === "High" ? "destructive" : "secondary"} className="shrink-0 text-[10px]">
                  {r.severity}
                </Badge>
                <span className="leading-relaxed">{r.label}</span>
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
          {data.actions.map((a, i) => (
            <Card key={i} className="flex items-start justify-between rounded-card p-4">
              <div className="flex items-start gap-2">
                <Badge variant={a.severity === "High" ? "destructive" : "secondary"} className="shrink-0 text-[10px]">
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

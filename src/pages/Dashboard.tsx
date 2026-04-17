import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Activity, AlertTriangle, Cpu, Gauge, TrendingUp, TrendingDown, Wrench, Zap, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { fleetMachines } from "@/data/machineData";

function KPISkeleton() {
  return (
    <Card className="rounded-card p-5">
      <div className="h-4 w-24 skeleton-shimmer rounded mb-3" />
      <div className="h-8 w-20 skeleton-shimmer rounded mb-2" />
      <div className="h-3 w-16 skeleton-shimmer rounded" />
    </Card>
  );
}

const trendData = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  oee: 70 + Math.sin(i / 2) * 6 + Math.random() * 3,
  output: 12000 + Math.sin(i / 2) * 800 + Math.random() * 400,
}));

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  if (!user) return null;

  // ── Aggregated fleet KPIs ────────────────────────────────────────────────
  const total = fleetMachines.length;
  const running = fleetMachines.filter((m) => m.status === "Running").length;
  const fault = fleetMachines.filter((m) => m.status === "Fault").length;
  const maintenance = fleetMachines.filter((m) => m.status === "Maintenance").length;
  const avgOEE = Math.round(fleetMachines.reduce((a, m) => a + m.oee, 0) / total);
  const atRisk = fleetMachines.filter((m) => m.riskScore > 50).length;
  const avgRisk = Math.round(fleetMachines.reduce((a, m) => a + m.riskScore, 0) / total);

  const kpis = [
    { label: "Fleet OEE",       value: `${avgOEE}%`, change: "+2.1%", trend: "up" as const, icon: Gauge,         color: "text-accent" },
    { label: "Machines Running", value: `${running} / ${total}`, change: `${fault} faults`, trend: fault ? "down" as const : "up" as const, icon: Activity,  color: "text-success" },
    { label: "At-Risk Machines", value: String(atRisk), change: `Avg risk ${avgRisk}`, trend: atRisk > 2 ? "down" as const : "up" as const, icon: AlertTriangle, color: "text-destructive" },
    { label: "In Maintenance",   value: String(maintenance), change: "Planned PM", trend: "up" as const, icon: Wrench,  color: "text-purple" },
  ];

  const oeeByMachine = fleetMachines.map((m) => ({ name: m.id, oee: m.oee }));

  const topRisk = [...fleetMachines]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const alerts = [
    { sev: "high",   text: "Lathe Zeta (M-106) — vibration 6.8 mm/s, fault state" },
    { sev: "high",   text: "Robot Arm Gamma (M-103) — maintenance overdue" },
    { sev: "medium", text: "Conveyor Epsilon (M-105) — availability dropped to 45%" },
    { sev: "low",    text: "Press Beta (M-102) — temperature trending up" },
  ];

  const sevColor: Record<string, string> = {
    high:   "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    low:    "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live snapshot of your machinery fleet — OEE, risk, and recommended actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/machine-view">
              <Cpu className="h-4 w-4 mr-1.5" /> Open Fleet View
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/decision-intelligence">
              <Zap className="h-4 w-4 mr-1.5" /> Decision Intelligence
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)
          : kpis.map((k) => (
              <Card key={k.label} className="rounded-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                  <k.icon className={`h-4 w-4 ${k.color}`} />
                </div>
                <p className="mt-2 text-2xl font-semibold">{k.value}</p>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {k.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className={k.trend === "up" ? "text-success" : "text-destructive"}>{k.change}</span>
                </div>
              </Card>
            ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="rounded-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Fleet OEE Trend (14 days)</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Daily averaged OEE across all machines</p>
            </div>
            <Badge variant="outline" className="text-[10px]">Target 80%</Badge>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="oeeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[40, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="oee" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#oeeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-card p-5">
          <h2 className="text-sm font-semibold mb-4">OEE by Machine</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={oeeByMachine} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={50} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="oee" radius={[0, 4, 4, 0]}>
                  {oeeByMachine.map((d, i) => (
                    <Cell key={i} fill={d.oee >= 80 ? "hsl(var(--success))" : d.oee >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Alerts + Top Risk */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-card p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Active Alerts
          </h2>
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                <Badge variant="outline" className={`text-[10px] capitalize ${sevColor[a.sev]}`}>
                  {a.sev}
                </Badge>
                <p className="text-xs flex-1">{a.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-accent" /> Top At-Risk Machines
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/machine-view" className="text-xs">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            {topRisk.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground">{m.id} • {m.type}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={`text-[10px] ${
                    m.riskScore > 60 ? "bg-destructive/10 text-destructive border-destructive/20" :
                    m.riskScore > 30 ? "bg-warning/10 text-warning border-warning/20" :
                    "bg-success/10 text-success border-success/20"
                  }`}>
                    Risk {m.riskScore}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">OEE {m.oee}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fleet output insight */}
      <Card className="rounded-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Fleet Output (14 days)</h2>
          <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-accent/20">
            Forecast +3.6% next 5d
          </Badge>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="output" stroke="hsl(var(--purple))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

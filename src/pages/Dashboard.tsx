import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, X, Info, Users, Activity, FileText, Database } from "lucide-react";
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
  BarChart,
  Bar,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useViewMode } from "@/contexts/ViewModeContext";
import { roleData, managerAdminData } from "@/data/roleData";

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

const statusColor: Record<string, string> = {
  "On Track": "bg-success/10 text-success border-success/20",
  "At Risk": "bg-warning/10 text-warning border-warning/20",
  "Behind": "bg-destructive/10 text-destructive border-destructive/20",
};

function AdminDashboard({ user }: { user: NonNullable<ReturnType<typeof useAuth>["user"]> }) {
  const adminData = managerAdminData[user.role];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {user.industry} • Aggregated view across your team
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: adminData.overview.totalUsers, icon: Users, color: "text-accent" },
          { label: "Active Users", value: adminData.overview.activeUsers, icon: Activity, color: "text-success" },
          { label: "Total Datasets", value: adminData.overview.totalDatasets, icon: Database, color: "text-purple" },
          { label: "Total Reports", value: adminData.overview.totalReports, icon: FileText, color: "text-teal" },
        ].map((item) => (
          <Card key={item.label} className="rounded-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </Card>
        ))}
      </div>

      {/* Aggregated KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminData.aggregatedStats.map((kpi, idx) => {
          const up = kpi.trend === "up";
          return (
            <Card key={kpi.label} className="rounded-card p-5">
              <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold">{kpi.value}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    {up ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
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
        {/* Aggregated Chart */}
        <Card className="rounded-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">{adminData.aggregatedChartTitle}</h2>
            <ChartInfoDialog
              title={adminData.aggregatedChartTitle}
              description={`This chart shows aggregated ${adminData.aggregatedChartKeyLabels[0]} vs ${adminData.aggregatedChartKeyLabels[1]} across all team members.`}
            />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adminData.aggregatedChartData}>
                <defs>
                  <linearGradient id="colorTeam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey={adminData.aggregatedChartKeys[0]} stroke="hsl(var(--accent))" strokeWidth={2} fillOpacity={1} fill="url(#colorTeam)" name={adminData.aggregatedChartKeyLabels[0]} />
                <Area type="monotone" dataKey={adminData.aggregatedChartKeys[1]} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 4" fillOpacity={0} name={adminData.aggregatedChartKeyLabels[1]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Performance Summary */}
        <Card className="rounded-card p-5">
          <h2 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            Performance Summary
          </h2>
          <div className="space-y-3">
            {adminData.performanceSummary.map((p) => (
              <div key={p.metric} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-xs font-medium">{p.metric}</p>
                  <p className="text-[10px] text-muted-foreground">Target: {p.target}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{p.current}</span>
                  <Badge variant="outline" className={`text-[10px] ${statusColor[p.status]}`}>{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Members */}
        <Card className="rounded-card p-5">
          <h2 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" />
            Team Members
          </h2>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Tasks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminData.teamMembers.map((m) => (
                <TableRow key={m.name}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold shrink-0">
                      {m.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    {m.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{m.role}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={m.status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{m.lastActive}</TableCell>
                  <TableCell className="text-right font-medium">{m.tasksCompleted}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-card p-5">
          <h2 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent" />
            Recent Team Activity
          </h2>
          <div className="space-y-3">
            {adminData.recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold shrink-0">
                  {a.user.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">{a.user}</p>
                  <p className="text-[11px] text-muted-foreground">{a.action}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { viewMode } = useViewMode();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<typeof periods[number]>("Month");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  if (!user) return null;

  // Show admin aggregated view for managers
  if (user.isManager && viewMode === "admin") {
    return <AdminDashboard user={user} />;
  }

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

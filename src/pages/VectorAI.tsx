import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Activity, AlertTriangle, Bot, CheckCircle2, Clock, Cpu, GitBranch,
  PlayCircle, PauseCircle, RefreshCw, Shield, Wrench, Zap, TrendingUp,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

type Severity = "critical" | "warning" | "info";
type AgentStatus = "active" | "paused" | "learning";

interface Agent {
  id: string;
  name: string;
  domain: string;
  status: AgentStatus;
  scope: string;
  decisionsToday: number;
  successRate: number;
  description: string;
  icon: typeof Bot;
}

interface Alert {
  id: string;
  ts: string;
  severity: Severity;
  agent: string;
  asset: string;
  message: string;
  recommended: string;
  status: "open" | "acknowledged" | "auto-resolved";
}

interface LoopAction {
  id: string;
  ts: string;
  agent: string;
  trigger: string;
  action: string;
  asset: string;
  outcome: "success" | "pending" | "failed";
  impact: string;
}

const initialAgents: Agent[] = [
  { id: "a1", name: "Vibration Sentinel", domain: "Predictive Maintenance", status: "active", scope: "Fleet — 124 assets", decisionsToday: 47, successRate: 96.8, description: "Monitors bearing vibration signatures, auto-schedules maintenance windows when drift exceeds threshold.", icon: Activity },
  { id: "a2", name: "Energy Optimizer", domain: "Energy", status: "active", scope: "Plant A, Plant B", decisionsToday: 19, successRate: 92.1, description: "Adjusts duty cycles and idle thresholds in real-time to minimize kWh per output unit.", icon: Zap },
  { id: "a3", name: "Spare Parts Planner", domain: "Supply Chain", status: "active", scope: "All warehouses", decisionsToday: 8, successRate: 99.4, description: "Triggers replenishment POs when inventory + lead-time risk crosses model threshold.", icon: GitBranch },
  { id: "a4", name: "OEE Guardian", domain: "Performance", status: "learning", scope: "Production Line 3", decisionsToday: 3, successRate: 88.0, description: "Detects micro-stops and rebalances cycle time across the line.", icon: TrendingUp },
  { id: "a5", name: "Safety Compliance Bot", domain: "Compliance", status: "active", scope: "All operators", decisionsToday: 12, successRate: 100, description: "Flags unsafe operating envelopes and auto-restricts machine modes.", icon: Shield },
  { id: "a6", name: "Thermal Watchdog", domain: "Predictive Maintenance", status: "paused", scope: "Hydraulic units", decisionsToday: 0, successRate: 94.5, description: "Monitors hydraulic temperatures and triggers cool-down cycles.", icon: Cpu },
];

const initialAlerts: Alert[] = [
  { id: "al1", ts: "2 min ago", severity: "critical", agent: "Vibration Sentinel", asset: "RTG-014", message: "Bearing vibration RMS 7.2g exceeds threshold 6.0g", recommended: "Schedule bearing replacement within 48h", status: "open" },
  { id: "al2", ts: "8 min ago", severity: "warning", agent: "Energy Optimizer", asset: "Plant A — Compressor 3", message: "Idle power draw 14% above baseline", recommended: "Reduce idle duty cycle", status: "acknowledged" },
  { id: "al3", ts: "14 min ago", severity: "info", agent: "Spare Parts Planner", asset: "Warehouse EU-2", message: "Hydraulic seal kit projected stockout in 9 days", recommended: "Auto-PO created with supplier KMR-117", status: "auto-resolved" },
  { id: "al4", ts: "27 min ago", severity: "warning", agent: "OEE Guardian", asset: "Line 3 — Station 4", message: "Micro-stops up 31% over rolling 4h", recommended: "Inspect feeder mechanism", status: "open" },
  { id: "al5", ts: "41 min ago", severity: "critical", agent: "Thermal Watchdog", asset: "HYD-002", message: "Oil temp 92°C trending toward 95°C cutoff", recommended: "Initiate cool-down cycle", status: "auto-resolved" },
  { id: "al6", ts: "1 hr ago", severity: "info", agent: "Safety Compliance Bot", asset: "Operator #4421", message: "Out-of-envelope joystick command blocked", recommended: "Operator retraining suggested", status: "acknowledged" },
];

const initialLoops: LoopAction[] = [
  { id: "l1", ts: "14 min ago", agent: "Spare Parts Planner", trigger: "Stockout risk > 80%", action: "PO #48217 issued — 24 units hydraulic seal kit", asset: "Warehouse EU-2", outcome: "success", impact: "Avoided 2-day downtime" },
  { id: "l2", ts: "41 min ago", agent: "Thermal Watchdog", trigger: "Oil temp trend > cutoff", action: "Cool-down cycle initiated, load reduced 30%", asset: "HYD-002", outcome: "success", impact: "Prevented thermal trip" },
  { id: "l3", ts: "1 hr ago", agent: "Energy Optimizer", trigger: "Idle draw > baseline +12%", action: "Compressor unloader timing adjusted", asset: "Plant A — C3", outcome: "success", impact: "−6.2% energy/h" },
  { id: "l4", ts: "2 hr ago", agent: "Vibration Sentinel", trigger: "RMS drift sustained 30 min", action: "Maintenance window proposed — pending approval", asset: "RTG-009", outcome: "pending", impact: "Estimated save: €18,400" },
  { id: "l5", ts: "3 hr ago", agent: "Safety Compliance Bot", trigger: "Speed envelope violation", action: "Machine mode restricted to ECO", asset: "FLT-221", outcome: "success", impact: "Compliance preserved" },
];

const decisionTrend = [
  { hour: "00", decisions: 4 }, { hour: "02", decisions: 3 }, { hour: "04", decisions: 6 },
  { hour: "06", decisions: 12 }, { hour: "08", decisions: 22 }, { hour: "10", decisions: 28 },
  { hour: "12", decisions: 34 }, { hour: "14", decisions: 41 }, { hour: "16", decisions: 38 },
  { hour: "18", decisions: 29 }, { hour: "20", decisions: 18 }, { hour: "22", decisions: 9 },
];

const severityStyles: Record<Severity, { bg: string; text: string; dot: string }> = {
  critical: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
  warning: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  info: { bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400", dot: "bg-sky-500" },
};

const statusBadge: Record<AgentStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  paused: "bg-muted text-muted-foreground border-border",
  learning: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
};

function Kpi({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub: string; icon: typeof Bot; accent: string }) {
  return (
    <Card className="p-4 rounded-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
        </div>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}

export default function VectorAI() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [loops] = useState<LoopAction[]>(initialLoops);
  const [pulse, setPulse] = useState(0);

  // Simulated live tick
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => p + 1), 4000);
    return () => clearInterval(t);
  }, []);

  const toggleAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a))
    );
  };

  const ackAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "acknowledged" } : a)));
  };

  const activeAgents = agents.filter((a) => a.status === "active").length;
  const openAlerts = alerts.filter((a) => a.status === "open").length;
  const autoResolved = alerts.filter((a) => a.status === "auto-resolved").length;
  const totalDecisions = agents.reduce((s, a) => s + a.decisionsToday, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Vector AI</h1>
              <p className="text-sm text-muted-foreground">Autonomous monitoring agents · Live alerts · Closed-loop actions</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live · synced {pulse}s ago
          </span>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Active Agents" value={`${activeAgents} / ${agents.length}`} sub="Across 4 domains" icon={Bot} accent="bg-primary/10 text-primary" />
        <Kpi label="Open Alerts" value={String(openAlerts)} sub={`${autoResolved} auto-resolved today`} icon={AlertTriangle} accent="bg-destructive/10 text-destructive" />
        <Kpi label="Decisions Today" value={String(totalDecisions)} sub="Last 24 hours" icon={Activity} accent="bg-sky-500/10 text-sky-600 dark:text-sky-400" />
        <Kpi label="Auto-Resolved" value="92.4%" sub="Closed-loop success rate" icon={CheckCircle2} accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList>
          <TabsTrigger value="agents">Autonomous Agents</TabsTrigger>
          <TabsTrigger value="alerts">Live Alerts</TabsTrigger>
          <TabsTrigger value="loop">Closed-Loop Actions</TabsTrigger>
        </TabsList>

        {/* AGENTS */}
        <TabsContent value="agents" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <Card key={agent.id} className="p-4 rounded-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">{agent.name}</h3>
                          <Badge variant="outline" className={`text-[10px] ${statusBadge[agent.status]}`}>
                            {agent.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{agent.domain} · {agent.scope}</p>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{agent.description}</p>
                      </div>
                    </div>
                    <Switch checked={agent.status === "active"} onCheckedChange={() => toggleAgent(agent.id)} />
                  </div>
                  <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Decisions today</p>
                      <p className="font-semibold text-sm mt-0.5">{agent.decisionsToday}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success rate</p>
                      <p className="font-semibold text-sm mt-0.5">{agent.successRate}%</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ALERTS */}
        <TabsContent value="alerts" className="mt-4 space-y-4">
          <Card className="p-4 rounded-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Decision throughput · last 24h</h3>
              <span className="text-xs text-muted-foreground">Auto-refreshing</span>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={decisionTrend}>
                  <defs>
                    <linearGradient id="dec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="decisions" stroke="hsl(var(--primary))" fill="url(#dec)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-card overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm">Live alerts feed</h3>
              <Badge variant="secondary" className="text-[10px]">{openAlerts} open</Badge>
            </div>
            <div className="divide-y">
              {alerts.map((al) => {
                const s = severityStyles[al.severity];
                return (
                  <div key={al.id} className="p-4 flex items-start gap-3 hover:bg-muted/40 transition-colors">
                    <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] uppercase ${s.bg} ${s.text} border-transparent`}>
                          {al.severity}
                        </Badge>
                        <span className="text-xs font-medium">{al.agent}</span>
                        <span className="text-xs text-muted-foreground">· {al.asset}</span>
                        <span className="text-[11px] text-muted-foreground ml-auto flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {al.ts}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{al.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-foreground">Recommended:</span> {al.recommended}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      {al.status === "open" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => ackAlert(al.id)}>
                          Acknowledge
                        </Button>
                      )}
                      {al.status === "acknowledged" && (
                        <Badge variant="outline" className="text-[10px]">Acknowledged</Badge>
                      )}
                      {al.status === "auto-resolved" && (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                          Auto-resolved
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* CLOSED-LOOP */}
        <TabsContent value="loop" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 rounded-card">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><PlayCircle className="h-4 w-4 text-emerald-500" /> Triggered</div>
              <p className="text-2xl font-bold mt-2">{loops.length}</p>
              <p className="text-[11px] text-muted-foreground">Last 24 hours</p>
            </Card>
            <Card className="p-4 rounded-card">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Successful</div>
              <p className="text-2xl font-bold mt-2">{loops.filter((l) => l.outcome === "success").length}</p>
              <p className="text-[11px] text-muted-foreground">Auto-executed end-to-end</p>
            </Card>
            <Card className="p-4 rounded-card">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wrench className="h-4 w-4 text-amber-500" /> Awaiting approval</div>
              <p className="text-2xl font-bold mt-2">{loops.filter((l) => l.outcome === "pending").length}</p>
              <p className="text-[11px] text-muted-foreground">Human-in-the-loop</p>
            </Card>
          </div>

          <Card className="rounded-card overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Closed-loop action log</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Sense → Decide → Act → Verify</p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Time</TableHead>
                    <TableHead className="text-xs">Agent</TableHead>
                    <TableHead className="text-xs">Trigger</TableHead>
                    <TableHead className="text-xs">Action taken</TableHead>
                    <TableHead className="text-xs">Asset</TableHead>
                    <TableHead className="text-xs">Outcome</TableHead>
                    <TableHead className="text-xs">Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loops.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{l.ts}</TableCell>
                      <TableCell className="text-xs font-medium">{l.agent}</TableCell>
                      <TableCell className="text-xs">{l.trigger}</TableCell>
                      <TableCell className="text-xs">{l.action}</TableCell>
                      <TableCell className="text-xs">{l.asset}</TableCell>
                      <TableCell>
                        {l.outcome === "success" && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">success</Badge>
                        )}
                        {l.outcome === "pending" && (
                          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">pending</Badge>
                        )}
                        {l.outcome === "failed" && (
                          <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">failed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.impact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity, AlertTriangle, Bot, CheckCircle2, Clock, Cpu, GitBranch,
  PlayCircle, RefreshCw, Shield, Wrench, Zap, TrendingUp, Radar,
  Workflow, Sparkles, ArrowUpRight, ArrowDownRight, Gauge, Eye,
  Bell, Radio, ShieldCheck, Layers,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Area, AreaChart, BarChart, Bar, Legend,
} from "recharts";

// ============================================================================
// TYPES
// ============================================================================
type Severity = "critical" | "warning" | "info";
type AgentStatus = "active" | "paused" | "learning";
type Interval = "hourly" | "daily" | "monthly";

interface Agent {
  id: string;
  name: string;
  domain: string;
  status: AgentStatus;
  scope: string;
  decisionsToday: number;
  successRate: number;
  mttdSec: number;     // Mean time to detect
  mttrMin: number;     // Mean time to respond
  description: string;
  icon: typeof Bot;
}

interface Anomaly {
  id: string;
  ts: string;
  signal: string;
  asset: string;
  detectedBy: string;
  zScore: number;
  baseline: string;
  observed: string;
  confidence: number;
  classification: "drift" | "spike" | "pattern" | "outlier";
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

interface Trigger {
  id: string;
  name: string;
  condition: string;
  action: string;
  agent: string;
  enabled: boolean;
  firedToday: number;
  lastFired: string;
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
  stage: "sense" | "decide" | "act" | "verify";
}

// ============================================================================
// MOCK DATA
// ============================================================================
const initialAgents: Agent[] = [
  { id: "a1", name: "Vibration Sentinel", domain: "Predictive Maintenance", status: "active", scope: "Fleet — 124 assets", decisionsToday: 47, successRate: 96.8, mttdSec: 12, mttrMin: 4, description: "Monitors bearing vibration signatures, auto-schedules maintenance when drift exceeds threshold.", icon: Activity },
  { id: "a2", name: "Energy Optimizer", domain: "Energy", status: "active", scope: "Plant A, Plant B", decisionsToday: 19, successRate: 92.1, mttdSec: 30, mttrMin: 2, description: "Adjusts duty cycles and idle thresholds in real-time to minimize kWh per output unit.", icon: Zap },
  { id: "a3", name: "Spare Parts Planner", domain: "Supply Chain", status: "active", scope: "All warehouses", decisionsToday: 8, successRate: 99.4, mttdSec: 240, mttrMin: 15, description: "Triggers replenishment POs when inventory + lead-time risk crosses model threshold.", icon: GitBranch },
  { id: "a4", name: "OEE Guardian", domain: "Performance", status: "learning", scope: "Production Line 3", decisionsToday: 3, successRate: 88.0, mttdSec: 60, mttrMin: 8, description: "Detects micro-stops and rebalances cycle time across the line.", icon: TrendingUp },
  { id: "a5", name: "Safety Compliance Bot", domain: "Compliance", status: "active", scope: "All operators", decisionsToday: 12, successRate: 100, mttdSec: 2, mttrMin: 1, description: "Flags unsafe operating envelopes and auto-restricts machine modes.", icon: Shield },
  { id: "a6", name: "Thermal Watchdog", domain: "Predictive Maintenance", status: "paused", scope: "Hydraulic units", decisionsToday: 0, successRate: 94.5, mttdSec: 18, mttrMin: 3, description: "Monitors hydraulic temperatures and triggers cool-down cycles.", icon: Cpu },
];

const initialAnomalies: Anomaly[] = [
  { id: "an1", ts: "32s ago", signal: "Bearing RMS vibration", asset: "RTG-014", detectedBy: "Vibration Sentinel", zScore: 4.2, baseline: "5.1g", observed: "7.2g", confidence: 0.97, classification: "drift" },
  { id: "an2", ts: "2m ago", signal: "Idle power draw", asset: "Compressor 3", detectedBy: "Energy Optimizer", zScore: 2.8, baseline: "11.2 kW", observed: "12.8 kW", confidence: 0.91, classification: "drift" },
  { id: "an3", ts: "6m ago", signal: "Hydraulic oil temp", asset: "HYD-002", detectedBy: "Thermal Watchdog", zScore: 3.6, baseline: "78°C", observed: "92°C", confidence: 0.95, classification: "spike" },
  { id: "an4", ts: "11m ago", signal: "Cycle-time variance", asset: "Line 3 — Stn 4", detectedBy: "OEE Guardian", zScore: 2.1, baseline: "32.4s", observed: "41.2s", confidence: 0.84, classification: "pattern" },
  { id: "an5", ts: "18m ago", signal: "Joystick command range", asset: "Operator #4421", detectedBy: "Safety Compliance Bot", zScore: 5.4, baseline: "in-envelope", observed: "out-of-envelope", confidence: 1.0, classification: "outlier" },
];

const initialAlerts: Alert[] = [
  { id: "al1", ts: "2 min ago", severity: "critical", agent: "Vibration Sentinel", asset: "RTG-014", message: "Bearing vibration RMS 7.2g exceeds threshold 6.0g", recommended: "Schedule bearing replacement within 48h", status: "open" },
  { id: "al2", ts: "8 min ago", severity: "warning", agent: "Energy Optimizer", asset: "Plant A — Compressor 3", message: "Idle power draw 14% above baseline", recommended: "Reduce idle duty cycle", status: "acknowledged" },
  { id: "al3", ts: "14 min ago", severity: "info", agent: "Spare Parts Planner", asset: "Warehouse EU-2", message: "Hydraulic seal kit projected stockout in 9 days", recommended: "Auto-PO created with supplier KMR-117", status: "auto-resolved" },
  { id: "al4", ts: "27 min ago", severity: "warning", agent: "OEE Guardian", asset: "Line 3 — Station 4", message: "Micro-stops up 31% over rolling 4h", recommended: "Inspect feeder mechanism", status: "open" },
  { id: "al5", ts: "41 min ago", severity: "critical", agent: "Thermal Watchdog", asset: "HYD-002", message: "Oil temp 92°C trending toward 95°C cutoff", recommended: "Initiate cool-down cycle", status: "auto-resolved" },
  { id: "al6", ts: "1 hr ago", severity: "info", agent: "Safety Compliance Bot", asset: "Operator #4421", message: "Out-of-envelope joystick command blocked", recommended: "Operator retraining suggested", status: "acknowledged" },
];

const initialTriggers: Trigger[] = [
  { id: "t1", name: "Auto cool-down", condition: "Hydraulic oil temp > 90°C for 5 min", action: "Reduce load 30% + initiate cool-down cycle", agent: "Thermal Watchdog", enabled: true, firedToday: 3, lastFired: "41 min ago" },
  { id: "t2", name: "Predictive PO", condition: "Stockout risk > 80% within 14 days", action: "Issue PO to preferred supplier", agent: "Spare Parts Planner", enabled: true, firedToday: 2, lastFired: "14 min ago" },
  { id: "t3", name: "Idle compressor unload", condition: "Idle draw > baseline +12% for 10 min", action: "Adjust unloader timing -8%", agent: "Energy Optimizer", enabled: true, firedToday: 6, lastFired: "1 hr ago" },
  { id: "t4", name: "Maintenance window", condition: "Vibration RMS drift > 30 min sustained", action: "Propose maintenance window (human approval)", agent: "Vibration Sentinel", enabled: true, firedToday: 4, lastFired: "2 hr ago" },
  { id: "t5", name: "Safety mode lock", condition: "Speed envelope violation x2 in 60s", action: "Restrict to ECO mode", agent: "Safety Compliance Bot", enabled: true, firedToday: 1, lastFired: "3 hr ago" },
  { id: "t6", name: "Micro-stop rebalance", condition: "Micro-stops > +25% over rolling 4h", action: "Rebalance cycle time across stations", agent: "OEE Guardian", enabled: false, firedToday: 0, lastFired: "—" },
];

const initialLoops: LoopAction[] = [
  { id: "l1", ts: "14 min ago", agent: "Spare Parts Planner", trigger: "Stockout risk > 80%", action: "PO #48217 issued — 24 units hydraulic seal kit", asset: "Warehouse EU-2", outcome: "success", impact: "Avoided 2-day downtime", stage: "verify" },
  { id: "l2", ts: "41 min ago", agent: "Thermal Watchdog", trigger: "Oil temp trend > cutoff", action: "Cool-down cycle initiated, load reduced 30%", asset: "HYD-002", outcome: "success", impact: "Prevented thermal trip", stage: "verify" },
  { id: "l3", ts: "1 hr ago", agent: "Energy Optimizer", trigger: "Idle draw > baseline +12%", action: "Compressor unloader timing adjusted", asset: "Plant A — C3", outcome: "success", impact: "−6.2% energy/h", stage: "verify" },
  { id: "l4", ts: "2 hr ago", agent: "Vibration Sentinel", trigger: "RMS drift sustained 30 min", action: "Maintenance window proposed — pending approval", asset: "RTG-009", outcome: "pending", impact: "Estimated save: €18,400", stage: "act" },
  { id: "l5", ts: "3 hr ago", agent: "Safety Compliance Bot", trigger: "Speed envelope violation", action: "Machine mode restricted to ECO", asset: "FLT-221", outcome: "success", impact: "Compliance preserved", stage: "verify" },
];

// Performance tracking by interval
const performanceByInterval: Record<Interval, { points: { label: string; detected: number; resolved: number; auto: number }[]; uplift: { metric: string; value: string; delta: string; positive: boolean }[] }> = {
  hourly: {
    points: [
      { label: "00", detected: 4, resolved: 4, auto: 4 }, { label: "02", detected: 3, resolved: 3, auto: 2 },
      { label: "04", detected: 6, resolved: 6, auto: 5 }, { label: "06", detected: 12, resolved: 11, auto: 9 },
      { label: "08", detected: 22, resolved: 21, auto: 18 }, { label: "10", detected: 28, resolved: 27, auto: 24 },
      { label: "12", detected: 34, resolved: 33, auto: 30 }, { label: "14", detected: 41, resolved: 39, auto: 35 },
      { label: "16", detected: 38, resolved: 37, auto: 33 }, { label: "18", detected: 29, resolved: 28, auto: 25 },
      { label: "20", detected: 18, resolved: 17, auto: 14 }, { label: "22", detected: 9, resolved: 9, auto: 7 },
    ],
    uplift: [
      { metric: "Avg MTTD", value: "14s", delta: "-22%", positive: true },
      { metric: "Avg MTTR", value: "3.8 min", delta: "-18%", positive: true },
      { metric: "Auto-resolution", value: "92.4%", delta: "+4.1pp", positive: true },
      { metric: "False positives", value: "1.2%", delta: "-0.4pp", positive: true },
    ],
  },
  daily: {
    points: [
      { label: "Mon", detected: 184, resolved: 178, auto: 162 }, { label: "Tue", detected: 211, resolved: 204, auto: 188 },
      { label: "Wed", detected: 197, resolved: 192, auto: 175 }, { label: "Thu", detected: 224, resolved: 218, auto: 201 },
      { label: "Fri", detected: 246, resolved: 239, auto: 223 }, { label: "Sat", detected: 132, resolved: 130, auto: 121 },
      { label: "Sun", detected: 98, resolved: 96, auto: 88 },
    ],
    uplift: [
      { metric: "Decisions / day", value: "184", delta: "+12%", positive: true },
      { metric: "Downtime avoided", value: "11.4 h", delta: "+2.1h", positive: true },
      { metric: "Energy saved", value: "1,820 kWh", delta: "+8%", positive: true },
      { metric: "Open backlog", value: "3", delta: "-5", positive: true },
    ],
  },
  monthly: {
    points: [
      { label: "Nov", detected: 4820, resolved: 4711, auto: 4310 }, { label: "Dec", detected: 5130, resolved: 5012, auto: 4640 },
      { label: "Jan", detected: 4960, resolved: 4858, auto: 4495 }, { label: "Feb", detected: 5280, resolved: 5173, auto: 4810 },
      { label: "Mar", detected: 5640, resolved: 5532, auto: 5189 }, { label: "Apr", detected: 5910, resolved: 5798, auto: 5462 },
    ],
    uplift: [
      { metric: "Cost avoidance", value: "€412k", delta: "+€38k", positive: true },
      { metric: "Maint. interventions", value: "287", delta: "-14%", positive: true },
      { metric: "Energy savings", value: "54 MWh", delta: "+11%", positive: true },
      { metric: "Compliance score", value: "99.6%", delta: "+0.3pp", positive: true },
    ],
  },
};

const domainBreakdown = [
  { domain: "Maintenance", decisions: 142, savings: 184 },
  { domain: "Energy", decisions: 97, savings: 96 },
  { domain: "Supply", decisions: 38, savings: 64 },
  { domain: "Performance", decisions: 71, savings: 48 },
  { domain: "Compliance", decisions: 24, savings: 20 },
];

// ============================================================================
// STYLE MAPS
// ============================================================================
const severityStyles: Record<Severity, { bg: string; text: string; dot: string; ring: string }> = {
  critical: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive", ring: "ring-destructive/30" },
  warning: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning", ring: "ring-warning/30" },
  info: { bg: "bg-accent/10", text: "text-accent", dot: "bg-accent", ring: "ring-accent/30" },
};

const statusBadge: Record<AgentStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  paused: "bg-muted text-muted-foreground border-border",
  learning: "bg-accent/15 text-accent border-accent/30",
};

const classificationBadge: Record<Anomaly["classification"], string> = {
  drift: "bg-warning/10 text-warning border-warning/30",
  spike: "bg-destructive/10 text-destructive border-destructive/30",
  pattern: "bg-accent/10 text-accent border-accent/30",
  outlier: "bg-purple/10 text-purple border-purple/30",
};

// ============================================================================
// COMPONENTS
// ============================================================================
function Kpi({ label, value, sub, icon: Icon, accent, trend }: { label: string; value: string; sub: string; icon: typeof Bot; accent: string; trend?: { value: string; positive: boolean } }) {
  return (
    <Card className="p-4 rounded-card relative overflow-hidden group hover:shadow-md transition-all">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
          <p className="text-2xl font-bold mt-1.5 tracking-tight">{value}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {trend && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${trend.positive ? "text-success" : "text-destructive"}`}>
                {trend.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trend.value}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground">{sub}</p>
          </div>
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, action }: { icon: typeof Bot; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function VectorAI() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [anomalies] = useState<Anomaly[]>(initialAnomalies);
  const [triggers, setTriggers] = useState<Trigger[]>(initialTriggers);
  const [loops] = useState<LoopAction[]>(initialLoops);
  const [interval, setInterval] = useState<Interval>("hourly");
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setPulse((p) => (p + 1) % 60), 1000);
    return () => window.clearInterval(t);
  }, []);

  const toggleAgent = (id: string) =>
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a)));

  const toggleTrigger = (id: string) =>
    setTriggers((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));

  const ackAlert = (id: string) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "acknowledged" } : a)));

  const activeAgents = agents.filter((a) => a.status === "active").length;
  const openAlerts = alerts.filter((a) => a.status === "open").length;
  const autoResolved = alerts.filter((a) => a.status === "auto-resolved").length;
  const totalDecisions = agents.reduce((s, a) => s + a.decisionsToday, 0);
  const enabledTriggers = triggers.filter((t) => t.enabled).length;

  const intervalData = useMemo(() => performanceByInterval[interval], [interval]);

  return (
    <div className="space-y-6">
      {/* HERO HEADER */}
      <Card className="p-5 rounded-card border-0 bg-gradient-to-br from-primary via-primary to-sidebar-deep text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, hsl(var(--accent)) 0%, transparent 40%), radial-gradient(circle at 80% 80%, hsl(var(--teal)) 0%, transparent 40%)" }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary-foreground/10 backdrop-blur flex items-center justify-center ring-1 ring-primary-foreground/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Vector AI</h1>
                <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 text-[10px]">
                  Autonomous Intelligence Layer
                </Badge>
              </div>
              <p className="text-sm opacity-80 mt-0.5">Continuous monitoring · Anomaly detection · Real-time triggers · Closed-loop execution</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur ring-1 ring-primary-foreground/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="font-medium">Live</span>
              <span className="opacity-70">· synced {pulse}s ago</span>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* TOP KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Kpi label="Active Agents" value={`${activeAgents}/${agents.length}`} sub="Across 5 domains" icon={Bot} accent="bg-primary/10 text-primary" />
        <Kpi label="Anomalies (24h)" value={String(anomalies.length + 142)} sub="Detected & classified" icon={Radar} accent="bg-purple/10 text-purple" trend={{ value: "+8%", positive: true }} />
        <Kpi label="Open Alerts" value={String(openAlerts)} sub={`${autoResolved} auto-resolved`} icon={AlertTriangle} accent="bg-destructive/10 text-destructive" />
        <Kpi label="Decisions Today" value={String(totalDecisions)} sub="Last 24 hours" icon={Activity} accent="bg-accent/10 text-accent" trend={{ value: "+12%", positive: true }} />
        <Kpi label="Auto-Resolved" value="92.4%" sub="Closed-loop success" icon={CheckCircle2} accent="bg-success/10 text-success" trend={{ value: "+4.1pp", positive: true }} />
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full lg:w-auto">
          <TabsTrigger value="agents" className="gap-1.5"><Bot className="h-3.5 w-3.5" /> Agents</TabsTrigger>
          <TabsTrigger value="anomalies" className="gap-1.5"><Radar className="h-3.5 w-3.5" /> Anomalies</TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Alerts</TabsTrigger>
          <TabsTrigger value="triggers" className="gap-1.5"><Workflow className="h-3.5 w-3.5" /> Triggers</TabsTrigger>
          <TabsTrigger value="performance" className="gap-1.5"><Gauge className="h-3.5 w-3.5" /> Performance</TabsTrigger>
        </TabsList>

        {/* ================= AGENTS ================= */}
        <TabsContent value="agents" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <Card key={agent.id} className="p-4 rounded-card hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">{agent.name}</h3>
                          <Badge variant="outline" className={`text-[10px] capitalize ${statusBadge[agent.status]}`}>
                            {agent.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{agent.domain} · {agent.scope}</p>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{agent.description}</p>
                      </div>
                    </div>
                    <Switch checked={agent.status === "active"} onCheckedChange={() => toggleAgent(agent.id)} />
                  </div>
                  <div className="mt-4 pt-3 border-t grid grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Decisions</p>
                      <p className="font-bold text-base mt-0.5">{agent.decisionsToday}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Success</p>
                      <p className="font-bold text-base mt-0.5">{agent.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">MTTD</p>
                      <p className="font-bold text-base mt-0.5">{agent.mttdSec}s</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">MTTR</p>
                      <p className="font-bold text-base mt-0.5">{agent.mttrMin}m</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Confidence</span>
                      <span>{agent.successRate}%</span>
                    </div>
                    <Progress value={agent.successRate} className="h-1.5" />
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ================= ANOMALIES ================= */}
        <TabsContent value="anomalies" className="mt-4 space-y-4">
          <Card className="p-4 rounded-card">
            <SectionHeader
              icon={Radar}
              title="Event Detection & Anomaly Identification"
              subtitle="Statistical & ML-based deviation detection across all instrumented signals"
              action={<Badge variant="outline" className="text-[10px] bg-purple/10 text-purple border-purple/30"><Radio className="h-3 w-3 mr-1" /> Streaming</Badge>}
            />
          </Card>

          <Card className="rounded-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-[10px] uppercase tracking-wide">Detected</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Signal</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Asset</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Type</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Baseline → Observed</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Z-score</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Confidence</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anomalies.map((an) => (
                    <TableRow key={an.id} className="hover:bg-muted/40">
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{an.ts}</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{an.signal}</TableCell>
                      <TableCell className="text-xs">{an.asset}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] capitalize ${classificationBadge[an.classification]}`}>{an.classification}</Badge>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <span className="text-muted-foreground">{an.baseline}</span>
                        <span className="mx-1.5 text-muted-foreground">→</span>
                        <span className="font-semibold text-foreground">{an.observed}</span>
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold">{an.zScore.toFixed(1)}σ</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Progress value={an.confidence * 100} className="h-1.5 flex-1" />
                          <span className="text-[11px] font-semibold tabular-nums">{Math.round(an.confidence * 100)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{an.detectedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ================= ALERTS ================= */}
        <TabsContent value="alerts" className="mt-4 space-y-4">
          <Card className="p-4 rounded-card">
            <SectionHeader icon={Bell} title="Real-time Alerts Feed" subtitle="Severity-classified, deduplicated, with recommended actions" />
            <div className="mt-4 grid grid-cols-3 gap-3">
              {(["critical", "warning", "info"] as Severity[]).map((sev) => {
                const count = alerts.filter((a) => a.severity === sev).length;
                const s = severityStyles[sev];
                return (
                  <div key={sev} className={`p-3 rounded-lg ring-1 ${s.ring} ${s.bg}`}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                      <span className={`text-[10px] uppercase tracking-wide font-semibold ${s.text}`}>{sev}</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{count}</p>
                  </div>
                );
              })}
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
                        <Badge variant="outline" className={`text-[10px] uppercase ${s.bg} ${s.text} border-transparent`}>{al.severity}</Badge>
                        <span className="text-xs font-medium">{al.agent}</span>
                        <span className="text-xs text-muted-foreground">· {al.asset}</span>
                        <span className="text-[11px] text-muted-foreground ml-auto flex items-center gap-1"><Clock className="h-3 w-3" />{al.ts}</span>
                      </div>
                      <p className="text-sm mt-1">{al.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-foreground">Recommended:</span> {al.recommended}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      {al.status === "open" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => ackAlert(al.id)}>Acknowledge</Button>
                      )}
                      {al.status === "acknowledged" && (
                        <Badge variant="outline" className="text-[10px]">Acknowledged</Badge>
                      )}
                      {al.status === "auto-resolved" && (
                        <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">Auto-resolved</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* ================= TRIGGERS / CLOSED-LOOP ================= */}
        <TabsContent value="triggers" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Kpi label="Active Triggers" value={String(enabledTriggers)} sub={`${triggers.length - enabledTriggers} disabled`} icon={Workflow} accent="bg-accent/10 text-accent" />
            <Kpi label="Fired Today" value={String(triggers.reduce((s, t) => s + t.firedToday, 0))} sub="Across all rules" icon={PlayCircle} accent="bg-success/10 text-success" />
            <Kpi label="Successful Loops" value={String(loops.filter((l) => l.outcome === "success").length)} sub="Auto-executed end-to-end" icon={CheckCircle2} accent="bg-success/10 text-success" />
            <Kpi label="Awaiting Approval" value={String(loops.filter((l) => l.outcome === "pending").length)} sub="Human-in-the-loop" icon={Wrench} accent="bg-warning/10 text-warning" />
          </div>

          {/* Triggers (Automated rules) */}
          <Card className="rounded-card overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <SectionHeader icon={Workflow} title="Automated Triggers" subtitle="If-this-then-that rules executed by Vector AI agents" />
            </div>
            <div className="divide-y">
              {triggers.map((t) => (
                <div key={t.id} className="p-4 flex items-start gap-3 hover:bg-muted/40 transition-colors">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${t.enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    <Workflow className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold">{t.name}</h4>
                      <Badge variant="outline" className="text-[10px]">{t.agent}</Badge>
                      {t.enabled ? (
                        <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">enabled</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">disabled</Badge>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-md bg-muted/40 border">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">When</p>
                        <p className="mt-0.5 font-mono text-[11px]">{t.condition}</p>
                      </div>
                      <div className="p-2 rounded-md bg-accent/5 border border-accent/20">
                        <p className="text-[10px] uppercase tracking-wide text-accent">Then</p>
                        <p className="mt-0.5 text-[11px]">{t.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                      <span>Fired today: <span className="text-foreground font-semibold">{t.firedToday}</span></span>
                      <span>Last fired: <span className="text-foreground">{t.lastFired}</span></span>
                    </div>
                  </div>
                  <Switch checked={t.enabled} onCheckedChange={() => toggleTrigger(t.id)} />
                </div>
              ))}
            </div>
          </Card>

          {/* Closed-loop log */}
          <Card className="rounded-card overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Closed-loop execution log</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Sense → Decide → Act → Verify</p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-[10px] uppercase tracking-wide">Time</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Agent</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Trigger</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Action</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Asset</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Stage</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Outcome</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide">Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loops.map((l) => (
                    <TableRow key={l.id} className="hover:bg-muted/40">
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{l.ts}</TableCell>
                      <TableCell className="text-xs font-medium">{l.agent}</TableCell>
                      <TableCell className="text-xs">{l.trigger}</TableCell>
                      <TableCell className="text-xs">{l.action}</TableCell>
                      <TableCell className="text-xs">{l.asset}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] capitalize bg-accent/10 text-accent border-accent/30">{l.stage}</Badge>
                      </TableCell>
                      <TableCell>
                        {l.outcome === "success" && (
                          <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">success</Badge>
                        )}
                        {l.outcome === "pending" && (
                          <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">pending</Badge>
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

        {/* ================= PERFORMANCE TRACKING ================= */}
        <TabsContent value="performance" className="mt-4 space-y-4">
          <Card className="p-4 rounded-card">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <SectionHeader icon={Gauge} title="Performance Tracking" subtitle="Detection, resolution and impact across configurable intervals" />
              <Select value={interval} onValueChange={(v) => setInterval(v as Interval)}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {intervalData.uplift.map((u) => (
                <div key={u.metric} className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{u.metric}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-xl font-bold tracking-tight">{u.value}</p>
                    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${u.positive ? "text-success" : "text-destructive"}`}>
                      {u.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {u.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-4 rounded-card lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm capitalize">{interval} throughput · detected vs resolved</h3>
                <Badge variant="outline" className="text-[10px]">Auto-refreshing</Badge>
              </div>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={intervalData.points}>
                    <defs>
                      <linearGradient id="vDet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="vRes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="detected" name="Detected" stroke="hsl(var(--accent))" fill="url(#vDet)" strokeWidth={2} />
                    <Area type="monotone" dataKey="resolved" name="Resolved" stroke="hsl(var(--success))" fill="url(#vRes)" strokeWidth={2} />
                    <Line type="monotone" dataKey="auto" name="Auto-resolved" stroke="hsl(var(--purple))" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4 rounded-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">By domain</h3>
                <Badge variant="outline" className="text-[10px]">Decisions / savings</Badge>
              </div>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainBreakdown} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="domain" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={90} />
                    <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="decisions" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="p-4 rounded-card">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold">Governance & audit</h4>
                <p className="text-xs text-muted-foreground mt-0.5">All Vector AI decisions are logged with full traceability — input signals, model version, confidence, action taken, and verification outcome. SOC 2 Type II ready.</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2"><Eye className="h-3.5 w-3.5" /> Audit log</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

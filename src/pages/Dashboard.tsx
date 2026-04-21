import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Cpu, Cog, Search, Activity, Thermometer, Gauge, Wrench, AlertTriangle, Zap,
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { fleetMachines, telemetry24h, type Machine } from "@/data/machineData";
import { useMachineScope } from "@/contexts/MachineScopeContext";

const statusColor: Record<Machine["status"], string> = {
  Running: "bg-success/10 text-success border-success/20",
  Idle: "bg-warning/10 text-warning border-warning/20",
  Maintenance: "bg-accent/10 text-accent border-accent/20",
  Fault: "bg-destructive/10 text-destructive border-destructive/20",
};

function FleetView({ onSelect }: { onSelect: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filtered = fleetMachines.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fleetStats = {
    total: fleetMachines.length,
    running: fleetMachines.filter((m) => m.status === "Running").length,
    avgOEE: Math.round(fleetMachines.reduce((acc, m) => acc + m.oee, 0) / fleetMachines.length),
    atRisk: fleetMachines.filter((m) => m.riskScore > 50).length,
  };

  const oeeChartData = fleetMachines.map((m) => ({ name: m.id, oee: m.oee, target: 80 }));

  return (
    <div className="space-y-6">
      {/* Fleet KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Machines", value: fleetStats.total, icon: Cpu, color: "text-accent" },
          { label: "Running Now", value: fleetStats.running, icon: Activity, color: "text-success" },
          { label: "Avg Fleet OEE", value: `${fleetStats.avgOEE}%`, icon: Gauge, color: "text-purple" },
          { label: "At-Risk Machines", value: fleetStats.atRisk, icon: AlertTriangle, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label} className="rounded-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* OEE per Machine */}
      <Card className="rounded-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">OEE by Machine</h2>
          <Badge variant="outline" className="text-[10px]">Target: 80%</Badge>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={oeeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="oee" radius={[6, 6, 0, 0]}>
                {oeeChartData.map((d, i) => (
                  <Cell key={i} fill={d.oee >= 80 ? "hsl(var(--success))" : d.oee >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Filters + Table */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search machines…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5">
          {["All", "Running", "Idle", "Maintenance", "Fault"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-button border px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-accent text-accent-foreground border-accent" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card className="rounded-card p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Cog className="h-4 w-4 text-accent" /> Fleet Roster ({filtered.length})
        </h3>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Machine</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">OEE</TableHead>
              <TableHead className="text-right">Risk</TableHead>
              <TableHead>Next PM</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id} className="cursor-pointer hover:bg-muted/30" onClick={() => onSelect(m.id)}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-sm">{m.name}</span>
                    <span className="text-[10px] text-muted-foreground">{m.id} • {m.location}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{m.type}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] ${statusColor[m.status]}`}>{m.status}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-xs">{m.oee}%</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className={`text-[10px] ${
                    m.riskScore > 60 ? "bg-destructive/10 text-destructive border-destructive/20" :
                    m.riskScore > 30 ? "bg-warning/10 text-warning border-warning/20" :
                    "bg-success/10 text-success border-success/20"
                  }`}>
                    {m.riskScore}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{m.nextMaintenance}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onSelect(m.id); }}>
                    Inspect →
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function SingleMachineView({ machineId }: { machineId: string }) {
  const machine = fleetMachines.find((m) => m.id === machineId) ?? fleetMachines[0];

  const oeeBreakdown = [
    { name: "Availability", value: machine.availability },
    { name: "Performance", value: machine.performance },
    { name: "Quality", value: machine.quality },
  ];

  return (
    <div className="space-y-6">
      {/* Machine header */}
      <Card className="rounded-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Cog className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{machine.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {machine.id} • {machine.type} • {machine.location} • {machine.line}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs ${statusColor[machine.status]}`}>{machine.status}</Badge>
        </div>
      </Card>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "OEE", value: `${machine.oee}%`, icon: Gauge, color: "text-accent" },
          { label: "Availability", value: `${machine.availability}%`, icon: Activity, color: "text-success" },
          { label: "Performance", value: `${machine.performance}%`, icon: Zap, color: "text-purple" },
          { label: "Quality", value: `${machine.quality}%`, icon: Cpu, color: "text-teal" },
        ].map((s) => (
          <Card key={s.label} className="rounded-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Telemetry charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-destructive" /> Temperature (24h)
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetry24h}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="temperature" stroke="hsl(var(--destructive))" strokeWidth={2} fill="url(#tempGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" /> Vibration (24h)
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry24h}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="vibration" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-purple" /> Output (units / hr, 24h)
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={telemetry24h}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="output" fill="hsl(var(--purple))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-success" /> OEE Breakdown
          </h3>
          <div className="space-y-3 mt-4">
            {oeeBreakdown.map((b) => (
              <div key={b.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{b.name}</span>
                  <span className="text-xs font-mono">{b.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${b.value}%`,
                      background: b.value >= 90 ? "hsl(var(--success))" : b.value >= 70 ? "hsl(var(--accent))" : "hsl(var(--warning))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Risk Score</span>
              <Badge variant="outline" className={`text-[10px] ${
                machine.riskScore > 60 ? "bg-destructive/10 text-destructive border-destructive/20" :
                machine.riskScore > 30 ? "bg-warning/10 text-warning border-warning/20" :
                "bg-success/10 text-success border-success/20"
              }`}>
                {machine.riskScore} / 100
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Maintenance */}
      <Card className="rounded-card p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Wrench className="h-4 w-4 text-accent" /> Maintenance Schedule
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Last Maintenance</p>
            <p className="mt-1 font-medium">{machine.lastMaintenance}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Next Maintenance</p>
            <p className={`mt-1 font-medium ${machine.nextMaintenance === "OVERDUE" ? "text-destructive" : ""}`}>
              {machine.nextMaintenance}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Uptime (current run)</p>
            <p className="mt-1 font-medium">{machine.uptimeHours} hrs</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { scope, setScope, selectedMachineId, setSelectedMachineId } = useMachineScope();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{scope === "fleet" ? "Fleet View" : "Machine View"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {scope === "fleet"
              ? "Aggregated health and performance across all machines"
              : "Deep telemetry and KPIs for a single machine"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {scope === "single" && (
            <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
              <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {fleetMachines.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.id} — {m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="flex rounded-button border bg-card p-0.5">
            <button
              onClick={() => setScope("single")}
              className={`flex items-center gap-1.5 rounded-button px-3 py-1.5 text-xs font-medium transition-colors ${
                scope === "single" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Cog className="h-3.5 w-3.5" /> Machine View
            </button>
            <button
              onClick={() => setScope("fleet")}
              className={`flex items-center gap-1.5 rounded-button px-3 py-1.5 text-xs font-medium transition-colors ${
                scope === "fleet" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" /> Fleet View
            </button>
          </div>
        </div>
      </div>

      {scope === "fleet" ? (
        <FleetView
          onSelect={(id) => {
            setSelectedMachineId(id);
            setScope("single");
          }}
        />
      ) : (
        <SingleMachineView machineId={selectedMachineId} />
      )}
    </div>
  );
}

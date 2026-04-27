import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FlaskConical, Download, Database, FileSpreadsheet, RefreshCw, Send,
  Sparkles, Settings2, Wand2, CheckCircle2, Search, Truck, Container, Forklift,
} from "lucide-react";
import { toast } from "sonner";

/* ────────────────────────────────────────────────────────────────────────────
   Kalmar machine catalog — focused, realistic subset for ingestion testing
   ──────────────────────────────────────────────────────────────────────── */

type Category = "Reachstacker" | "Terminal Tractor" | "Straddle Carrier" | "Empty Container Handler" | "Forklift";
type Fuel = "Diesel" | "Electric" | "Hybrid";

interface KalmarMachine {
  id: string;
  model: string;
  category: Category;
  capacityTon: number;
  fuel: Fuel;
  baseTempC: number;
  baseVibration: number;
  basePressure: number;
  baseEnergyKwh: number;
  serial: string;
  site: string;
}

const kalmarMachines: KalmarMachine[] = [
  { id: "KAL-RS-01", model: "Kalmar DRG450",        category: "Reachstacker",            capacityTon: 45, fuel: "Diesel",   baseTempC: 78, baseVibration: 2.6, basePressure: 180, baseEnergyKwh: 42, serial: "DRG450-2024-001", site: "Rotterdam APM" },
  { id: "KAL-RS-02", model: "Kalmar DRG420",        category: "Reachstacker",            capacityTon: 42, fuel: "Diesel",   baseTempC: 76, baseVibration: 2.5, basePressure: 175, baseEnergyKwh: 40, serial: "DRG420-2023-118", site: "Rotterdam APM" },
  { id: "KAL-TT-01", model: "Kalmar T2 Electric",   category: "Terminal Tractor",        capacityTon: 32, fuel: "Electric", baseTempC: 48, baseVibration: 1.4, basePressure: 120, baseEnergyKwh: 28, serial: "T2E-2025-014",   site: "Antwerp PSA" },
  { id: "KAL-TT-02", model: "Kalmar Ottawa T2",     category: "Terminal Tractor",        capacityTon: 30, fuel: "Diesel",   baseTempC: 70, baseVibration: 1.7, basePressure: 130, baseEnergyKwh: 22, serial: "OTT-2024-203",   site: "Antwerp PSA" },
  { id: "KAL-SC-01", model: "Kalmar AutoStrad",     category: "Straddle Carrier",        capacityTon: 60, fuel: "Hybrid",   baseTempC: 65, baseVibration: 2.1, basePressure: 145, baseEnergyKwh: 36, serial: "ASC-2024-027",   site: "Brisbane Patrick" },
  { id: "KAL-EH-01", model: "Kalmar DCG90-45ED",    category: "Empty Container Handler", capacityTon: 9,  fuel: "Diesel",   baseTempC: 72, baseVibration: 1.9, basePressure: 150, baseEnergyKwh: 24, serial: "DCG90-2024-044", site: "Hamburg HHLA" },
  { id: "KAL-FL-01", model: "Kalmar DCG180-12LB",   category: "Forklift",                capacityTon: 18, fuel: "Diesel",   baseTempC: 68, baseVibration: 1.6, basePressure: 135, baseEnergyKwh: 20, serial: "DCG180-2023-77", site: "Hamburg HHLA" },
];

const categoryIcon: Record<Category, typeof Truck> = {
  "Reachstacker": Container,
  "Terminal Tractor": Truck,
  "Straddle Carrier": Container,
  "Empty Container Handler": Container,
  "Forklift": Forklift,
};

/* ────────────────────────────────────────────────────────────────────────────
   Schema + generation
   ──────────────────────────────────────────────────────────────────────── */

const COLUMNS = [
  "timestamp", "machine_id", "model", "category", "fuel_type", "site",
  "load_ton", "speed_kmph", "engine_temp_c", "vibration_mms",
  "hydraulic_pressure_bar", "energy_consumption_kwh", "container_moves",
  "fuel_level_pct", "battery_soc_pct", "operator_id", "shift",
  "anomaly_score", "maintenance_flag", "location_zone",
] as const;

type ScenarioPreset = "normal" | "wear" | "overheat" | "vibration" | "energy_spike" | "mixed";

const scenarioPresets: { id: ScenarioPreset; label: string; description: string }[] = [
  { id: "normal",       label: "Normal Operations",      description: "Healthy baseline telemetry with light noise." },
  { id: "wear",         label: "Progressive Wear",       description: "Slow degradation across the time window." },
  { id: "overheat",     label: "Overheating Event",      description: "Temperature spikes during peak shifts." },
  { id: "vibration",    label: "Vibration Anomaly",      description: "Bearing-style vibration anomalies." },
  { id: "energy_spike", label: "Energy Consumption Spike", description: "Unexpected energy draw bursts." },
  { id: "mixed",        label: "Mixed Faults",           description: "Random combination of the above." },
];

interface GenConfig {
  days: number;
  hoursPerDay: number;
  intervalMin: 15 | 30 | 60;
  scenario: ScenarioPreset;
  anomalyRate: number; // 0–100
  noise: number;       // 0–100
  startDate: string;   // YYYY-MM-DD
  prompt: string;
}

function ts(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function applyScenario(scenario: ScenarioPreset, hour: number, day: number, anomalyRate: number) {
  const trigger = Math.random() * 100 < anomalyRate;
  switch (scenario) {
    case "overheat":     return { tempBoost: trigger ? 8 + Math.random() * 6 : 0, vibBoost: 0, energyBoost: 0, wear: 0 };
    case "vibration":    return { tempBoost: 0, vibBoost: trigger ? 0.8 + Math.random() * 0.7 : 0, energyBoost: 0, wear: 0 };
    case "energy_spike": return { tempBoost: 0, vibBoost: 0, energyBoost: trigger ? 8 + Math.random() * 10 : 0, wear: 0 };
    case "wear":         return { tempBoost: day * 0.4, vibBoost: day * 0.05, energyBoost: day * 0.3, wear: day * 0.02 };
    case "mixed":        return { tempBoost: trigger ? Math.random() * 8 : 0, vibBoost: trigger ? Math.random() * 0.6 : 0, energyBoost: trigger ? Math.random() * 6 : 0, wear: day * 0.01 };
    default:             return { tempBoost: 0, vibBoost: 0, energyBoost: 0, wear: 0 };
  }
}

function generateRow(m: KalmarMachine, date: Date, day: number, cfg: GenConfig) {
  const hour = date.getHours();
  const shift = hour < 8 ? "C" : hour < 16 ? "A" : "B";
  const operators = ["OP-12", "OP-07", "OP-19", "OP-22", "OP-31"];
  const zones = ["Yard-A", "Yard-B", "Quay-1", "Quay-2", "Stack-N"];
  const noiseAmt = (cfg.noise / 100) * 2;
  const noise = () => (Math.random() - 0.5) * noiseAmt;
  const sc = applyScenario(cfg.scenario, hour, day, cfg.anomalyRate);

  const load = +(m.capacityTon * (0.5 + Math.random() * 0.5)).toFixed(1);
  const speed = +(8 + Math.random() * 18).toFixed(1);
  const temp = +(m.baseTempC + Math.sin(hour / 4) * 5 + noise() * 3 + sc.tempBoost + sc.wear).toFixed(1);
  const vib  = +(m.baseVibration + noise() * 0.4 + sc.vibBoost + sc.wear * 0.05).toFixed(2);
  const press = +(m.basePressure + noise() * 8).toFixed(1);
  const energy = +(m.baseEnergyKwh + (load / m.capacityTon) * 6 + noise() + sc.energyBoost + sc.wear * 0.4).toFixed(2);
  const moves = Math.round(2 + Math.random() * 4);
  const fuelLvl = m.fuel === "Electric" ? 0 : +(40 + Math.random() * 55).toFixed(1);
  const batt = m.fuel === "Diesel" ? 0 : +(35 + Math.random() * 60).toFixed(1);
  const anomaly = +(Math.max(0,
    (vib - m.baseVibration) / 2 +
    (temp - m.baseTempC) / 50 +
    (energy - m.baseEnergyKwh) / 80 +
    Math.random() * 0.05
  ).toFixed(3));
  const maintFlag = anomaly > 0.18 ? 1 : 0;

  return [
    ts(date), m.id, m.model, m.category, m.fuel, m.site,
    load, speed, temp, vib, press, energy, moves,
    fuelLvl, batt, operators[hour % operators.length], shift,
    anomaly, maintFlag, zones[(hour + day) % zones.length],
  ];
}

function rowsToCSV(rows: (string | number)[][]) {
  return [
    COLUMNS.join(","),
    ...rows.map((r) => r.map((c) => typeof c === "string" && c.includes(",") ? `"${c}"` : String(c)).join(",")),
  ].join("\n");
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Lightweight prompt parser — adjusts cfg based on natural language */
function applyPromptToConfig(prompt: string, cfg: GenConfig): GenConfig {
  if (!prompt.trim()) return cfg;
  const p = prompt.toLowerCase();
  const next = { ...cfg };
  if (/overheat|temperature|hot/.test(p))            next.scenario = "overheat";
  else if (/vibrat|bearing|shake/.test(p))           next.scenario = "vibration";
  else if (/energy|power|consumption|spike/.test(p)) next.scenario = "energy_spike";
  else if (/wear|degrad|aging/.test(p))              next.scenario = "wear";
  else if (/mixed|random|multiple/.test(p))          next.scenario = "mixed";

  const days = p.match(/(\d+)\s*day/);   if (days)  next.days = Math.min(30, Math.max(1, +days[1]));
  const hrs  = p.match(/(\d+)\s*hour/);  if (hrs)   next.hoursPerDay = Math.min(24, Math.max(1, +hrs[1]));
  if (/heavy|severe|critical/.test(p))   next.anomalyRate = Math.max(next.anomalyRate, 35);
  if (/light|mild|few/.test(p))          next.anomalyRate = Math.min(next.anomalyRate, 8);
  if (/clean|low\s*noise/.test(p))       next.noise = 10;
  if (/noisy|messy/.test(p))             next.noise = 60;
  return next;
}

/* ────────────────────────────────────────────────────────────────────────── */

export default function DataPreparation() {
  const today = new Date().toISOString().slice(0, 10);
  const [step, setStep] = useState<"select" | "configure" | "generate">("select");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | Category>("All");
  const [selected, setSelected] = useState<string[]>([kalmarMachines[0].id, kalmarMachines[2].id]);

  const [cfg, setCfg] = useState<GenConfig>({
    days: 2,
    hoursPerDay: 24,
    intervalMin: 60,
    scenario: "normal",
    anomalyRate: 12,
    noise: 25,
    startDate: today,
    prompt: "",
  });

  const [format, setFormat] = useState<"csv" | "xlsx">("csv");
  const [generatedRows, setGeneratedRows] = useState<(string | number)[][]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const filteredMachines = useMemo(() => {
    return kalmarMachines.filter((m) => {
      if (categoryFilter !== "All" && m.category !== categoryFilter) return false;
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return m.model.toLowerCase().includes(s) || m.id.toLowerCase().includes(s) || m.site.toLowerCase().includes(s);
    });
  }, [search, categoryFilter]);

  const selectedMachines = kalmarMachines.filter((m) => selected.includes(m.id));
  const intervalsPerHour = 60 / cfg.intervalMin;
  const estimatedRows = Math.round(selectedMachines.length * cfg.days * cfg.hoursPerDay * intervalsPerHour);

  const toggleAll = (checked: boolean) =>
    setSelected(checked ? filteredMachines.map((m) => m.id) : []);

  const handleApplyPrompt = () => {
    const next = applyPromptToConfig(cfg.prompt, cfg);
    setCfg(next);
    toast.success("Prompt applied to generation settings");
  };

  const handleGenerate = () => {
    if (selectedMachines.length === 0) { toast.error("Select at least one machine"); return; }
    const rows: (string | number)[][] = [];
    const start = new Date(cfg.startDate + "T00:00:00");
    for (let d = 0; d < cfg.days; d++) {
      for (let h = 0; h < cfg.hoursPerDay; h++) {
        for (let i = 0; i < intervalsPerHour; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + d);
          date.setHours(h, i * cfg.intervalMin, 0, 0);
          for (const m of selectedMachines) rows.push(generateRow(m, date, d, cfg));
        }
      }
    }
    setGeneratedRows(rows);
    setGeneratedAt(new Date().toLocaleString());
    setStep("generate");
    toast.success(`Generated ${rows.length.toLocaleString()} rows across ${selectedMachines.length} machines`);
  };

  const handleExport = () => {
    if (!generatedRows.length) { toast.error("Generate data first"); return; }
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `kalmar_${cfg.scenario}_${stamp}.${format === "xlsx" ? "csv" : "csv"}`;
    downloadFile(filename, rowsToCSV(generatedRows), "text/csv");
    if (format === "xlsx") toast.info("Exported as CSV (Excel-compatible).");
    toast.success(`Exported ${filename}`);
  };

  const handlePushToIngestion = () => {
    if (!generatedRows.length) { toast.error("Generate data first"); return; }
    const csv = rowsToCSV(generatedRows);
    const payload = {
      name: `kalmar_${cfg.scenario}_${Date.now()}.csv`,
      size: `${(csv.length / 1024).toFixed(1)} KB`,
      type: "CSV",
      uploadedAt: "Just now",
      rows: generatedRows.length,
      columns: COLUMNS.length,
      source: `Data Preparation • ${selectedMachines.length} machines • ${cfg.scenario}`,
      content: csv,
      generatedAt,
    };
    const existing = JSON.parse(localStorage.getItem("datapx1.preparedDatasets") || "[]");
    localStorage.setItem("datapx1.preparedDatasets", JSON.stringify([payload, ...existing]));
    toast.success("Dataset pushed to Data Ingestion");
  };

  const preview = useMemo(() => generatedRows.slice(0, 10), [generatedRows]);
  const categories: ("All" | Category)[] = ["All", "Reachstacker", "Terminal Tractor", "Straddle Carrier", "Empty Container Handler", "Forklift"];

  /* ─── Render ────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-accent" /> Data Preparation
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">
            Generate realistic Kalmar machine telemetry. Pick equipment, configure the scenario,
            describe what you want in plain English, then export or push directly into Data Ingestion.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs">
          <Badge variant="outline" className="gap-1"><Database className="h-3 w-3" /> {COLUMNS.length} columns</Badge>
          <Badge variant="outline" className="gap-1"><CheckCircle2 className="h-3 w-3 text-success" /> Ingestion-ready</Badge>
        </div>
      </div>

      {/* Stepper */}
      <Card className="rounded-card p-4">
        <Tabs value={step} onValueChange={(v) => setStep(v as typeof step)}>
          <TabsList className="grid grid-cols-3 w-full max-w-2xl">
            <TabsTrigger value="select" className="gap-2"><Database className="h-4 w-4" /> 1. Select Machines</TabsTrigger>
            <TabsTrigger value="configure" className="gap-2"><Settings2 className="h-4 w-4" /> 2. Configure & Prompt</TabsTrigger>
            <TabsTrigger value="generate" className="gap-2"><Sparkles className="h-4 w-4" /> 3. Generate & Export</TabsTrigger>
          </TabsList>

          {/* STEP 1 — SELECT */}
          <TabsContent value="select" className="mt-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by model, ID, or site…" className="pl-9" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <Button key={c} size="sm" variant={categoryFilter === c ? "default" : "outline"}
                    onClick={() => setCategoryFilter(c)} className="h-7 text-xs">
                    {c}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filteredMachines.length > 0 && filteredMachines.every((m) => selected.includes(m.id))}
                  onCheckedChange={(v) => toggleAll(!!v)}
                />
                Select all visible ({filteredMachines.length})
              </label>
              <span><span className="font-semibold text-foreground">{selected.length}</span> selected</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredMachines.map((m) => {
                const Icon = categoryIcon[m.category];
                const isSel = selected.includes(m.id);
                return (
                  <label key={m.id}
                    className={`flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors ${isSel ? "border-accent bg-accent/5" : "hover:bg-muted/40"}`}>
                    <Checkbox
                      checked={isSel}
                      onCheckedChange={(v) => setSelected((prev) => (v ? [...prev, m.id] : prev.filter((x) => x !== m.id)))}
                      className="mt-0.5"
                    />
                    <div className={`h-9 w-9 rounded-md flex items-center justify-center shrink-0 ${isSel ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{m.model}</span>
                        <Badge variant="outline" className="text-[10px]">{m.category}</Badge>
                        <Badge variant="outline" className="text-[10px]">{m.fuel}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 truncate">
                        {m.id} • {m.serial} • {m.capacityTon}t • {m.site}
                      </p>
                    </div>
                  </label>
                );
              })}
              {filteredMachines.length === 0 && (
                <div className="md:col-span-2 text-center text-sm text-muted-foreground py-10">
                  No machines match your filters.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep("configure")} disabled={selected.length === 0} className="gap-2">
                Continue <Settings2 className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* STEP 2 — CONFIGURE */}
          <TabsContent value="configure" className="mt-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Prompt panel */}
              <Card className="rounded-card p-5 lg:col-span-2 space-y-3 border-accent/30 bg-accent/5">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold">Describe the dataset (optional)</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Type a natural-language brief — we'll auto-tune the scenario, anomaly rate, and time window.
                </p>
                <Textarea
                  value={cfg.prompt}
                  onChange={(e) => setCfg({ ...cfg, prompt: e.target.value })}
                  placeholder="e.g. Generate 5 days of telemetry with severe overheating during night shifts, low noise."
                  className="min-h-[110px] bg-background"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Heavy vibration anomalies over 3 days",
                    "Mild overheating during peak shifts",
                    "Progressive wear over a week",
                    "Energy spikes, clean baseline",
                  ].map((s) => (
                    <Button key={s} size="sm" variant="outline" className="h-7 text-[11px]"
                      onClick={() => setCfg({ ...cfg, prompt: s })}>
                      {s}
                    </Button>
                  ))}
                </div>
                <Button size="sm" onClick={handleApplyPrompt} className="gap-2" disabled={!cfg.prompt.trim()}>
                  <Sparkles className="h-4 w-4" /> Apply prompt to settings
                </Button>
              </Card>

              {/* Summary */}
              <Card className="rounded-card p-5 space-y-3">
                <h3 className="text-sm font-semibold">Selection Summary</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Machines</span><span className="font-semibold">{selectedMachines.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Days</span><span className="font-semibold">{cfg.days}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Hours/day</span><span className="font-semibold">{cfg.hoursPerDay}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Interval</span><span className="font-semibold">{cfg.intervalMin} min</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Scenario</span><span className="font-semibold capitalize">{cfg.scenario.replace("_", " ")}</span></div>
                  <Separator className="my-2" />
                  <div className="flex justify-between"><span className="text-muted-foreground">Estimated rows</span><span className="font-semibold text-accent">{estimatedRows.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Columns</span><span className="font-semibold">{COLUMNS.length}</span></div>
                </div>
                <Button onClick={handleGenerate} className="w-full gap-2 mt-2">
                  <RefreshCw className="h-4 w-4" /> Generate Dataset
                </Button>
              </Card>

              {/* Time settings */}
              <Card className="rounded-card p-5 space-y-4 lg:col-span-2">
                <h3 className="text-sm font-semibold">Time Window</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Start date</Label>
                    <Input type="date" value={cfg.startDate} onChange={(e) => setCfg({ ...cfg, startDate: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Days</Label>
                    <Input type="number" min={1} max={30} value={cfg.days}
                      onChange={(e) => setCfg({ ...cfg, days: Math.max(1, Math.min(30, +e.target.value || 1)) })} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Hours per day</Label>
                    <Input type="number" min={1} max={24} value={cfg.hoursPerDay}
                      onChange={(e) => setCfg({ ...cfg, hoursPerDay: Math.max(1, Math.min(24, +e.target.value || 1)) })} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Sampling interval</Label>
                    <Select value={String(cfg.intervalMin)} onValueChange={(v) => setCfg({ ...cfg, intervalMin: +v as 15 | 30 | 60 })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Every 15 minutes</SelectItem>
                        <SelectItem value="30">Every 30 minutes</SelectItem>
                        <SelectItem value="60">Every hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Scenario + anomalies */}
              <Card className="rounded-card p-5 space-y-4">
                <h3 className="text-sm font-semibold">Scenario & Anomalies</h3>
                <div>
                  <Label className="text-xs">Scenario preset</Label>
                  <Select value={cfg.scenario} onValueChange={(v) => setCfg({ ...cfg, scenario: v as ScenarioPreset })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {scenarioPresets.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    {scenarioPresets.find((s) => s.id === cfg.scenario)?.description}
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-xs">
                    <Label>Anomaly rate</Label>
                    <span className="font-semibold">{cfg.anomalyRate}%</span>
                  </div>
                  <Slider value={[cfg.anomalyRate]} min={0} max={60} step={1}
                    onValueChange={(v) => setCfg({ ...cfg, anomalyRate: v[0] })} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs">
                    <Label>Sensor noise</Label>
                    <span className="font-semibold">{cfg.noise}%</span>
                  </div>
                  <Slider value={[cfg.noise]} min={0} max={100} step={1}
                    onValueChange={(v) => setCfg({ ...cfg, noise: v[0] })} className="mt-2" />
                </div>
              </Card>
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep("select")}>← Back</Button>
              <Button onClick={handleGenerate} className="gap-2">
                <Sparkles className="h-4 w-4" /> Generate Dataset
              </Button>
            </div>
          </TabsContent>

          {/* STEP 3 — GENERATE */}
          <TabsContent value="generate" className="mt-5 space-y-4">
            {generatedRows.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No dataset generated yet.</p>
                <Button onClick={() => setStep("configure")} className="mt-4 gap-2">
                  <Settings2 className="h-4 w-4" /> Configure generation
                </Button>
              </div>
            ) : (
              <Card className="rounded-card p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-success" /> Dataset Preview
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {generatedRows.length.toLocaleString()} rows • {COLUMNS.length} columns • {selectedMachines.length} machines • Generated {generatedAt}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Select value={format} onValueChange={(v) => setFormat(v as "csv" | "xlsx")}>
                      <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV (.csv)</SelectItem>
                        <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                      <Download className="h-4 w-4" /> Export
                    </Button>
                    <Button size="sm" onClick={handlePushToIngestion} className="gap-2">
                      <Send className="h-4 w-4" /> Push to Data Ingestion
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="rounded-md border p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total rows</p>
                    <p className="text-lg font-semibold mt-0.5">{generatedRows.length.toLocaleString()}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Anomalies</p>
                    <p className="text-lg font-semibold mt-0.5 text-warning">
                      {generatedRows.filter((r) => (r[18] as number) === 1).length.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg energy (kWh)</p>
                    <p className="text-lg font-semibold mt-0.5">
                      {(generatedRows.reduce((a, r) => a + (r[11] as number), 0) / generatedRows.length).toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Scenario</p>
                    <p className="text-sm font-semibold mt-0.5 capitalize">{cfg.scenario.replace("_", " ")}</p>
                  </div>
                </div>

                <div className="overflow-auto rounded-md border max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        {COLUMNS.map((c) => (
                          <TableHead key={c} className="text-[10px] whitespace-nowrap">{c}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.map((row, i) => (
                        <TableRow key={i}>
                          {row.map((cell, j) => (
                            <TableCell key={j} className="text-[11px] whitespace-nowrap font-mono">{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">Showing first 10 rows.</p>
              </Card>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("configure")}>← Back to settings</Button>
              {generatedRows.length > 0 && (
                <Button variant="outline" onClick={handleGenerate} className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Regenerate
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { FlaskConical, Download, Database, FileSpreadsheet, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";

// ─── Kalmar machine catalog (focused subset) ──────────────────────────────
interface KalmarMachine {
  id: string;
  model: string;
  category: "Reachstacker" | "Terminal Tractor" | "Straddle Carrier";
  capacityTon: number;
  fuel: "Diesel" | "Electric" | "Hybrid";
  baseTempC: number;
  baseVibration: number;
  basePressure: number;
  baseEnergyKwh: number;
  serial: string;
}

const kalmarMachines: KalmarMachine[] = [
  { id: "KAL-RS-01", model: "Kalmar DRG450",  category: "Reachstacker",     capacityTon: 45, fuel: "Diesel",   baseTempC: 78, baseVibration: 2.6, basePressure: 180, baseEnergyKwh: 42, serial: "DRG450-2024-001" },
  { id: "KAL-TT-02", model: "Kalmar T2 Electric", category: "Terminal Tractor", capacityTon: 32, fuel: "Electric", baseTempC: 48, baseVibration: 1.4, basePressure: 120, baseEnergyKwh: 28, serial: "T2E-2025-014" },
  { id: "KAL-SC-03", model: "Kalmar AutoStrad", category: "Straddle Carrier", capacityTon: 60, fuel: "Hybrid",   baseTempC: 65, baseVibration: 2.1, basePressure: 145, baseEnergyKwh: 36, serial: "ASC-2024-027" },
];

const COLUMNS = [
  "timestamp", "machine_id", "model", "category", "fuel_type",
  "load_ton", "speed_kmph", "engine_temp_c", "vibration_mms",
  "hydraulic_pressure_bar", "energy_consumption_kwh", "container_moves",
  "fuel_level_pct", "battery_soc_pct", "operator_id", "shift",
  "anomaly_score", "maintenance_flag", "location_zone",
] as const;

function generateRow(m: KalmarMachine, hour: number, day: number) {
  const ts = new Date(2026, 3, 1 + day, hour).toISOString().replace("T", " ").slice(0, 16);
  const shift = hour < 8 ? "C" : hour < 16 ? "A" : "B";
  const operators = ["OP-12", "OP-07", "OP-19", "OP-22", "OP-31"];
  const zones = ["Yard-A", "Yard-B", "Quay-1", "Quay-2", "Stack-N"];
  const noise = () => (Math.random() - 0.5) * 2;
  const load = +(m.capacityTon * (0.5 + Math.random() * 0.5)).toFixed(1);
  const speed = +(8 + Math.random() * 18).toFixed(1);
  const temp = +(m.baseTempC + Math.sin(hour / 4) * 5 + noise() * 3).toFixed(1);
  const vib = +(m.baseVibration + noise() * 0.4).toFixed(2);
  const press = +(m.basePressure + noise() * 8).toFixed(1);
  const energy = +(m.baseEnergyKwh + load / m.capacityTon * 6 + noise()).toFixed(2);
  const moves = Math.round(2 + Math.random() * 4);
  const fuelLvl = m.fuel === "Electric" ? 0 : +(40 + Math.random() * 55).toFixed(1);
  const batt = m.fuel === "Diesel" ? 0 : +(35 + Math.random() * 60).toFixed(1);
  const anomaly = +(Math.max(0, (vib - m.baseVibration) / 2 + (temp - m.baseTempC) / 50 + Math.random() * 0.05).toFixed(3));
  const maintFlag = anomaly > 0.18 ? 1 : 0;
  return [
    ts, m.id, m.model, m.category, m.fuel,
    load, speed, temp, vib, press, energy, moves,
    fuelLvl, batt, operators[hour % operators.length], shift,
    anomaly, maintFlag, zones[(hour + day) % zones.length],
  ];
}

function rowsToCSV(rows: (string | number)[][]) {
  return [COLUMNS.join(","), ...rows.map((r) => r.map((c) => typeof c === "string" && c.includes(",") ? `"${c}"` : String(c)).join(","))].join("\n");
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DataPreparation() {
  const [selected, setSelected] = useState<string[]>(kalmarMachines.map((m) => m.id));
  const [days, setDays] = useState(2);
  const [hoursPerDay, setHoursPerDay] = useState(24);
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");
  const [generatedRows, setGeneratedRows] = useState<(string | number)[][]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const selectedMachines = kalmarMachines.filter((m) => selected.includes(m.id));

  const handleGenerate = () => {
    if (selectedMachines.length === 0) {
      toast.error("Select at least one machine");
      return;
    }
    const rows: (string | number)[][] = [];
    for (let d = 0; d < days; d++) {
      for (let h = 0; h < hoursPerDay; h++) {
        for (const m of selectedMachines) rows.push(generateRow(m, h, d));
      }
    }
    setGeneratedRows(rows);
    setGeneratedAt(new Date().toLocaleString());
    toast.success(`Generated ${rows.length.toLocaleString()} rows for ${selectedMachines.length} machines`);
  };

  const handleExport = () => {
    if (generatedRows.length === 0) {
      toast.error("Generate data first");
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `kalmar_machine_data_${stamp}.${format}`;
    if (format === "csv") {
      downloadFile(filename, rowsToCSV(generatedRows), "text/csv");
    } else {
      // simple Excel-readable: tab-separated with .xls extension actually serves but we use CSV with .xlsx warning
      // For real xlsx we'd need a lib — fall back to CSV-as-xlsx readable
      downloadFile(filename.replace(".xlsx", ".csv"), rowsToCSV(generatedRows), "text/csv");
      toast.info("Exported as CSV (Excel-compatible).");
    }
    toast.success(`Exported ${filename}`);
  };

  const handlePushToIngestion = () => {
    if (generatedRows.length === 0) {
      toast.error("Generate data first");
      return;
    }
    const payload = {
      name: `kalmar_machine_data_${Date.now()}.csv`,
      size: `${(rowsToCSV(generatedRows).length / 1024).toFixed(1)} KB`,
      type: "CSV",
      uploadedAt: "Just now",
      rows: generatedRows.length,
      columns: COLUMNS.length,
      source: "Data Preparation (Kalmar)",
      content: rowsToCSV(generatedRows),
      generatedAt: generatedAt,
    };
    const existing = JSON.parse(localStorage.getItem("datapx1.preparedDatasets") || "[]");
    localStorage.setItem("datapx1.preparedDatasets", JSON.stringify([payload, ...existing]));
    toast.success("Dataset pushed to Data Ingestion");
  };

  const preview = useMemo(() => generatedRows.slice(0, 8), [generatedRows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-accent" /> Data Preparation
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Generate realistic machine telemetry for Kalmar equipment, preview the schema, and export or push directly into Data Ingestion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Machine selector */}
        <Card className="rounded-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-accent" /> Kalmar Machines
          </h3>
          <div className="space-y-2">
            {kalmarMachines.map((m) => (
              <label key={m.id} className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/40">
                <Checkbox
                  checked={selected.includes(m.id)}
                  onCheckedChange={(v) =>
                    setSelected((prev) => (v ? [...prev, m.id] : prev.filter((x) => x !== m.id)))
                  }
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{m.model}</span>
                    <Badge variant="outline" className="text-[10px]">{m.category}</Badge>
                    <Badge variant="outline" className="text-[10px]">{m.fuel}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {m.id} • Serial {m.serial} • {m.capacityTon}t capacity
                  </p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Generation controls */}
        <Card className="rounded-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">Generation Settings</h3>
          <div>
            <Label className="text-xs">Days of data</Label>
            <Input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Math.max(1, +e.target.value))} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Hours per day</Label>
            <Input type="number" min={1} max={24} value={hoursPerDay} onChange={(e) => setHoursPerDay(Math.min(24, Math.max(1, +e.target.value)))} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Export format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as "csv" | "xlsx")}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md bg-muted/40 p-3 text-[11px] text-muted-foreground">
            <p>Estimated rows: <span className="font-semibold text-foreground">{(selectedMachines.length * days * hoursPerDay).toLocaleString()}</span></p>
            <p>Columns: <span className="font-semibold text-foreground">{COLUMNS.length}</span></p>
          </div>
          <Button onClick={handleGenerate} className="w-full gap-2">
            <RefreshCw className="h-4 w-4" /> Generate Dataset
          </Button>
        </Card>
      </div>

      {/* Preview + actions */}
      {generatedRows.length > 0 && (
        <Card className="rounded-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-success" /> Preview
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Showing first 8 of {generatedRows.length.toLocaleString()} rows • Generated {generatedAt}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" /> Export {format.toUpperCase()}
              </Button>
              <Button size="sm" onClick={handlePushToIngestion} className="gap-2">
                <Send className="h-4 w-4" /> Push to Data Ingestion
              </Button>
            </div>
          </div>
          <div className="overflow-auto rounded-md border max-h-80">
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
        </Card>
      )}
    </div>
  );
}
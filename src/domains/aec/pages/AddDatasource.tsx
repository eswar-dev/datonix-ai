import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Database, Loader2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { saveDatasource } from "@/domains/aec/data/datasourceStorage";
import { cn } from "@/common/lib/utils";
import { toast } from "sonner";

const SOURCE_TYPES = [
  { id: "quickbooks", name: "QuickBooks", sub: "Accounting · AR/AP/GL", icon: "📊", oauth: true },
  { id: "ajera", name: "Ajera", sub: "Projects & Resources", icon: "🏗", oauth: true },
  { id: "hris", name: "HRIS / Payroll", sub: "Rate Cards · Payroll", icon: "👥", oauth: true },
  { id: "csv", name: "Excel / CSV", sub: "File upload", icon: "📄", oauth: false },
  { id: "rest", name: "REST API", sub: "Custom integration", icon: "🔗", oauth: false },
] as const;

const MAPPINGS: Record<string, [string, string, string, boolean][]> = {
  quickbooks: [
    ["Chart of Accounts", "AR / AP / GL", "GL Accounts", true],
    ["Invoices", "AR / AP / GL", "Invoices", true],
    ["Bills", "AR / AP / GL", "Payables", true],
  ],
  ajera: [
    ["Projects", "Projects & Resources", "Projects", true],
    ["Employees", "Projects & Resources", "Resources", true],
    ["Timesheets", "Timesheets", "Time Entries", true],
  ],
  hris: [
    ["Employees", "Rate Cards", "Rate Cards", true],
    ["Pay Grades", "Rate Cards", "Cost Rates", true],
    ["Departments", "Organization Chart", "Departments", false],
  ],
  csv: [
    ["Employee ID", "Timesheets", "Resources", true],
    ["Hours", "Timesheets", "Time Entries", true],
    ["Project Code", "Projects & Resources", "Projects", true],
  ],
  rest: [
    ["/records", "Custom Module", "Records", false],
    ["/entities", "Custom Module", "Entities", false],
  ],
};

const CONNECTOR_NAMES: Record<string, string> = {
  quickbooks: "Acctg Connector",
  ajera: "Project Connector",
  hris: "Rate Card Connector",
  csv: "File Connector",
  rest: "Custom Connector",
};

const MODULE_NAMES: Record<string, string> = {
  quickbooks: "AR / AP / GL",
  ajera: "Projects & Resources",
  hris: "Rate Cards",
  csv: "Timesheets",
  rest: "Custom",
};

const STEPS = ["Choose Source", "Connect", "Scope", "Map Modules", "Schedule & Test"];

export default function AddDatasource() {
  const navigate = useNavigate();
  const { activeTwinId, activeTwin } = useAecApp();
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [tested, setTested] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connName, setConnName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [schedule, setSchedule] = useState("hourly");
  const [entities, setEntities] = useState<string[]>(["MA", "ME"]);
  const [saving, setSaving] = useState(false);

  const sourceMeta = useMemo(
    () => SOURCE_TYPES.find((s) => s.id === sourceType),
    [sourceType],
  );

  useEffect(() => {
    if (sourceMeta && !connName) {
      setConnName(`${sourceMeta.name} — ${activeTwin.entities[0]?.name ?? "Entity"}`);
    }
  }, [sourceMeta, connName, activeTwin.entities]);

  const toggleEntity = (code: string) => {
    if (code === "ALL") {
      setEntities(["ALL"]);
      return;
    }
    setEntities((prev) => {
      const next = prev.filter((e) => e !== "ALL");
      return next.includes(code) ? next.filter((e) => e !== code) : [...next, code];
    });
  };

  const canContinue = () => {
    if (step === 1) return !!sourceType;
    if (step === 2) {
      if (!connName.trim()) return false;
      if (sourceMeta?.oauth) return connected;
      if (sourceType === "csv") return true;
      return apiUrl.trim().length > 0 && apiKey.trim().length > 0;
    }
    if (step === 3) return entities.length > 0;
    return true;
  };

  const handleTest = async () => {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setTested(true);
    setTesting(false);
    toast.success("Connection successful — 847 records available");
  };

  const handleSave = async () => {
    if (!tested) {
      toast.error("Test the connection before saving");
      return;
    }
    if (!sourceType || !sourceMeta) return;
    setSaving(true);
    try {
      const id = `ds-${Date.now()}`;
      saveDatasource(activeTwinId, {
        id,
        source: sourceMeta.name,
        connector: CONNECTOR_NAMES[sourceType] ?? "Custom Connector",
        targetModule: MODULE_NAMES[sourceType] ?? "Custom",
        status: "Live",
        entities: entities.join(" · "),
        lastSync: "Just now",
        coverage: "72%",
        recordsMapped: 847,
        schedule,
        createdAt: new Date().toISOString(),
      });
      toast.success("Datasource saved — initial sync started");
      navigate("/data-ingestion");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Add Datasource"
        subtitle="Connect a source system and map it to Datonix modules"
        breadcrumb={[
          { label: "Intelligence", href: "/enterprise-twin" },
          { label: "Data Ingestion", href: "/data-ingestion" },
          { label: "Add Datasource" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link to="/data-ingestion">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold",
                active && "border-[#E8442E]/40 bg-[#E8442E]/10 text-foreground",
                done && "border-teal/30 text-teal",
                !active && !done && "border-border text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  active && "bg-[#E8442E] text-white",
                  done && "bg-teal text-teal-foreground",
                  !active && !done && "bg-muted",
                )}
              >
                {done ? <Check className="h-3 w-3" /> : n}
              </span>
              {label}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />
              Select Source Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {SOURCE_TYPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSourceType(s.id)}
                  className={cn(
                    "rounded-lg border bg-card p-4 text-center transition-colors hover:border-teal/40",
                    sourceType === s.id && "border-teal bg-teal/5",
                  )}
                >
                  <div className="mb-2 text-2xl">{s.icon}</div>
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && sourceMeta && (
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="text-base">Connection Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sourceMeta.oauth ? (
              <div className="rounded-lg border bg-muted/30 p-6 text-center">
                <p className="mb-4 text-sm text-muted-foreground">
                  Authorize Datonix to access your account securely via OAuth 2.0
                </p>
                <Button onClick={() => setConnected(true)} disabled={connected}>
                  {connected ? "Connected" : "Connect with OAuth"}
                </Button>
                {connected && (
                  <p className="mt-3 text-sm font-medium text-teal">✓ Connected successfully</p>
                )}
              </div>
            ) : sourceType === "csv" ? (
              <div className="space-y-2">
                <Label>Upload File</Label>
                <Input type="file" accept=".csv,.xlsx,.xls" />
                <p className="text-xs text-muted-foreground">Supported: CSV, Excel (.xlsx). Max 50MB.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>API Endpoint</Label>
                  <Input
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.example.com/v1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Connection Name</Label>
              <Input value={connName} onChange={(e) => setConnName(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="text-base">Entity Scope</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Select which legal entities this datasource applies to:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { code: "MA", label: "Meridian Architecture (MA)" },
                { code: "ME", label: "Meridian Engineering (ME)" },
                { code: "MC", label: "Meridian Construction (MC)" },
                { code: "ALL", label: "All Entities" },
              ].map((e) => (
                <button
                  key={e.code}
                  type="button"
                  onClick={() => toggleEntity(e.code)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors",
                    entities.includes(e.code)
                      ? "border-teal bg-teal/10"
                      : "border-border hover:border-teal/30",
                  )}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && sourceType && (
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="text-base">Module Mapping</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Field</TableHead>
                  <TableHead>Target Module</TableHead>
                  <TableHead>Datonix Entity</TableHead>
                  <TableHead>Auto-map</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(MAPPINGS[sourceType] ?? []).map((m) => (
                  <TableRow key={m[0]}>
                    <TableCell className="font-medium">{m[0]}</TableCell>
                    <TableCell>{m[1]}</TableCell>
                    <TableCell>{m[2]}</TableCell>
                    <TableCell>
                      <StatusBadge status={m[3] ? "Live" : "Partial"} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="text-base">Sync Schedule & Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Sync Frequency</Label>
                <Select value={schedule} onValueChange={setSchedule}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time (webhook)</SelectItem>
                    <SelectItem value="hourly">Every hour</SelectItem>
                    <SelectItem value="daily">Daily at 2:00 AM</SelectItem>
                    <SelectItem value="manual">Manual only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Initial Sync</Label>
                <Select defaultValue="30d">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full historical sync</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-4">
              <Button variant="outline" onClick={handleTest} disabled={testing}>
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing…
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
              <span className={cn("text-sm", tested ? "text-teal font-medium" : "text-muted-foreground")}>
                {tested ? "✓ Connection successful — 847 records available" : "Run a test before saving"}
              </span>
            </div>
            {tested && sourceMeta && (
              <div className="rounded-lg border border-teal/30 bg-teal/5 p-4 text-sm">
                <strong>{connName}</strong> → {MODULE_NAMES[sourceType!]}
                <br />
                Schedule: {schedule} · Entities: {entities.join(", ")}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2 border-t pt-4">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
        )}
        {step < 5 ? (
          <Button
            onClick={() => {
              if (!canContinue()) {
                toast.error("Complete the required fields to continue");
                return;
              }
              setStep((s) => s + 1);
            }}
          >
            Continue
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={saving || !tested}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save & Start Sync"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

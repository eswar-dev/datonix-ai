import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Plug, Upload, Search, CheckCircle2, FileSpreadsheet, FileJson, FileText, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { connectorCatalog, type Connector } from "@/data/machineData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const categoryColor: Record<Connector["category"], string> = {
  "ERP": "bg-accent/10 text-accent border-accent/20",
  "MES": "bg-purple/10 text-purple border-purple/20",
  "SCADA": "bg-teal/10 text-teal border-teal/20",
  "IoT / Telemetry": "bg-success/10 text-success border-success/20",
  "Database": "bg-warning/10 text-warning border-warning/20",
  "Cloud Storage": "bg-muted text-foreground border-border",
  "Quality": "bg-destructive/10 text-destructive border-destructive/20",
};

interface UploadedFile {
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  source?: string;
  rows?: number;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DataIngestion() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [connectors, setConnectors] = useState<Connector[]>(connectorCatalog);
  const [files, setFiles] = useState<UploadedFile[]>([
    { name: "machine_telemetry_apr2026.csv", size: "12.4 MB", type: "CSV", uploadedAt: "2h ago" },
    { name: "production_orders_q1.xlsx", size: "3.8 MB", type: "XLSX", uploadedAt: "Yesterday" },
  ]);

  // Pick up datasets pushed from Admin → Data Preparation
  useEffect(() => {
    const load = () => {
      try {
        const prepared = JSON.parse(localStorage.getItem("datapx1.preparedDatasets") || "[]");
        if (Array.isArray(prepared) && prepared.length > 0) {
          setFiles((prev) => {
            const existingNames = new Set(prev.map((f) => f.name));
            const newOnes: UploadedFile[] = prepared
              .filter((p: any) => !existingNames.has(p.name))
              .map((p: any) => ({
                name: p.name,
                size: p.size,
                type: p.type,
                uploadedAt: p.uploadedAt || "Just now",
                source: p.source,
                rows: p.rows,
              }));
            return newOnes.length ? [...newOnes, ...prev] : prev;
          });
        }
      } catch { /* ignore */ }
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const [dragOver, setDragOver] = useState(false);
  const [configDialogConnector, setConfigDialogConnector] = useState<Connector | null>(null);
  const [endpoint, setEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");

  const categories = ["All", ...Array.from(new Set(connectorCatalog.map((c) => c.category)))];
  const filtered = connectors.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "All" || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const stats = {
    total: connectors.length,
    connected: connectors.filter((c) => c.status === "Connected").length,
    files: files.length,
  };

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => {
      const ext = f.name.split(".").pop()?.toUpperCase() || "FILE";
      return { name: f.name, size: formatBytes(f.size), type: ext, uploadedAt: "Just now" };
    });
    setFiles((prev) => [...newFiles, ...prev]);
    toast.success(`${newFiles.length} file${newFiles.length > 1 ? "s" : ""} uploaded`);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleConfigSave = () => {
    if (!configDialogConnector) return;
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === configDialogConnector.id ? { ...c, status: "Connected", lastSync: "Just now", records: "Initialising…" } : c
      )
    );
    toast.success(`${configDialogConnector.name} connected`);
    setConfigDialogConnector(null);
    setEndpoint("");
    setApiKey("");
  };

  const handleDisconnect = (c: Connector) => {
    setConnectors((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, status: "Available", lastSync: undefined, records: undefined } : x))
    );
    toast.success(`${c.name} disconnected`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Data Ingestion</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Connect industrial systems and upload datasets — all sources in one place.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Available Connectors", value: stats.total, icon: Plug, color: "text-accent" },
          { label: "Active Connections", value: stats.connected, icon: CheckCircle2, color: "text-success" },
          { label: "Uploaded Files", value: stats.files, icon: FileSpreadsheet, color: "text-purple" },
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

      <Tabs defaultValue="connectors" className="w-full">
        <TabsList>
          <TabsTrigger value="connectors" className="gap-2">
            <Plug className="h-4 w-4" /> Connectors
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" /> File Upload
          </TabsTrigger>
        </TabsList>

        {/* CONNECTORS TAB */}
        <TabsContent value="connectors" className="space-y-4 mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search connectors…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-button border px-3 py-1.5 text-xs font-medium transition-colors ${
                    categoryFilter === cat
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <Card key={c.id} className="rounded-card p-5 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-muted text-foreground">
                    {c.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold truncate">{c.name}</h3>
                      {c.status === "Connected" && (
                        <span className="h-2 w-2 rounded-full bg-success shrink-0" />
                      )}
                    </div>
                    <Badge variant="outline" className={`mt-1 text-[10px] ${categoryColor[c.category]}`}>
                      {c.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                  {c.description}
                </p>
                <div className="flex items-center justify-between gap-2 pt-3 border-t">
                  {c.status === "Connected" ? (
                    <>
                      <div className="text-[11px] text-muted-foreground">
                        <span className="text-success font-medium">●</span> {c.records} • {c.lastSync}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleDisconnect(c)}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] text-muted-foreground">Not connected</span>
                      <Button size="sm" onClick={() => setConfigDialogConnector(c)}>
                        Connect
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <Card className="rounded-card p-10 text-center text-sm text-muted-foreground">
              No connectors match your filters.
            </Card>
          )}
        </TabsContent>

        {/* UPLOAD TAB */}
        <TabsContent value="upload" className="space-y-4 mt-4">
          <Card
            className={`rounded-card border-2 border-dashed p-10 text-center transition-colors ${
              dragOver ? "border-accent bg-accent/5" : "border-border"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-sm font-semibold mb-1">Drag and drop files here</h3>
            <p className="text-xs text-muted-foreground mb-4">
              CSV, XLSX, JSON, Parquet — up to 500 MB per file
            </p>
            <label>
              <input
                type="file"
                multiple
                accept=".csv,.xlsx,.xls,.json,.parquet"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Button asChild>
                <span className="cursor-pointer">Browse files</span>
              </Button>
            </label>
          </Card>

          {files.length > 0 && (
            <Card className="rounded-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" /> Uploaded Files ({files.length})
              </h3>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((f, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {f.type === "JSON" ? <FileJson className="h-4 w-4 text-warning" /> : <FileSpreadsheet className="h-4 w-4 text-success" />}
                        <span>{f.name}</span>
                        {f.source && (
                          <Badge variant="outline" className="text-[9px] bg-accent/10 text-accent border-accent/20">
                            {f.source}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{f.type}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-xs">{f.size}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{f.uploadedAt}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => {
                            setFiles((prev) => prev.filter((_, idx) => idx !== i));
                            toast.success("File removed");
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Connector config dialog */}
      <Dialog open={!!configDialogConnector} onOpenChange={(open) => !open && setConfigDialogConnector(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {configDialogConnector?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input id="endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://api.example.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="apiKey">API Key / Token</Label>
              <Input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="••••••••••••" className="mt-1.5" />
            </div>
            <p className="text-xs text-muted-foreground">
              Demo mode — no credentials are stored. In production this opens a secure OAuth or service-account flow.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogConnector(null)}>Cancel</Button>
            <Button onClick={handleConfigSave}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

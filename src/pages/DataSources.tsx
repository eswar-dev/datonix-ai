import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Upload, FileText, Trash2, Eye, Pencil, FileUp, Database, RefreshCw, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { roleData } from "@/data/roleData";

interface Dataset {
  id: string;
  name: string;
  rows: number;
  columns: number;
  uploadDate: string;
  status: "Ready" | "Processing" | "Error";
}

const mockDatasets: Dataset[] = [
  { id: "1", name: "sales_q4_2025.csv", rows: 48200, columns: 14, uploadDate: "2026-03-12", status: "Ready" },
  { id: "2", name: "customer_segments.xlsx", rows: 12400, columns: 8, uploadDate: "2026-03-14", status: "Ready" },
  { id: "3", name: "inventory_feed.json", rows: 89100, columns: 22, uploadDate: "2026-03-15", status: "Processing" },
  { id: "4", name: "marketing_spend.csv", rows: 3200, columns: 6, uploadDate: "2026-03-10", status: "Ready" },
  { id: "5", name: "broken_export.csv", rows: 0, columns: 0, uploadDate: "2026-03-16", status: "Error" },
];

const datasetStatusColor: Record<Dataset["status"], string> = {
  Ready: "bg-success/10 text-success border-success/20",
  Processing: "bg-warning/10 text-warning border-warning/20",
  Error: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusDot: Record<string, string> = {
  Active: "bg-emerald-400",
  Warning: "bg-amber-400",
  Error: "bg-red-400",
};

const mockPreviewRows = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  customer: `Customer ${i + 1}`,
  amount: (Math.random() * 10000).toFixed(2),
  date: `2026-0${(i % 3) + 1}-${10 + i}`,
  status: i % 3 === 0 ? "Active" : "Inactive",
}));

export default function DataSources() {
  const { user } = useAuth();
  const [dragging, setDragging] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [search, setSearch] = useState("");

  if (!user) return null;
  const connectedSources = roleData[user.role].dataSources.connected;

  const filteredDatasets = mockDatasets.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSources = connectedSources.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalRecords = connectedSources.reduce((acc, d) => {
    const num = d.records.replace(/[^0-9.]/g, "");
    const mult = d.records.includes("M") ? 1000000 : d.records.includes("K") ? 1000 : 1;
    return acc + parseFloat(num || "0") * mult;
  }, 0);

  const formatTotal = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Data Sources</h1>
          <p className="text-sm text-muted-foreground">{user.industry} Industry Integrations</p>
        </div>
        <Button className="rounded-button gap-2">
          <Plus className="h-4 w-4" /> Add New Source
        </Button>
      </div>

      {/* Role-Dynamic Connected Sources Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-card p-5 text-center">
          <p className="text-xs text-muted-foreground">Connected Sources</p>
          <p className="text-2xl font-semibold mt-1">{connectedSources.length}</p>
        </Card>
        <Card className="rounded-card p-5 text-center">
          <p className="text-xs text-muted-foreground">Total Records</p>
          <p className="text-2xl font-semibold mt-1">{formatTotal(totalRecords)}</p>
        </Card>
        <Card className="rounded-card p-5 text-center">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-semibold mt-1">{connectedSources.filter((d) => d.status === "Active").length}</p>
        </Card>
      </div>

      {/* Role-Dynamic Connected Source Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSources.map((src) => (
          <Card key={src.name} className="rounded-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Database className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{src.name}</p>
                  <Badge variant="secondary" className="text-[10px] mt-0.5">{src.type}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`h-2.5 w-2.5 rounded-full ${statusDot[src.status] || "bg-gray-400"}`} />
                <span className="text-[11px] text-muted-foreground">{src.status}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{src.records} records</span>
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> {src.lastSync}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload zone */}
      <Card
        className={`rounded-card border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? "border-accent bg-accent/5" : "border-border"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
      >
        <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">
          Drag & drop files here, or{" "}
          <button className="text-accent underline underline-offset-2">browse</button>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Supports CSV, XLSX, JSON — max 200MB per file
        </p>
      </Card>

      {/* Search */}
      <Input
        placeholder="Search datasets…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm rounded-input"
      />

      {/* Dataset table */}
      <Card className="rounded-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead className="text-right">Rows</TableHead>
              <TableHead className="text-right">Columns</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDatasets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileUp className="h-8 w-8" />
                    <p className="text-sm">No datasets found</p>
                    <Button size="sm" className="mt-1 rounded-button">
                      Upload your first dataset
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDatasets.map((d) => (
                <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDataset(d)}>
                  <TableCell className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {d.name}
                  </TableCell>
                  <TableCell className="text-right">{d.rows.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{d.columns}</TableCell>
                  <TableCell>{d.uploadDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={datasetStatusColor[d.status]}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Rename">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dataset detail drawer */}
      <Sheet open={!!selectedDataset} onOpenChange={() => setSelectedDataset(null)}>
        <SheetContent className="w-[720px] sm:max-w-[720px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedDataset?.name}</SheetTitle>
          </SheetHeader>
          {selectedDataset && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="rounded-card p-4 text-center">
                  <p className="text-xs text-muted-foreground">Rows</p>
                  <p className="text-lg font-semibold">{selectedDataset.rows.toLocaleString()}</p>
                </Card>
                <Card className="rounded-card p-4 text-center">
                  <p className="text-xs text-muted-foreground">Columns</p>
                  <p className="text-lg font-semibold">{selectedDataset.columns}</p>
                </Card>
                <Card className="rounded-card p-4 text-center">
                  <p className="text-xs text-muted-foreground">Null %</p>
                  <p className="text-lg font-semibold">2.4%</p>
                </Card>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Column Types</h3>
                <div className="flex flex-wrap gap-2">
                  {["ID (int)", "Name (str)", "Amount (float)", "Date (datetime)", "Status (str)"].map((col) => (
                    <Badge key={col} variant="secondary" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Preview (first 10 rows)</h3>
                <Card className="rounded-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPreviewRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.id}</TableCell>
                          <TableCell>{row.customer}</TableCell>
                          <TableCell>${row.amount}</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>

              <Button className="w-full rounded-button">Use in Analysis</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

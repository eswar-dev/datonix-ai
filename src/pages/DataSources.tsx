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
import { Upload, FileText, Trash2, Eye, Pencil, FileUp } from "lucide-react";

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

const statusColor: Record<Dataset["status"], string> = {
  Ready: "bg-success/10 text-success border-success/20",
  Processing: "bg-warning/10 text-warning border-warning/20",
  Error: "bg-destructive/10 text-destructive border-destructive/20",
};

const mockPreviewRows = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  customer: `Customer ${i + 1}`,
  amount: (Math.random() * 10000).toFixed(2),
  date: `2026-0${(i % 3) + 1}-${10 + i}`,
  status: i % 3 === 0 ? "Active" : "Inactive",
}));

export default function DataSources() {
  const [dragging, setDragging] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [search, setSearch] = useState("");

  const filtered = mockDatasets.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Data Sources</h1>
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
            {filtered.length === 0 ? (
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
              filtered.map((d) => (
                <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDataset(d)}>
                  <TableCell className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {d.name}
                  </TableCell>
                  <TableCell className="text-right">{d.rows.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{d.columns}</TableCell>
                  <TableCell>{d.uploadDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor[d.status]}>
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

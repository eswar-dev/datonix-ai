import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listDatasetsCompat,
  uploadFiles,
  deleteDataset,
  exportSelectedDatasets,
  getSelectedDatasets,
  selectDatasets,
  datasetStatus,
  extractDatasetRows,
  pickStr,
  pickNum,
  type DatasetStatusResponse,
} from "@/common/api";
import { Card } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Checkbox } from "@/common/components/ui/checkbox";
import { Input } from "@/common/components/ui/input";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/common/components/ui/sheet";
import { Upload, FileText, Trash2, Eye, Database, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/common/contexts/AuthContext";

interface Dataset {
  id: string;
  name: string;
  rows: number;
  columns: number;
  uploadDate: string;
  status: "Ready" | "Processing" | "Error";
  raw?: Record<string, unknown>;
}

function mapApiStatus(s: string): Dataset["status"] {
  const u = s.toLowerCase().trim();
  if (u === "not_found" || u === "forbidden") return "Error";
  if (u === "failed" || u.includes("error") || u.includes("fail")) return "Error";
  if (u === "completed" || u === "ready" || u === "success" || u === "done") return "Ready";
  if (u === "processing" || u === "pending" || u.includes("running")) return "Processing";
  return "Ready";
}

function formatDatasetDate(iso: string): string {
  if (!iso || iso === "—") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function mapApiRowToDataset(o: Record<string, unknown>, index: number): Dataset {
  const status = mapApiStatus(pickStr(o, ["status", "state"], "ready"));
  const rows = pickNum(o, ["row_count", "rows", "n_rows", "total_records", "records"], 0);
  const columns = pickNum(o, ["column_count", "columns", "n_cols", "num_columns"], 0);
  return {
    id: pickStr(o, ["id", "dataset_id", "uuid", "pk"], String(index)),
    name: pickStr(o, ["name", "filename", "dataset_name", "file_name", "title"], "Dataset"),
    rows,
    columns,
    uploadDate: formatDatasetDate(pickStr(o, ["upload_date", "created_at", "date", "uploaded_at"], "")),
    status,
    raw: o,
  };
}

function formatCount(value: number, status: Dataset["status"]): string {
  if (status === "Processing" && value === 0) return "—";
  return value.toLocaleString();
}

function parseSelectedNames(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "object" && "selected" in (raw as object)) {
    const s = (raw as { selected?: unknown }).selected;
    if (Array.isArray(s)) return s.map(String);
  }
  return [];
}

function selectionSetsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

const datasetStatusColor: Record<Dataset["status"], string> = {
  Ready: "bg-success/10 text-success border-success/20",
  Processing: "bg-warning/10 text-warning border-warning/20",
  Error: "bg-destructive/10 text-destructive border-destructive/20",
};

function TableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function DataSources() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectionInitRef = useRef(true);
  const [dragging, setDragging] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [search, setSearch] = useState("");
  const [draftSelected, setDraftSelected] = useState<string[]>([]);

  const userId = user?.apiUserId || "";

  const { data: listRaw, isLoading: listLoading, isFetching, error: listError } = useQuery({
    queryKey: ["datasets", userId],
    queryFn: () => listDatasetsCompat({ userId }),
    enabled: !!user,
    retry: 1,
  });

  const { data: selectedRaw, isLoading: selectedLoading, isSuccess: selectedQuerySuccess } = useQuery({
    queryKey: ["selected-datasets", userId],
    queryFn: () => getSelectedDatasets({ userId }),
    enabled: !!user,
    retry: 0,
    staleTime: 30_000,
  });

  const savedSelected = useMemo(() => parseSelectedNames(selectedRaw), [selectedRaw]);

  useEffect(() => {
    selectionInitRef.current = true;
  }, [userId]);

  useEffect(() => {
    if (!userId || !selectedQuerySuccess || selectedRaw === undefined) return;
    if (selectionInitRef.current) {
      setDraftSelected([...savedSelected]);
      selectionInitRef.current = false;
    }
  }, [userId, selectedQuerySuccess, selectedRaw, savedSelected]);

  const selectionDirty = useMemo(
    () => !selectionSetsEqual(draftSelected, savedSelected),
    [draftSelected, savedSelected]
  );

  const datasets: Dataset[] = useMemo(() => {
    if (listRaw == null) return [];
    const rows = extractDatasetRows(listRaw);
    return rows.map((row, i) => mapApiRowToDataset(row, i));
  }, [listRaw]);

  const pollingIds = useMemo(
    () => datasets.filter((d) => d.status === "Processing").map((d) => d.id),
    [datasets]
  );

  const statusQueries = useQueries({
    queries: pollingIds.map((id) => ({
      queryKey: ["dataset-status", userId, id] as const,
      queryFn: async (): Promise<DatasetStatusResponse | null> => {
        try {
          return await datasetStatus(id, { userId });
        } catch {
          return null;
        }
      },
      enabled: !!userId && pollingIds.length > 0,
      refetchInterval: (query: { state: { data: unknown } }) => {
        const data = query.state.data as DatasetStatusResponse | null | undefined;
        if (!data?.status) return false;
        const u = data.status.toLowerCase();
        if (u === "completed" || u === "ready" || u === "failed" || u === "not_found" || u === "forbidden")
          return false;
        return 3000;
      },
    })),
  });

  const invalidatedTerminal = useRef(new Set<string>());
  useEffect(() => {
    invalidatedTerminal.current.clear();
  }, [userId]);

  useEffect(() => {
    pollingIds.forEach((id, i) => {
      const data = statusQueries[i]?.data;
      if (!data?.status) return;
      const u = data.status.toLowerCase();
      if ((u === "completed" || u === "failed") && !invalidatedTerminal.current.has(id)) {
        invalidatedTerminal.current.add(id);
        queryClient.invalidateQueries({ queryKey: ["datasets", userId] });
      }
    });
  }, [statusQueries, pollingIds, queryClient, userId]);

  const displayDatasets: Dataset[] = useMemo(() => {
    const byId = new Map<string, DatasetStatusResponse>();
    pollingIds.forEach((id, i) => {
      const data = statusQueries[i]?.data;
      if (data) byId.set(id, data);
    });
    return datasets.map((d) => {
      const live = byId.get(d.id);
      if (!live) return d;
      const st = mapApiStatus(live.status);
      const rows = typeof live.records === "number" ? live.records : d.rows;
      return {
        ...d,
        status: st,
        rows,
        raw: {
          ...(d.raw || {}),
          _datasetStatus: live,
        },
      };
    });
  }, [datasets, pollingIds, statusQueries]);

  const filteredDatasets = displayDatasets.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalRows = useMemo(() => displayDatasets.reduce((acc, d) => acc + d.rows, 0), [displayDatasets]);

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadFiles(userId, files, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets", userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDataset(id, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets", userId] });
      setSelectedDataset(null);
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => exportSelectedDatasets({ userId }),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "export_selected.zip";
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  const selectMutation = useMutation({
    mutationFn: (names: string[]) => selectDatasets(names, { userId }),
    onSuccess: (_, names) => {
      setDraftSelected([...names]);
      queryClient.invalidateQueries({ queryKey: ["selected-datasets", userId] });
      queryClient.invalidateQueries({ queryKey: ["datasets", userId] });
      navigate("/dashboard");
    },
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Data Sources</h1>
          <p className="text-sm text-muted-foreground">
            {user.industry} · Upload and manage datasets for your account
          </p>
          {listError && (
            <p className="mt-1 text-xs text-destructive">
              {(listError as Error).message}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-button"
            disabled={exportMutation.isPending || listLoading}
            onClick={() => exportMutation.mutate()}
          >
            {exportMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Export selected
          </Button>
          <Button className="rounded-button gap-2" type="button" onClick={() => fileInputRef.current?.click()}>
            <Plus className="h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      <Card className="rounded-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">Selected for dashboard</p>
              {selectionDirty && (
                <Badge variant="outline" className="text-xs font-normal">
                  Unsaved changes
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Tick Ready files in the table, then Save. Saving clears the set if nothing is ticked. You are sent to
              the dashboard after Save.
            </p>
            {selectedLoading ? (
              <Skeleton className="h-16 w-full max-w-md" />
            ) : savedSelected.length === 0 && draftSelected.length === 0 && !selectionDirty ? (
              <p className="text-xs text-muted-foreground">No datasets selected yet.</p>
            ) : (
              <div className="max-h-36 overflow-y-auto rounded-md border border-border/60 bg-muted/20 p-2">
                <div className="flex flex-wrap gap-1.5">
                  {(selectionDirty ? draftSelected : savedSelected).length === 0 ? (
                    <span className="text-xs text-muted-foreground">(none — will clear saved selection)</span>
                  ) : (
                    (selectionDirty ? draftSelected : savedSelected).map((n) => (
                      <Badge key={n} variant="secondary" className="max-w-full shrink-0 text-xs font-normal">
                        {n}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <Button
            type="button"
            className="rounded-button shrink-0"
            disabled={!selectionDirty || selectMutation.isPending}
            onClick={() => selectMutation.mutate(draftSelected)}
          >
            {selectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
        {selectMutation.isError && (
          <p className="mt-3 text-xs text-destructive">{(selectMutation.error as Error).message}</p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-card p-5 text-center">
          <p className="text-xs text-muted-foreground">Datasets</p>
          <p className="mt-1 text-2xl font-semibold">
            {listLoading ? <Skeleton className="mx-auto h-8 w-16" /> : datasets.length}
          </p>
        </Card>
        <Card className="rounded-card p-5 text-center">
          <p className="text-xs text-muted-foreground">Total rows (sum)</p>
          <p className="mt-1 text-2xl font-semibold">
            {listLoading ? <Skeleton className="mx-auto h-8 w-20" /> : totalRows.toLocaleString()}
          </p>
        </Card>
        <Card className="rounded-card p-5 text-center">
          <p className="text-xs text-muted-foreground">Saved for dashboard</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {selectedLoading ? <Skeleton className="mx-auto h-8 w-12" /> : savedSelected.length}
          </p>
          {savedSelected.length > 0 && !selectedLoading && (
            <p className="mt-1 text-xs text-muted-foreground" title={savedSelected.join(", ")}>
              {savedSelected.join(", ")}
            </p>
          )}
        </Card>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept=".csv,.xlsx,.xls,.json"
        onChange={(e) => {
          const files = e.target.files;
          if (files?.length) uploadMutation.mutate(Array.from(files));
          e.target.value = "";
        }}
      />
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
          const files = e.dataTransfer.files;
          if (files?.length) uploadMutation.mutate(Array.from(files));
        }}
      >
        <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">
          Drag & drop files here, or{" "}
          <button
            type="button"
            className="text-accent underline underline-offset-2"
            onClick={() => fileInputRef.current?.click()}
          >
            browse
          </button>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">CSV, XLSX, JSON — backend limits apply</p>
        {uploadMutation.isPending && (
          <p className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
          </p>
        )}
        {uploadMutation.isError && (
          <p className="mt-2 text-xs text-destructive">{(uploadMutation.error as Error).message}</p>
        )}
      </Card>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search datasets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm rounded-input"
          />
          {(listLoading || isFetching) && (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading datasets…
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Status and row counts refresh from <code className="rounded bg-muted px-1 text-[11px]">/api/dataset_status/&lt;id&gt;</code>{" "}
          every few seconds while a file is ingesting; the list reloads when processing completes.
        </p>
      </div>

      <Card className="rounded-card overflow-hidden">
        {listLoading ? (
          <TableSkeleton />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 pr-0" aria-label="Select for dashboard" />
                <TableHead>File / Dataset</TableHead>
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
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Database className="h-8 w-8 opacity-50" />
                      <p className="text-sm">No datasets yet</p>
                      <Button size="sm" className="mt-1 rounded-button" type="button" onClick={() => fileInputRef.current?.click()}>
                        Upload a file
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDatasets.map((d) => {
                  const canSelect = d.status === "Ready";
                  const checked = draftSelected.includes(d.name);
                  return (
                  <TableRow key={d.id} className="hover:bg-muted/50">
                    <TableCell
                      className="w-12 pr-0 align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={!canSelect}
                        title={canSelect ? "Include on dashboard" : "Available when status is Ready"}
                        onCheckedChange={(v) => {
                          const on = v === true;
                          setDraftSelected((prev) => {
                            if (on) return prev.includes(d.name) ? prev : [...prev, d.name];
                            return prev.filter((n) => n !== d.name);
                          });
                        }}
                        aria-label={`Select ${d.name} for dashboard`}
                      />
                    </TableCell>
                    <TableCell
                      className="cursor-pointer font-medium"
                      onClick={() => setSelectedDataset(d)}
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {d.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatCount(d.rows, d.status)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCount(d.columns, d.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{d.uploadDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={datasetStatusColor[d.status]}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="View details"
                          onClick={() => setSelectedDataset(d)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Delete dataset ${d.name}?`)) deleteMutation.mutate(d.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Sheet open={!!selectedDataset} onOpenChange={() => setSelectedDataset(null)}>
        <SheetContent className="w-[720px] sm:max-w-[720px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedDataset?.name}</SheetTitle>
          </SheetHeader>
          {selectedDataset && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="rounded-card p-4 text-center">
                  <p className="text-xs text-muted-foreground">Rows</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCount(selectedDataset.rows, selectedDataset.status)}
                  </p>
                </Card>
                <Card className="rounded-card p-4 text-center">
                  <p className="text-xs text-muted-foreground">Columns</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCount(selectedDataset.columns, selectedDataset.status)}
                  </p>
                </Card>
                <Card className="rounded-card p-4 text-center">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold">{selectedDataset.status}</p>
                </Card>
              </div>
              {selectedDataset.raw && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">API fields</h3>
                  <pre className="max-h-64 overflow-auto rounded-md bg-muted/50 p-3 text-xs">
                    {JSON.stringify(selectedDataset.raw, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

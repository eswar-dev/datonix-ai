import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { ReportLibrary } from "@/domains/aec/components/ReportLibrary";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { toast } from "sonner";

export default function Reports() {
  const {
    reportLibraryLive,
    reportRows,
    reportsLoading,
    reportsError,
    loadReportLibrary,
    runReport,
    reportFilters,
    loadReportFilters,
    createCustomReport,
  } = useAecApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string>("all");
  const [projectId, setProjectId] = useState<string>("all");
  const [department, setDepartment] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newReportName, setNewReportName] = useState("");
  const [newReportDesc, setNewReportDesc] = useState("");

  useEffect(() => {
    void loadReportLibrary();
    void loadReportFilters();
  }, [loadReportLibrary, loadReportFilters]);

  const buildQuery = () => {
    const q: Record<string, string> = {};
    if (entityId !== "all") q.entityId = entityId;
    if (projectId !== "all") q.projectId = projectId;
    if (department !== "all") q.department = department;
    return q;
  };

  const onSelect = (id: string) => {
    setSelectedId(id);
    void runReport(id, buildQuery());
  };

  const selected = reportLibraryLive.find((r) => r.id === selectedId);

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Reports"
        subtitle="AEC report library and drill-downs."
        breadcrumb={[{ label: "Reports" }]}
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void loadReportLibrary();
                void loadReportFilters();
              }}
              disabled={reportsLoading}
            >
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
              Custom report
            </Button>
          </div>
        }
      />

      {showCreate && (
        <Card className="rounded-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Create custom report</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={newReportName} onChange={(e) => setNewReportName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={newReportDesc} onChange={(e) => setNewReportDesc(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (!newReportName.trim()) {
                    toast.error("Name required");
                    return;
                  }
                  void createCustomReport({
                    name: newReportName.trim(),
                    description: newReportDesc || undefined,
                  })
                    .then(() => {
                      toast.success("Custom report created");
                      setShowCreate(false);
                      setNewReportName("");
                      setNewReportDesc("");
                    })
                    .catch((e) => toast.error(e instanceof Error ? e.message : "Create failed"));
                }}
              >
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {reportsLoading && !reportLibraryLive.length && (
        <PipelineLoadingBanner label="Loading reports…" />
      )}
      <PipelineErrorBanner message={reportsError ?? ""} />

      {reportFilters && (
        <Card className="rounded-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Entity</Label>
              <Select value={entityId} onValueChange={setEntityId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All entities</SelectItem>
                  {reportFilters.entities.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.code || e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  {reportFilters.projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {reportFilters.departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedId && (
              <div className="sm:col-span-3">
                <Button size="sm" onClick={() => void runReport(selectedId, buildQuery())}>
                  Re-run with filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!reportsLoading && !reportLibraryLive.length ? (
        <PipelineEmptyState>No reports available for this twin.</PipelineEmptyState>
      ) : (
        <ReportLibrary
          reports={reportLibraryLive}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}

      {selectedId && (
        <Card className="rounded-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selected?.name ?? selectedId}
              {reportsLoading ? " — running…" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {!reportsLoading && reportRows.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No rows for this report.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Project / subject</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.entity || "—"}</TableCell>
                      <TableCell className="font-medium">{row.project}</TableCell>
                      <TableCell className="text-muted-foreground">{row.metric}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.value}</TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
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
import { ReportLibrary } from "@/domains/aec/components/ReportLibrary";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import {
  arAgingRows,
  profitabilityReportRows,
  reportLibrary,
  resourceCostRows,
  type ReportTableRow,
} from "@/domains/aec/data/reports";

const reportDataMap: Record<string, ReportTableRow[]> = {
  "rpt-profit": profitabilityReportRows,
  "rpt-resource": resourceCostRows,
  "rpt-ar": arAgingRows,
  "rpt-consolidated": profitabilityReportRows,
  "rpt-fx": arAgingRows,
  "rpt-agent": profitabilityReportRows,
};

export default function Reports() {
  const [selectedId, setSelectedId] = useState<string>("rpt-profit");
  const [entityFilter, setEntityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const rows = reportDataMap[selectedId] ?? profitabilityReportRows;

  const entities = useMemo(
    () => [...new Set(rows.map((r) => r.entity))],
    [rows]
  );
  const projects = useMemo(
    () => [...new Set(rows.map((r) => r.project))],
    [rows]
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (entityFilter !== "all" && r.entity !== entityFilter) return false;
      if (projectFilter !== "all" && r.project !== projectFilter) return false;
      return true;
    });
  }, [rows, entityFilter, projectFilter]);

  const selectedReport = reportLibrary.find((r) => r.id === selectedId);

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Reports"
        subtitle="Report library with drill-down tables — filter by entity and project."
        breadcrumb={[{ label: "Reports" }]}
      />

      <ReportLibrary
        reports={reportLibrary}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">{selectedReport?.name ?? "Report"} — Drill-down</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>Entity</Label>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All entities</SelectItem>
                  {entities.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-card border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{r.entity}</span>
                    </TableCell>
                    <TableCell className="font-medium">{r.project}</TableCell>
                    <TableCell className="text-muted-foreground">{r.metric}</TableCell>
                    <TableCell className="text-right font-medium">{r.value}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

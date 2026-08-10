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
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { ReportLibrary } from "@/domains/aec/components/ReportLibrary";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";

export default function Reports() {
  const {
    reportLibraryLive,
    reportRows,
    reportsLoading,
    reportsError,
    loadReportLibrary,
    runReport,
  } = useAecApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    void loadReportLibrary();
  }, [loadReportLibrary]);

  const onSelect = (id: string) => {
    setSelectedId(id);
    void runReport(id);
  };

  const selected = reportLibraryLive.find((r) => r.id === selectedId);

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Reports"
        subtitle="AEC report library and drill-downs."
        breadcrumb={[{ label: "Reports" }]}
        actions={
          <Button size="sm" variant="outline" onClick={() => void loadReportLibrary()} disabled={reportsLoading}>
            Refresh
          </Button>
        }
      />

      {reportsLoading && !reportLibraryLive.length && (
        <PipelineLoadingBanner label="Loading reports…" />
      )}
      <PipelineErrorBanner message={reportsError ?? ""} />

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

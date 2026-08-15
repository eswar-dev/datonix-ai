import { useEffect, useMemo, useState } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { MetricStrip } from "@/domains/aec/components/MetricStrip";
import { TimesheetApprovalGrid } from "@/domains/aec/components/TimesheetApprovalGrid";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { formatWeekLabel, mondayOf } from "@/domains/aec/api/timesheetsMappers";
import { aecGetTimesheet } from "@/common/api/aecTimesheets";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import { toast } from "sonner";

export default function Timesheets() {
  const {
    timesheetSubmissions,
    timesheetSummary,
    timesheetWeekStart,
    setTimesheetWeekStart,
    refreshTimesheets,
    approveTimesheet,
    rejectTimesheet,
    bulkApproveTimesheets,
    timesheetsLoading,
    timesheetsError,
    activeTwinId,
  } = useAecApp();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void refreshTimesheets();
  }, [refreshTimesheets]);

  const pendingCount = useMemo(
    () => timesheetSubmissions.filter((r) => r.status === "Pending").length,
    [timesheetSubmissions]
  );

  const weekLabel = formatWeekLabel(timesheetWeekStart);

  const openDetail = async (id: string) => {
    if (!activeTwinId || !isApiTwinId(activeTwinId)) return;
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const raw = await aecGetTimesheet(activeTwinId, id);
      setDetail(raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load timesheet");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const approve = async (id: string) => {
    const row = timesheetSubmissions.find((r) => r.id === id);
    setBusy(true);
    try {
      await approveTimesheet(id);
      setSelected((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      toast.success(`Approved timesheet for ${row?.employee ?? "employee"}`);
    } catch {
      /* toasted in context */
    } finally {
      setBusy(false);
    }
  };

  const reject = async (id: string) => {
    const row = timesheetSubmissions.find((r) => r.id === id);
    setBusy(true);
    try {
      await rejectTimesheet(id);
      setSelected((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      toast.error(`Rejected timesheet for ${row?.employee ?? "employee"}`);
    } catch {
      /* toasted in context */
    } finally {
      setBusy(false);
    }
  };

  const bulkApprove = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    setBusy(true);
    try {
      await bulkApproveTimesheets(ids);
      toast.success(`Approved ${ids.length} timesheet(s)`);
      setSelected(new Set());
    } catch {
      /* toasted in context */
    } finally {
      setBusy(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(timesheetSubmissions.filter((r) => r.status === "Pending").map((r) => r.id)));
    } else {
      setSelected(new Set());
    }
  };

  const onWeekChange = (value: string) => {
    const week = mondayOf(value || mondayOf());
    setTimesheetWeekStart(week);
    void refreshTimesheets(week);
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Timesheets"
        subtitle={`Manager approval view — ${weekLabel}.`}
        breadcrumb={[
          { label: "Timesheets", href: "/timesheets" },
          { label: "Approvals" },
        ]}
        actions={
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="ts-week" className="text-xs text-muted-foreground">
                Week start
              </Label>
              <Input
                id="ts-week"
                type="date"
                className="h-9 w-[160px]"
                value={timesheetWeekStart}
                onChange={(e) => onWeekChange(e.target.value)}
              />
            </div>
            <Button size="sm" variant="outline" onClick={() => void refreshTimesheets()} disabled={timesheetsLoading}>
              Refresh
            </Button>
            {selected.size > 0 && (
              <Button size="sm" onClick={() => void bulkApprove()} disabled={busy}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Approve Selected ({selected.size})
              </Button>
            )}
          </div>
        }
      />

      {timesheetsLoading && <PipelineLoadingBanner label="Loading timesheets…" />}
      <PipelineErrorBanner message={timesheetsError ?? ""} />

      <MetricStrip
        metrics={[
          { label: "Pending", value: String(timesheetSummary?.pendingApproval ?? pendingCount) },
          { label: "Hours logged", value: String(timesheetSummary?.hoursLogged ?? 0) },
          { label: "Billable %", value: `${timesheetSummary?.billablePct ?? 0}%` },
          { label: "Expenses", value: timesheetSummary?.expensesPendingLabel ?? "£0" },
        ]}
      />

      {!timesheetsLoading && timesheetSubmissions.length === 0 ? (
        <PipelineEmptyState>No submitted timesheets for this week.</PipelineEmptyState>
      ) : (
        <TimesheetApprovalGrid
          rows={timesheetSubmissions}
          selected={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          onApprove={(id) => void approve(id)}
          onReject={(id) => void reject(id)}
          onDetail={(id) => void openDetail(id)}
        />
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Timesheet detail</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : detail ? (
            <dl className="grid gap-3 text-sm">
              {(
                [
                  ["Employee", detail.employee ?? detail.resourceName],
                  ["Entity", detail.entityCode ?? detail.entity],
                  ["Week", detail.weekStart ?? detail.week],
                  ["Status", detail.statusLabel ?? detail.status],
                  ["Total hours", detail.totalHours],
                  ["Billable hours", detail.billableHours],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b pb-2">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{String(value ?? "—")}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No detail available.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

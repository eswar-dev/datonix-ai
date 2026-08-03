import { useEffect, useMemo, useState } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
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
import { toast } from "sonner";

export default function Timesheets() {
  const {
    timesheetSubmissions,
    timesheetSummary,
    timesheetWeekStart,
    setTimesheetWeekStart,
    refreshTimesheets,
    approveTimesheet,
    bulkApproveTimesheets,
    timesheetsLoading,
    timesheetsError,
  } = useAecApp();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refreshTimesheets();
  }, [refreshTimesheets]);

  const pendingCount = useMemo(
    () => timesheetSubmissions.filter((r) => r.status === "Pending").length,
    [timesheetSubmissions]
  );

  const weekLabel = formatWeekLabel(timesheetWeekStart);

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
        />
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
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
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { WeeklyTimesheetGrid } from "@/domains/aec/components/WeeklyTimesheetGrid";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import {
  formatWeekLabel,
  mondayOf,
  weekDatesFromMonday,
} from "@/domains/aec/api/timesheetsMappers";
import { emptyTimesheetRow, type TimesheetRow } from "@/domains/aec/data/timesheets";
import { toast } from "sonner";

const RESOURCE_KEY = "datonix-aec-timesheet-resource-id";

function loadStoredResourceId(): string {
  try {
    return localStorage.getItem(RESOURCE_KEY) || "";
  } catch {
    return "";
  }
}

function storeResourceId(id: string) {
  try {
    localStorage.setItem(RESOURCE_KEY, id);
  } catch {
    /* ignore */
  }
}

export default function SubmitTimesheet() {
  const navigate = useNavigate();
  const {
    projects,
    resources,
    refreshPipeline,
    refreshResources,
    resourcesLoading,
    pipelineLoading,
    loadMyTimesheet,
    saveAndSubmitTimesheet,
    timesheetWeekStart,
    setTimesheetWeekStart,
  } = useAecApp();

  const [resourceId, setResourceId] = useState(loadStoredResourceId);
  const [weekStart, setWeekStart] = useState(timesheetWeekStart || mondayOf());
  const [weekDates, setWeekDates] = useState(() => weekDatesFromMonday(weekStart));
  const [rows, setRows] = useState<TimesheetRow[]>([]);
  const [status, setStatus] = useState<string>("Draft");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refreshPipeline();
    void refreshResources();
  }, [refreshPipeline, refreshResources]);

  useEffect(() => {
    if (!resourceId && resources.length === 1) {
      const id = resources[0].resourceId || resources[0].id;
      setResourceId(id);
      storeResourceId(id);
    }
  }, [resources, resourceId]);

  useEffect(() => {
    if (!resourceId) {
      setRows([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void loadMyTimesheet(resourceId, weekStart).then((detail) => {
      if (cancelled) return;
      setLoading(false);
      if (!detail) {
        setRows([emptyTimesheetRow()]);
        setWeekDates(weekDatesFromMonday(weekStart));
        setStatus("Draft");
        return;
      }
      setWeekDates(detail.weekDates.length ? detail.weekDates : weekDatesFromMonday(weekStart));
      setRows(detail.rows.length ? detail.rows : [emptyTimesheetRow()]);
      setStatus(detail.status);
    });
    return () => {
      cancelled = true;
    };
  }, [resourceId, weekStart, loadMyTimesheet]);

  const projectOptions = useMemo(
    () => projects.map((p) => ({ id: p.id, name: p.name })),
    [projects]
  );

  const resourceOptions = useMemo(
    () =>
      resources.map((r) => ({
        id: r.resourceId || r.id,
        name: r.name,
      })),
    [resources]
  );

  const total = rows.reduce((s, r) => s + r.mon + r.tue + r.wed + r.thu + r.fri, 0);
  const weekLabel = formatWeekLabel(weekStart);
  const readOnly = status === "Pending" || status === "Approved";

  const onResourceChange = (id: string) => {
    setResourceId(id);
    storeResourceId(id);
  };

  const onWeekChange = (value: string) => {
    const week = mondayOf(value || mondayOf());
    setWeekStart(week);
    setTimesheetWeekStart(week);
  };

  const handleSubmit = async () => {
    if (!resourceId) {
      toast.error("Select a resource");
      return;
    }
    if (total === 0) {
      toast.error("Enter at least some hours before submitting");
      return;
    }
    if (rows.some((r) => (r.mon + r.tue + r.wed + r.thu + r.fri > 0) && !r.projectId)) {
      toast.error("Select a project for every row with hours");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await saveAndSubmitTimesheet({
        resourceId,
        weekStart,
        weekDates,
        rows,
      });
      toast.success(`${weekLabel} timesheet submitted for approval`);
      navigate("/timesheets");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Submit failed";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Submit Timesheet"
        subtitle={`Weekly time entry by project and task — ${weekLabel}.`}
        breadcrumb={[
          { label: "Timesheets", href: "/timesheets" },
          { label: "Submit Timesheet" },
        ]}
        actions={
          <Button size="sm" onClick={() => void handleSubmit()} disabled={submitting || readOnly || loading}>
            <Send className="mr-2 h-4 w-4" />
            {submitting ? "Submitting…" : "Submit for Approval"}
          </Button>
        }
      />

      {(loading || resourcesLoading || pipelineLoading) && (
        <PipelineLoadingBanner label="Loading timesheet…" />
      )}
      <PipelineErrorBanner message={error ?? ""} />

      <div className="flex flex-wrap gap-4">
        <div className="space-y-1 min-w-[220px]">
          <Label>Resource</Label>
          <Select value={resourceId || undefined} onValueChange={onResourceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select resource" />
            </SelectTrigger>
            <SelectContent>
              {resourceOptions.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="submit-week">Week start</Label>
          <Input
            id="submit-week"
            type="date"
            className="w-[160px]"
            value={weekStart}
            onChange={(e) => onWeekChange(e.target.value)}
          />
        </div>
      </div>

      {!resourceId ? (
        <PipelineEmptyState>
          Select a resource to load or create a weekly timesheet.
        </PipelineEmptyState>
      ) : (
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="text-base">
              {weekLabel}
              {status !== "Draft" ? ` — ${status}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyTimesheetGrid
              rows={rows}
              onChange={setRows}
              projects={projectOptions}
              weekDates={weekDates}
              readOnly={readOnly}
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Total hours this week:{" "}
              <span className="font-semibold text-foreground">{total}</span>
              {readOnly && " · Submitted timesheets cannot be edited"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

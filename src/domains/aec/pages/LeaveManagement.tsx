import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Badge } from "@/common/components/ui/badge";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { MetricStrip } from "@/domains/aec/components/MetricStrip";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import {
  downtimeEntries as seedDowntime,
  downtimeSummary,
  leaveTypes,
  type LeaveType,
} from "@/domains/aec/data/leave";

function formatShortDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

function typeBadge(type: string) {
  if (type === "CONTRACTOR") return "border-amber-500/30 bg-amber-500/10 text-amber-800";
  if (type === "FREELANCER") return "border-violet-500/30 bg-violet-500/10 text-violet-800";
  return "border-sky-500/30 bg-sky-500/10 text-sky-800";
}

export default function LeaveManagement() {
  const {
    leaveRequests,
    leaveSummaryLive,
    leaveLoading,
    leaveError,
    refreshLeave,
    submitLeaveRequest,
    approveLeave,
    rejectLeave,
  } = useAecApp();
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    type: "Annual Leave" as LeaveType,
    startDate: "",
    endDate: "",
    notes: "",
  });

  useEffect(() => {
    void refreshLeave({ scope: "team", status: "all" });
  }, [refreshLeave]);

  const pendingCount = useMemo(
    () => leaveRequests.filter((r) => r.status === "Pending").length,
    [leaveRequests]
  );

  const summary = leaveSummaryLive ?? {
    onLeaveToday: 0,
    pendingRequests: pendingCount,
    leaveDaysMonth: 0,
    avgBalanceDays: 0,
    monthLabel: new Date().toLocaleDateString(undefined, { month: "short", year: "numeric" }),
  };

  const approve = async (id: string) => {
    setBusy(true);
    try {
      await approveLeave(id);
      toast.success("Leave approved");
    } catch {
      /* toasted */
    } finally {
      setBusy(false);
    }
  };

  const reject = async (id: string) => {
    setBusy(true);
    try {
      await rejectLeave(id);
      toast.error("Leave rejected");
    } catch {
      /* toasted */
    } finally {
      setBusy(false);
    }
  };

  const submitNew = async () => {
    if (!form.startDate || !form.endDate) {
      toast.error("Enter start and end dates");
      return;
    }
    setBusy(true);
    try {
      await submitLeaveRequest({
        startDate: form.startDate,
        endDate: form.endDate,
        leaveType: form.type,
        notes: form.notes || undefined,
      });
      setShowForm(false);
      setForm({ type: "Annual Leave", startDate: "", endDate: "", notes: "" });
      toast.success("Leave request submitted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Leave & Downtime"
        subtitle="Leave register · Team calendar · Downtime tracking"
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Leave & Downtime" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => void refreshLeave()} disabled={leaveLoading}>
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowForm((v) => !v)}>
              <Plus className="mr-2 h-4 w-4" />
              New Leave Request
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="leave">
        <TabsList>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="downtime">Downtime</TabsTrigger>
        </TabsList>

        <TabsContent value="leave" className="mt-4 space-y-4">
          {leaveLoading && <PipelineLoadingBanner label="Loading leave…" />}
          <PipelineErrorBanner message={leaveError ?? ""} />

          <MetricStrip
            metrics={[
              { label: "On leave today", value: String(summary.onLeaveToday) },
              { label: "Pending requests", value: String(pendingCount) },
              { label: `Leave days (${summary.monthLabel})`, value: `${summary.leaveDaysMonth}d` },
              {
                label: "Avg balance left",
                value: summary.avgBalanceDays ? `${summary.avgBalanceDays}d` : "—",
              },
            ]}
          />

          {showForm && (
            <Card className="rounded-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">New Leave Request</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Leave type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm((f) => ({ ...f, type: v as LeaveType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Notes</Label>
                  <Input
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={() => void submitNew()} disabled={busy}>
                    Submit
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Leave Register — {summary.monthLabel}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              {!leaveLoading && leaveRequests.length === 0 ? (
                <div className="p-6">
                  <PipelineEmptyState>No leave requests yet.</PipelineEmptyState>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Leave type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead className="text-right">Days</TableHead>
                      <TableHead>Approver</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.employee}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${typeBadge(r.employmentType)}`}>
                            {r.employmentType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">
                            {r.entity || "—"}
                          </span>
                        </TableCell>
                        <TableCell>{r.type}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatShortDate(r.startDate)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatShortDate(r.endDate)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{r.days ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.approver}</TableCell>
                        <TableCell>
                          <StatusBadge
                            status={
                              r.status === "Approved"
                                ? "Approved"
                                : r.status === "Rejected"
                                  ? "Rejected"
                                  : r.status === "Draft"
                                    ? "Draft"
                                    : "Pending"
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {r.status === "Pending" && (
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => void reject(r.id)}
                              >
                                Reject
                              </Button>
                              <Button size="sm" disabled={busy} onClick={() => void approve(r.id)}>
                                Approve
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downtime" className="mt-4 space-y-4">
          <Card className="rounded-card border-dashed">
            <CardContent className="pt-4 text-sm text-muted-foreground">
              Downtime APIs are not available yet. Showing sample layout only — not live twin data.
            </CardContent>
          </Card>

          <MetricStrip
            metrics={[
              { label: `Downtime hours (${downtimeSummary.monthLabel})`, value: `${downtimeSummary.downtimeHours}h` },
              {
                label: "Downtime cost",
                value: `£${(downtimeSummary.downtimeCostGbp / 1000).toFixed(1)}K`,
              },
              { label: "Bench resources", value: String(downtimeSummary.benchResources) },
              { label: "Recoverable via realloc.", value: `${downtimeSummary.recoverablePct}%` },
            ]}
          />

          <Card className="rounded-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Downtime Register — {downtimeSummary.monthLabel}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Cost impact</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seedDowntime.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.resource}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${typeBadge(d.employmentType)}`}>
                          {d.employmentType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{d.entity}</span>
                      </TableCell>
                      <TableCell className="max-w-[280px] text-muted-foreground">{d.reason}</TableCell>
                      <TableCell className="text-right font-semibold">{d.hours ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {d.costImpactGbp > 0 ? `£${d.costImpactGbp.toLocaleString()}` : "£0"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={
                            d.status === "On Bench" || d.status === "Partial"
                              ? "Pending"
                              : d.status === "Planned"
                                ? "Active"
                                : "Inactive"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

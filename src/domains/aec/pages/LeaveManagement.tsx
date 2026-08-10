import { useMemo, useState } from "react";
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
  downtimeEntries as seedDowntime,
  downtimeSummary,
  leaveAiInsight,
  leaveRequests as seedLeave,
  leaveSummary,
  leaveTypes,
  type LeaveRequest,
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
  const [rows, setRows] = useState<LeaveRequest[]>(() => [...seedLeave]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employee: "",
    entity: "MA",
    type: "Annual Leave" as LeaveType,
    startDate: "",
    endDate: "",
  });

  const pendingCount = useMemo(
    () => rows.filter((r) => r.status === "Pending").length,
    [rows]
  );

  const approve = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)));
    toast.success("Leave approved");
  };

  const reject = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)));
    toast.error("Leave rejected");
  };

  const submitNew = () => {
    if (!form.employee.trim() || !form.startDate || !form.endDate) {
      toast.error("Enter employee and dates");
      return;
    }
    const start = new Date(`${form.startDate}T12:00:00`);
    const end = new Date(`${form.endDate}T12:00:00`);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
    const next: LeaveRequest = {
      id: `lr-${Date.now()}`,
      employee: form.employee.trim(),
      employmentType: "IN-HOUSE",
      entity: form.entity,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      days,
      approver: "You",
      status: "Pending",
      impact: "Pending review",
    };
    setRows((prev) => [next, ...prev]);
    setShowForm(false);
    setForm({ employee: "", entity: "MA", type: "Annual Leave", startDate: "", endDate: "" });
    toast.success("Leave request submitted");
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Leave & Downtime"
        subtitle="Leave register · Team calendar · Downtime tracking · AI insights"
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Leave & Downtime" },
        ]}
        actions={
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" />
            New Leave Request
          </Button>
        }
      />

      <Tabs defaultValue="leave">
        <TabsList>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="downtime">Downtime</TabsTrigger>
        </TabsList>

        <TabsContent value="leave" className="mt-4 space-y-4">
          <MetricStrip
            metrics={[
              { label: "On leave today", value: String(leaveSummary.onLeaveToday) },
              { label: "Pending requests", value: String(pendingCount) },
              { label: `Leave days (${leaveSummary.monthLabel})`, value: `${leaveSummary.leaveDaysMonth}d` },
              { label: "Avg balance left", value: `${leaveSummary.avgBalanceDays}d` },
            ]}
          />

          {showForm && (
            <Card className="rounded-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">New Leave Request</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Input
                    value={form.employee}
                    onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Entity</Label>
                  <Select value={form.entity} onValueChange={(v) => setForm((f) => ({ ...f, entity: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["MA", "ME", "MC"].map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                <div className="flex items-end gap-2">
                  <Button onClick={submitNew}>Submit</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Leave Register — {leaveSummary.monthLabel}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
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
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.employee}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${typeBadge(r.employmentType)}`}>
                          {r.employmentType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{r.entity}</span>
                      </TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell className="text-muted-foreground">{formatShortDate(r.startDate)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatShortDate(r.endDate)}</TableCell>
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
                            <Button size="sm" variant="outline" onClick={() => reject(r.id)}>
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => approve(r.id)}>
                              Approve
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm">
            <span className="font-semibold text-violet-700">AI Conflict Check: </span>
            <span className="text-muted-foreground">{leaveAiInsight}</span>
          </div>
        </TabsContent>

        <TabsContent value="downtime" className="mt-4 space-y-4">
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

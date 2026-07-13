import { AlertTriangle, CheckCheck, X } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { MetricStrip } from "@/domains/aec/components/MetricStrip";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { toast } from "sonner";

export default function LeaveManagement() {
  const { leaveRequests, approveLeave, rejectLeave } = useAecApp();
  const pending = leaveRequests.filter((l) => l.status === "Pending");

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Leave & Downtime"
        subtitle="Manage leave, illness, and unscheduled absence — with project impact visibility."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Leave & Downtime" },
        ]}
      />

      <MetricStrip
        metrics={[
          { label: "Pending Approval", value: String(pending.length) },
          { label: "Approved", value: String(leaveRequests.filter((l) => l.status === "Approved").length) },
          { label: "High Impact", value: String(leaveRequests.filter((l) => l.impact.startsWith("Medium") || l.impact.startsWith("High")).length) },
        ]}
      />

      {pending.some((l) => l.impact.startsWith("Medium") || l.impact.startsWith("High")) && (
        <Card className="rounded-card border-warning/40 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Project Impact Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            One or more leave requests may affect active project delivery. Review and approve with resource reallocation if needed.
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto rounded-card border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Project Impact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.employee}</TableCell>
                <TableCell><span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{l.entity}</span></TableCell>
                <TableCell>{l.type}</TableCell>
                <TableCell className="text-muted-foreground">{l.startDate} → {l.endDate}</TableCell>
                <TableCell>{l.days}</TableCell>
                <TableCell className="max-w-[200px] text-sm text-muted-foreground">{l.impact}</TableCell>
                <TableCell><StatusBadge status={l.status === "Approved" ? "Active" : l.status === "Rejected" ? "At Risk" : "Pending"} /></TableCell>
                <TableCell className="text-right">
                  {l.status === "Pending" && (
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { approveLeave(l.id); toast.success(`Approved leave for ${l.employee}`); }}>
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { rejectLeave(l.id); toast.error(`Rejected leave for ${l.employee}`); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { Checkbox } from "@/common/components/ui/checkbox";
import { Button } from "@/common/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import type { TimesheetSubmission } from "@/domains/aec/data/timesheets";

interface TimesheetApprovalGridProps {
  rows: TimesheetSubmission[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onApprove: (id: string) => void;
  onReject?: (id: string) => void;
}

export function TimesheetApprovalGrid({
  rows,
  selected,
  onToggleSelect,
  onToggleAll,
  onApprove,
  onReject,
}: TimesheetApprovalGridProps) {
  const pending = rows.filter((r) => r.status === "Pending");
  const allPendingSelected = pending.length > 0 && pending.every((r) => selected.has(r.id));

  return (
    <div className="overflow-x-auto rounded-card border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allPendingSelected}
                onCheckedChange={(c) => onToggleAll(!!c)}
                aria-label="Select all pending"
              />
            </TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Week</TableHead>
            <TableHead className="text-right">Hours</TableHead>
            <TableHead className="text-right">Billable</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                No timesheets for this week.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {row.status === "Pending" && (
                    <Checkbox
                      checked={selected.has(row.id)}
                      onCheckedChange={() => onToggleSelect(row.id)}
                      aria-label={`Select ${row.employee}`}
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">{row.employee}</TableCell>
                <TableCell>{row.entity}</TableCell>
                <TableCell>{row.week}</TableCell>
                <TableCell className="text-right">{row.totalHours}</TableCell>
                <TableCell className="text-right">{row.billableHours}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={
                      row.status === "Approved"
                        ? "Active"
                        : row.status === "Rejected"
                          ? "At Risk"
                          : "Pending"
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  {row.status === "Pending" && (
                    <div className="flex justify-end gap-1">
                      {onReject && (
                        <Button size="sm" variant="outline" onClick={() => onReject(row.id)}>
                          Reject
                        </Button>
                      )}
                      <Button size="sm" onClick={() => onApprove(row.id)}>
                        Approve
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

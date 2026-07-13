import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import type { Milestone } from "@/domains/aec/data/wbs";
import { cn } from "@/common/lib/utils";

function varianceClass(days: number) {
  if (days > 0) return "text-destructive font-semibold";
  if (days < 0) return "text-success font-semibold";
  return "text-muted-foreground";
}

function formatVariance(days: number) {
  if (days > 0) return `+${days}d`;
  if (days < 0) return `${days}d`;
  return "0d";
}

export function MilestoneTable({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="overflow-x-auto rounded-card border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Milestone</TableHead>
            <TableHead>Phase</TableHead>
            <TableHead>Planned</TableHead>
            <TableHead>Actual</TableHead>
            <TableHead className="text-right">Variance</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {milestones.map((ms) => (
            <TableRow key={ms.id}>
              <TableCell className="font-medium">{ms.name}</TableCell>
              <TableCell className="text-muted-foreground">{ms.phase}</TableCell>
              <TableCell>{ms.plannedDate}</TableCell>
              <TableCell>{ms.actualDate ?? "—"}</TableCell>
              <TableCell className={cn("text-right", varianceClass(ms.varianceDays))}>
                {formatVariance(ms.varianceDays)}
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={
                    ms.status === "Complete"
                      ? "Active"
                      : ms.status === "Overdue"
                        ? "At Risk"
                        : ms.status === "At Risk"
                          ? "At Risk"
                          : "Pending"
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

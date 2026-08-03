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

export function MilestoneTable({
  milestones,
  bordered = true,
}: {
  milestones: Milestone[];
  bordered?: boolean;
}) {
  if (!milestones.length) {
    return <p className="py-6 text-sm text-muted-foreground">No milestones.</p>;
  }

  return (
    <div className={cn("overflow-x-auto", bordered && "rounded-card border")}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[140px]">Milestone</TableHead>
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
              <TableCell className="tabular-nums">{ms.plannedDate}</TableCell>
              <TableCell className="tabular-nums">{ms.actualDate ?? "—"}</TableCell>
              <TableCell className={cn("text-right tabular-nums", varianceClass(ms.varianceDays))}>
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

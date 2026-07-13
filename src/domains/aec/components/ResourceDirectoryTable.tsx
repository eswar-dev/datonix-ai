import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import type { ResourceRecord } from "@/domains/aec/data/resources";
import { cn } from "@/common/lib/utils";

const statusMap: Record<ResourceRecord["status"], string> = {
  Over: "At Risk",
  Good: "Active",
  Bench: "Pending",
  "At Risk": "At Risk",
};

export function ResourceDirectoryTable({ resources }: { resources: ResourceRecord[] }) {
  if (resources.length === 0) {
    return (
      <div className="rounded-card border py-12 text-center text-sm text-muted-foreground">
        No resources match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Bill</TableHead>
            <TableHead className="text-right">Util %</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell className="text-xs">{r.type}</TableCell>
              <TableCell>{r.entity}</TableCell>
              <TableCell className="text-muted-foreground">{r.designation}</TableCell>
              <TableCell className="text-sm">{r.costRate}</TableCell>
              <TableCell className="text-sm">{r.billRate}</TableCell>
              <TableCell
                className={cn(
                  "text-right font-semibold",
                  r.utilization >= 95 && "text-destructive",
                  r.utilization < 70 && "text-muted-foreground"
                )}
              >
                {r.utilization}%
              </TableCell>
              <TableCell>
                <StatusBadge status={statusMap[r.status]} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

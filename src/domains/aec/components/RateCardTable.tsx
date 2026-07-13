import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import type { RateCardRow } from "@/domains/aec/data/rateCards";

export function RateCardTable({ rows }: { rows: RateCardRow[] }) {
  return (
    <div className="overflow-x-auto rounded-card border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Cost Rate</TableHead>
            <TableHead>Bill Rate</TableHead>
            <TableHead>Effective</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.role}</TableCell>
              <TableCell>{row.entity}</TableCell>
              <TableCell className="text-xs">{row.type}</TableCell>
              <TableCell>{row.costRate}</TableCell>
              <TableCell>{row.billRate}</TableCell>
              <TableCell className="text-muted-foreground">{row.effectiveFrom}</TableCell>
              <TableCell>
                <StatusBadge status={row.status === "Active" ? "Active" : row.status === "Pending" ? "Pending" : "At Risk"} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import type { CrossEntityAllocation } from "@/domains/aec/data/resources";

export function CrossEntityAllocationTable({ rows }: { rows: CrossEntityAllocation[] }) {
  return (
    <div className="overflow-x-auto rounded-card border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Home Entity</TableHead>
            <TableHead>Allocated To</TableHead>
            <TableHead className="text-right">Allocation</TableHead>
            <TableHead className="text-right">Home %</TableHead>
            <TableHead className="text-right">Host %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.resource}-${row.allocatedTo}`}>
              <TableCell className="font-medium">{row.resource}</TableCell>
              <TableCell className="text-xs">{row.type}</TableCell>
              <TableCell>{row.homeEntity}</TableCell>
              <TableCell className="text-muted-foreground">{row.allocatedTo}</TableCell>
              <TableCell className="text-right">{row.allocationPct}%</TableCell>
              <TableCell className="text-right">{row.costSplitHome}%</TableCell>
              <TableCell className="text-right">{row.costSplitHost}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

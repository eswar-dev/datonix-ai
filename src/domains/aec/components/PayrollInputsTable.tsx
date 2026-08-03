import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Badge } from "@/common/components/ui/badge";
import type { PayrollInput } from "@/domains/aec/data/accounting";

interface PayrollInputsTableProps {
  rows: PayrollInput[];
}

export function PayrollInputsTable({ rows }: PayrollInputsTableProps) {
  return (
    <div className="overflow-x-auto rounded-card border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{r.entity}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">
                  {r.type}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{r.period}</TableCell>
              <TableCell className="text-right font-medium">
                {r.amountDisplay ?? `£${r.amountGbp.toLocaleString()}`}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{r.note ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

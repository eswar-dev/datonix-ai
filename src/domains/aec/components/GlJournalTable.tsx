import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Badge } from "@/common/components/ui/badge";
import type { GlJournalEntry } from "@/domains/aec/data/accounting";

interface GlJournalTableProps {
  entries: GlJournalEntry[];
}

export function GlJournalTable({ entries }: GlJournalTableProps) {
  return (
    <div className="overflow-x-auto rounded-card border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Debit</TableHead>
            <TableHead className="text-right">Credit</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Entity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="text-muted-foreground">{e.date}</TableCell>
              <TableCell className="font-mono text-xs">{e.account}</TableCell>
              <TableCell>{e.description}</TableCell>
              <TableCell className="text-right">
                {e.debit != null ? `£${e.debit.toLocaleString()}` : "—"}
              </TableCell>
              <TableCell className="text-right">
                {e.credit != null ? `£${e.credit.toLocaleString()}` : "—"}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px] font-medium">
                  {e.source}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{e.entity}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

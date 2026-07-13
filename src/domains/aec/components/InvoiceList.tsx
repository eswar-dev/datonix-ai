import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Badge } from "@/common/components/ui/badge";
import { StatusBadge } from "./StatusBadge";
import type { Invoice } from "@/domains/aec/data/accounting";
import { cn } from "@/common/lib/utils";

interface InvoiceListProps {
  invoices: Invoice[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  return (
    <div className="overflow-x-auto rounded-card border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Client / Project</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Days</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell className="font-mono text-sm font-medium">{inv.id}</TableCell>
              <TableCell>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{inv.entity}</span>
              </TableCell>
              <TableCell>
                <p className="font-medium">{inv.client}</p>
                <p className="text-xs text-muted-foreground">{inv.project}</p>
              </TableCell>
              <TableCell className="text-right font-medium">£{inv.amountGbp.toLocaleString()}</TableCell>
              <TableCell
                className={cn(
                  "text-right",
                  inv.daysOutstanding >= 60 && "font-semibold text-destructive"
                )}
              >
                {inv.daysOutstanding > 0 ? `${inv.daysOutstanding}d` : "—"}
              </TableCell>
              <TableCell>
                {inv.status === "Escalate" ? (
                  <Badge variant="outline" className="border-destructive/30 bg-destructive/15 text-destructive text-[11px]">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    65d+ Escalate
                  </Badge>
                ) : (
                  <StatusBadge status={inv.status} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { AlertTriangle } from "lucide-react";
import { Button } from "@/common/components/ui/button";
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
  onMarkPaid?: (id: string) => void;
  onChase?: (id: string) => void;
  onEscalate?: (id: string) => void;
  busyId?: string | null;
}

export function InvoiceList({
  invoices,
  onMarkPaid,
  onChase,
  onEscalate,
  busyId,
}: InvoiceListProps) {
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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                No invoices yet.
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-sm font-medium">
                  {inv.number || inv.id}
                </TableCell>
                <TableCell>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{inv.entity}</span>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{inv.client}</p>
                  <p className="text-xs text-muted-foreground">{inv.project}</p>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {inv.amountDisplay ?? `£${inv.amountGbp.toLocaleString()}`}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right",
                    inv.daysOutstanding >= 60 && "font-semibold text-destructive"
                  )}
                >
                  {inv.daysOutstanding > 0 ? `${inv.daysOutstanding}d` : "—"}
                </TableCell>
                <TableCell>
                  {inv.status === "Escalate" || inv.escalated ? (
                    <Badge
                      variant="outline"
                      className="border-destructive/30 bg-destructive/15 text-destructive text-[11px]"
                    >
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Escalate
                    </Badge>
                  ) : (
                    <StatusBadge status={inv.status} />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {inv.status !== "Paid" && (
                    <div className="flex justify-end gap-1">
                      {onChase && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === inv.id}
                          onClick={() => onChase(inv.id)}
                        >
                          Chase
                        </Button>
                      )}
                      {onEscalate && inv.daysOutstanding >= 45 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === inv.id}
                          onClick={() => onEscalate(inv.id)}
                        >
                          Escalate
                        </Button>
                      )}
                      {onMarkPaid && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === inv.id}
                          onClick={() => onMarkPaid(inv.id)}
                        >
                          Mark paid
                        </Button>
                      )}
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

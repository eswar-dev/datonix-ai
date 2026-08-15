import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
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
import { mapInvoice } from "@/domains/aec/api/accountingMappers";
import { aecGetInvoice } from "@/common/api/aecAccounting";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import { cn } from "@/common/lib/utils";
import { toast } from "sonner";

interface InvoiceListProps {
  invoices: Invoice[];
  twinId?: string;
  onMarkPaid?: (id: string) => void;
  onChase?: (id: string) => void;
  onEscalate?: (id: string) => void;
  busyId?: string | null;
}

export function InvoiceList({
  invoices,
  twinId,
  onMarkPaid,
  onChase,
  onEscalate,
  busyId,
}: InvoiceListProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [detailMapped, setDetailMapped] = useState<Invoice | null>(null);

  const openDetail = async (id: string) => {
    if (!twinId || !isApiTwinId(twinId)) {
      toast.error("Select an API twin to load invoice detail");
      return;
    }
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    setDetailMapped(null);
    try {
      const raw = await aecGetInvoice(twinId, id);
      const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
      setDetail(rec);
      setDetailMapped(mapInvoice(raw));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load invoice");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
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
                    <button
                      type="button"
                      className="text-left hover:underline"
                      onClick={() => void openDetail(inv.id)}
                    >
                      {inv.number || inv.id}
                    </button>
                  </TableCell>
                  <TableCell>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">
                      {inv.entity}
                    </span>
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
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === inv.id}
                        onClick={() => void openDetail(inv.id)}
                      >
                        Detail
                      </Button>
                      {inv.status !== "Paid" && (
                        <>
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
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {detailMapped?.number ?? "Invoice"} — Detail
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : detailMapped && detail ? (
            <dl className="grid gap-3 text-sm">
              {(
                [
                  ["Client", detailMapped.client],
                  ["Project", detailMapped.project],
                  ["Entity", detailMapped.entity],
                  ["Amount", detailMapped.amountDisplay ?? String(detailMapped.amountGbp)],
                  ["Net", detail.netAmount != null ? String(detail.netAmount) : "—"],
                  ["Tax", detail.taxAmount != null ? String(detail.taxAmount) : "—"],
                  ["Currency", String(detail.currency ?? "—")],
                  ["Tax rule", String(detail.taxRule ?? "—")],
                  ["Type", String(detail.invoiceType ?? "—")],
                  ["Due", detailMapped.dueDate || "—"],
                  ["Aging", `${detailMapped.daysOutstanding}d`],
                  ["Status", detailMapped.status],
                  ["Issued", String(detail.issuedAt ?? "—")],
                  ["Paid", String(detail.paidAt ?? "—")],
                  ["Chased", detailMapped.chaseRequested ? "Yes" : "No"],
                  ["Escalated", detailMapped.escalated ? "Yes" : "No"],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b pb-2">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No detail available.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

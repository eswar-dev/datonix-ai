import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { MetricStrip } from "@/domains/aec/components/MetricStrip";
import { InvoiceList } from "@/domains/aec/components/InvoiceList";
import { GlJournalTable } from "@/domains/aec/components/GlJournalTable";
import { PayrollInputsTable } from "@/domains/aec/components/PayrollInputsTable";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { toast } from "sonner";

export default function Accounting() {
  const {
    invoices,
    apEntries,
    glEntries,
    payrollRows,
    payrollPeriod,
    accountingSummary,
    accountingLoading,
    accountingError,
    refreshAccounting,
    markInvoicePaid,
    chaseInvoice,
    escalateInvoice,
    processPayroll,
  } = useAecApp();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [processingPayroll, setProcessingPayroll] = useState(false);

  useEffect(() => {
    void refreshAccounting();
  }, [refreshAccounting]);

  const overdueCount = invoices.filter(
    (i) => i.status === "Overdue" || i.status === "Escalate" || i.daysOutstanding >= 45
  ).length;

  const run = async (id: string, fn: (id: string) => Promise<void>, ok: string) => {
    setBusyId(id);
    try {
      await fn(id);
      toast.success(ok);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const onProcessPayroll = async () => {
    setProcessingPayroll(true);
    try {
      await processPayroll();
      toast.success(`Payroll processed for ${payrollPeriod}`);
      await refreshAccounting();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payroll process failed");
    } finally {
      setProcessingPayroll(false);
    }
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Accounting"
        subtitle="AR/AP, general ledger, and payroll across entities."
        breadcrumb={[
          { label: "Accounting", href: "/accounting" },
          { label: "Overview" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void refreshAccounting()} disabled={accountingLoading}>
              Refresh
            </Button>
            <Button size="sm" asChild>
              <Link to="/accounting/create-invoice">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
          </div>
        }
      />

      {accountingLoading && <PipelineLoadingBanner label="Loading accounting…" />}
      <PipelineErrorBanner message={accountingError ?? ""} />

      <MetricStrip
        metrics={[
          {
            label: "AR Outstanding",
            value: accountingSummary?.arOutstandingDisplay ?? "£0",
          },
          {
            label: "Revenue YTD",
            value: accountingSummary?.revenueYtdDisplay ?? "£0",
          },
          {
            label: "AR 60d+",
            value: accountingSummary?.ar60PlusDisplay ?? String(overdueCount),
          },
          {
            label: "Gross margin",
            value: `${accountingSummary?.grossMarginPct ?? 0}%`,
          },
        ]}
      />

      <Tabs defaultValue="ar">
        <TabsList>
          <TabsTrigger value="ar">AR / Invoices</TabsTrigger>
          <TabsTrigger value="ap">AP</TabsTrigger>
          <TabsTrigger value="gl">General Ledger</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Inputs</TabsTrigger>
        </TabsList>

        <TabsContent value="ar" className="mt-4">
          <InvoiceList
            invoices={invoices}
            busyId={busyId}
            onMarkPaid={(id) => void run(id, markInvoicePaid, "Invoice marked paid")}
            onChase={(id) => void run(id, chaseInvoice, "Chase requested")}
            onEscalate={(id) => void run(id, escalateInvoice, "Invoice escalated")}
          />
        </TabsContent>

        <TabsContent value="ap" className="mt-4">
          {apEntries.length === 0 ? (
            <PipelineEmptyState>No AP bills yet.</PipelineEmptyState>
          ) : (
            <div className="overflow-x-auto rounded-card border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apEntries.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-sm">{a.id.slice(0, 8)}</TableCell>
                      <TableCell className="font-medium">{a.vendor}</TableCell>
                      <TableCell>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{a.entity}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {a.amountDisplay ?? `£${a.amountGbp.toLocaleString()}`}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{a.dueDate || "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={a.status === "Paid" ? "Active" : "Pending"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="gl" className="mt-4">
          {glEntries.length === 0 ? (
            <PipelineEmptyState>No GL journal lines yet.</PipelineEmptyState>
          ) : (
            <GlJournalTable entries={glEntries} />
          )}
        </TabsContent>

        <TabsContent value="payroll" className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Period {payrollPeriod}</p>
            <Button size="sm" onClick={() => void onProcessPayroll()} disabled={processingPayroll}>
              {processingPayroll ? "Processing…" : "Process payroll"}
            </Button>
          </div>
          {payrollRows.length === 0 ? (
            <PipelineEmptyState>No payroll rows for this period.</PipelineEmptyState>
          ) : (
            <PayrollInputsTable rows={payrollRows} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

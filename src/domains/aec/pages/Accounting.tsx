import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
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
    createApBill,
    markApPaid,
    createGlJournal,
    activeTwin,
    activeTwinId,
  } = useAecApp();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [processingPayroll, setProcessingPayroll] = useState(false);
  const [showApForm, setShowApForm] = useState(false);
  const [showGlForm, setShowGlForm] = useState(false);
  const [apForm, setApForm] = useState({
    entityId: "",
    supplier: "",
    amount: "",
    dueDate: "",
    reference: "",
  });
  const [glForm, setGlForm] = useState({
    description: "",
    entityId: "",
    debitCode: "6100",
    debitName: "Expense",
    creditCode: "2000",
    creditName: "Accounts Payable",
    amount: "",
  });

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

  const onCreateAp = async () => {
    const entityId = apForm.entityId || activeTwin.entities[0]?.id;
    if (!entityId || !apForm.supplier.trim() || !apForm.amount) {
      toast.error("Entity, supplier, and amount are required");
      return;
    }
    setBusyId("ap-create");
    try {
      await createApBill({
        entityId,
        supplier: apForm.supplier.trim(),
        amount: Number(apForm.amount),
        dueDate: apForm.dueDate || undefined,
        reference: apForm.reference || undefined,
      });
      toast.success("AP bill created");
      setShowApForm(false);
      setApForm({ entityId: "", supplier: "", amount: "", dueDate: "", reference: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AP create failed");
    } finally {
      setBusyId(null);
    }
  };

  const onCreateGl = async () => {
    if (!glForm.description.trim() || !glForm.amount) {
      toast.error("Description and amount are required");
      return;
    }
    const amount = Number(glForm.amount);
    setBusyId("gl-create");
    try {
      await createGlJournal({
        description: glForm.description.trim(),
        entityId: glForm.entityId || activeTwin.entities[0]?.id,
        lines: [
          {
            accountCode: glForm.debitCode,
            accountName: glForm.debitName,
            debit: amount,
            credit: 0,
          },
          {
            accountCode: glForm.creditCode,
            accountName: glForm.creditName,
            debit: 0,
            credit: amount,
          },
        ],
      });
      toast.success("GL journal posted");
      setShowGlForm(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "GL create failed");
    } finally {
      setBusyId(null);
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
            twinId={activeTwinId}
            busyId={busyId}
            onMarkPaid={(id) => void run(id, markInvoicePaid, "Invoice marked paid")}
            onChase={(id) => void run(id, chaseInvoice, "Chase requested")}
            onEscalate={(id) => void run(id, escalateInvoice, "Invoice escalated")}
          />
        </TabsContent>

        <TabsContent value="ap" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowApForm((v) => !v)}>
              <Plus className="mr-2 h-4 w-4" />
              New AP Bill
            </Button>
          </div>

          {showApForm && (
            <Card className="rounded-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Create AP bill</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Entity</Label>
                  <Select
                    value={apForm.entityId || activeTwin.entities[0]?.id || ""}
                    onValueChange={(v) => setApForm((f) => ({ ...f, entityId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeTwin.entities.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Input
                    value={apForm.supplier}
                    onChange={(e) => setApForm((f) => ({ ...f, supplier: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={apForm.amount}
                    onChange={(e) => setApForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due date</Label>
                  <Input
                    type="date"
                    value={apForm.dueDate}
                    onChange={(e) => setApForm((f) => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reference</Label>
                  <Input
                    value={apForm.reference}
                    onChange={(e) => setApForm((f) => ({ ...f, reference: e.target.value }))}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={() => void onCreateAp()} disabled={busyId === "ap-create"}>
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => setShowApForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-right">
                        {a.status !== "Paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === a.id}
                            onClick={() => void run(a.id, markApPaid, "AP bill marked paid")}
                          >
                            Mark paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="gl" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowGlForm((v) => !v)}>
              <Plus className="mr-2 h-4 w-4" />
              Post journal
            </Button>
          </div>
          {showGlForm && (
            <Card className="rounded-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Manual GL journal</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Description</Label>
                  <Input
                    value={glForm.description}
                    onChange={(e) => setGlForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={glForm.amount}
                    onChange={(e) => setGlForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Entity</Label>
                  <Select
                    value={glForm.entityId || activeTwin.entities[0]?.id || ""}
                    onValueChange={(v) => setGlForm((f) => ({ ...f, entityId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activeTwin.entities.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Debit account</Label>
                  <Input
                    value={glForm.debitCode}
                    onChange={(e) => setGlForm((f) => ({ ...f, debitCode: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Credit account</Label>
                  <Input
                    value={glForm.creditCode}
                    onChange={(e) => setGlForm((f) => ({ ...f, creditCode: e.target.value }))}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={() => void onCreateGl()} disabled={busyId === "gl-create"}>
                    Post
                  </Button>
                  <Button variant="outline" onClick={() => setShowGlForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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

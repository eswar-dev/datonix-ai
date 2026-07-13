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
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { apEntries, glJournalEntries, payrollInputs } from "@/domains/aec/data/accounting";

export default function Accounting() {
  const { invoices } = useAecApp();
  const arTotal = invoices.reduce((s, i) => s + i.amountGbp, 0);
  const apTotal = apEntries.reduce((s, a) => s + a.amountGbp, 0);
  const overdueCount = invoices.filter((i) => i.daysOutstanding >= 45).length;

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Accounting"
        subtitle="AR/AP, general ledger, and payroll inputs across MA, ME, and MC."
        breadcrumb={[
          { label: "Accounting", href: "/accounting" },
          { label: "Overview" },
        ]}
        actions={
          <Button size="sm" asChild>
            <Link to="/accounting/create-invoice">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
        }
      />

      <MetricStrip
        metrics={[
          { label: "AR Outstanding", value: `£${(arTotal / 1000).toFixed(0)}K` },
          { label: "AP Due", value: `£${(apTotal / 1000).toFixed(0)}K` },
          { label: "Overdue Invoices", value: String(overdueCount), trend: "down", change: overdueCount > 0 ? "Action needed" : "Clear" },
          { label: "GL Entries (MTD)", value: String(glJournalEntries.length) },
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
          <InvoiceList invoices={invoices} />
        </TabsContent>

        <TabsContent value="ap" className="mt-4">
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
                {apEntries.map((ap) => (
                  <TableRow key={ap.id}>
                    <TableCell className="font-mono text-sm">{ap.id}</TableCell>
                    <TableCell className="font-medium">{ap.vendor}</TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{ap.entity}</span>
                    </TableCell>
                    <TableCell className="text-right">£{ap.amountGbp.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{ap.dueDate}</TableCell>
                    <TableCell><StatusBadge status={ap.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="gl" className="mt-4">
          <GlJournalTable entries={glJournalEntries} />
        </TabsContent>

        <TabsContent value="payroll" className="mt-4">
          <PayrollInputsTable rows={payrollInputs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

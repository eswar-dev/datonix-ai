import { useEffect, useMemo } from "react";
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
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { Button } from "@/common/components/ui/button";

function formatAmount(amount: number, currency = "GBP"): string {
  const symbol = currency === "GBP" ? "£" : currency === "EUR" ? "€" : `${currency} `;
  return `${symbol}${amount.toFixed(2)}`;
}

function categoryLabel(category: string, other?: string): string {
  if (category === "other" && other) return other;
  if (!category) return "—";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default function ExpenseApprovals() {
  const {
    pendingExpenses,
    refreshExpenses,
    expensesLoading,
    expensesError,
  } = useAecApp();

  useEffect(() => {
    void refreshExpenses();
  }, [refreshExpenses]);

  const pending = useMemo(
    () => pendingExpenses.filter((e) => e.status === "Pending"),
    [pendingExpenses]
  );
  const approved = useMemo(
    () => pendingExpenses.filter((e) => e.status === "Approved"),
    [pendingExpenses]
  );
  const pendingValue = pending.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Expense Approvals"
        subtitle="Review reimbursable expenses submitted by project teams."
        breadcrumb={[
          { label: "Timesheets", href: "/timesheets" },
          { label: "Expense Approvals" },
        ]}
        actions={
          <Button size="sm" variant="outline" onClick={() => void refreshExpenses()} disabled={expensesLoading}>
            Refresh
          </Button>
        }
      />

      {expensesLoading && <PipelineLoadingBanner label="Loading expenses…" />}
      <PipelineErrorBanner message={expensesError ?? ""} />

      <MetricStrip
        metrics={[
          { label: "Pending", value: String(pending.length) },
          { label: "Approved", value: String(approved.length) },
          { label: "Pending value", value: formatAmount(pendingValue) },
        ]}
      />

      {!expensesLoading && pendingExpenses.length === 0 ? (
        <PipelineEmptyState>No expenses submitted yet.</PipelineEmptyState>
      ) : (
        <div className="overflow-x-auto rounded-card border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingExpenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.employee}</TableCell>
                  <TableCell>{e.project}</TableCell>
                  <TableCell>{categoryLabel(e.category, e.categoryLabel)}</TableCell>
                  <TableCell className="text-muted-foreground">{e.date}</TableCell>
                  <TableCell className="text-right">
                    {formatAmount(e.amount, e.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={
                        e.status === "Approved"
                          ? "Active"
                          : e.status === "Rejected"
                            ? "At Risk"
                            : "Pending"
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

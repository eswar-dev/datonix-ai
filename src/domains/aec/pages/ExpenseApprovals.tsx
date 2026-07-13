import { CheckCheck, X } from "lucide-react";
import { Button } from "@/common/components/ui/button";
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
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { toast } from "sonner";

export default function ExpenseApprovals() {
  const { pendingExpenses, approveExpense, rejectExpense } = useAecApp();
  const pending = pendingExpenses.filter((e) => e.status === "Pending");

  const handleApprove = (id: string) => {
    const row = pendingExpenses.find((e) => e.id === id);
    approveExpense(id);
    toast.success(`Approved expense for ${row?.employee}`);
  };

  const handleReject = (id: string) => {
    const row = pendingExpenses.find((e) => e.id === id);
    rejectExpense(id);
    toast.error(`Rejected expense for ${row?.employee}`);
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Expense Approvals"
        subtitle="Review and approve reimbursable expenses submitted by project teams."
        breadcrumb={[
          { label: "Timesheets", href: "/timesheets" },
          { label: "Expense Approvals" },
        ]}
      />

      <MetricStrip
        metrics={[
          { label: "Pending", value: String(pending.length) },
          { label: "Approved", value: String(pendingExpenses.filter((e) => e.status === "Approved").length) },
          { label: "Total Value", value: `£${pending.reduce((s, e) => s + e.amount, 0).toFixed(0)}` },
        ]}
      />

      <div className="overflow-x-auto rounded-card border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                  No expenses submitted yet.
                </TableCell>
              </TableRow>
            ) : (
              pendingExpenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.employee}</TableCell>
                  <TableCell><span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{e.entity}</span></TableCell>
                  <TableCell>{e.project}</TableCell>
                  <TableCell>{e.category}</TableCell>
                  <TableCell className="text-muted-foreground">{e.date}</TableCell>
                  <TableCell className="text-right">£{e.amount.toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={e.status === "Pending" ? "Pending" : "Active"} /></TableCell>
                  <TableCell className="text-right">
                    {e.status === "Pending" && (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleApprove(e.id)}>
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleReject(e.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

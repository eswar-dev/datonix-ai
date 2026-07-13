import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ArrowRight } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { ExpenseForm, type ExpenseFormValues } from "@/domains/aec/components/ExpenseForm";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { useAuth } from "@/common/contexts/AuthContext";
import { approvalRouteSteps } from "@/domains/aec/data/expenses";
import { toast } from "sonner";

const initialValues: ExpenseFormValues = {
  date: "2026-03-15",
  category: "Travel",
  amount: "",
  project: "Kings Cross Tower",
  description: "",
};

export default function SubmitExpense() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitExpense, activeTwin } = useAecApp();
  const [values, setValues] = useState<ExpenseFormValues>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.amount || !values.description.trim()) {
      toast.error("Please enter amount and description");
      return;
    }
    submitExpense({
      employee: user?.name ?? "Current User",
      entity: activeTwin.entities[0]?.code ?? "MA",
      category: values.category,
      amount: Number(values.amount),
      project: values.project,
      date: values.date,
    });
    toast.success("Expense submitted for approval");
    navigate("/expenses/approvals");
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Submit Expense"
        subtitle="Submit reimbursable expenses with project allocation and approval routing."
        breadcrumb={[
          { label: "Timesheets", href: "/timesheets" },
          { label: "Submit Expense" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="text-base">Expense Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <ExpenseForm values={values} onChange={setValues} />
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" />
                Submit Expense
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="text-base">Approval Route</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvalRouteSteps.map((step, i) => (
                <div key={step.step} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                    {step.step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{step.role}</p>
                    <p className="text-xs text-muted-foreground">{step.action}</p>
                  </div>
                  {i < approvalRouteSteps.length - 1 && (
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

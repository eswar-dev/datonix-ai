import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { ExpenseForm, type ExpenseFormValues } from "@/domains/aec/components/ExpenseForm";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { mapExpenseApprovalRoute } from "@/domains/aec/api/timesheetsMappers";
import { toast } from "sonner";

const RESOURCE_KEY = "datonix-aec-timesheet-resource-id";

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function loadStoredResourceId(): string {
  try {
    return localStorage.getItem(RESOURCE_KEY) || "";
  } catch {
    return "";
  }
}

function storeResourceId(id: string) {
  try {
    localStorage.setItem(RESOURCE_KEY, id);
  } catch {
    /* ignore */
  }
}

export default function SubmitExpense() {
  const navigate = useNavigate();
  const {
    projects,
    resources,
    expenseCategories,
    refreshPipeline,
    refreshResources,
    loadExpenseCategories,
    submitExpense,
    resourcesLoading,
    pipelineLoading,
  } = useAecApp();

  const [values, setValues] = useState<ExpenseFormValues>({
    date: todayIso(),
    category: "",
    categoryOther: "",
    amount: "",
    projectId: "",
    description: "",
    resourceId: loadStoredResourceId(),
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refreshPipeline();
    void refreshResources();
    setLoadingCats(true);
    void loadExpenseCategories().finally(() => setLoadingCats(false));
  }, [refreshPipeline, refreshResources, loadExpenseCategories]);

  useEffect(() => {
    if (!values.resourceId && resources.length === 1) {
      const id = resources[0].resourceId || resources[0].id;
      setValues((v) => ({ ...v, resourceId: id }));
      storeResourceId(id);
    }
  }, [resources, values.resourceId]);

  useEffect(() => {
    if (!values.category && expenseCategories.length) {
      setValues((v) => ({ ...v, category: expenseCategories[0].value }));
    }
  }, [expenseCategories, values.category]);

  const projectOptions = useMemo(
    () => projects.map((p) => ({ id: p.id, name: p.name })),
    [projects]
  );
  const resourceOptions = useMemo(
    () => resources.map((r) => ({ id: r.resourceId || r.id, name: r.name })),
    [resources]
  );

  const amountNum = Number(values.amount) || 0;
  const route = mapExpenseApprovalRoute(amountNum);

  const onFormChange = (next: ExpenseFormValues) => {
    if (next.resourceId && next.resourceId !== values.resourceId) {
      storeResourceId(next.resourceId);
    }
    setValues(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.resourceId) {
      toast.error("Select a resource");
      return;
    }
    if (!values.category) {
      toast.error("Select a category");
      return;
    }
    if (!values.amount || amountNum <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (values.category === "other" && !values.categoryOther.trim()) {
      toast.error("Describe the other category");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitExpense({
        resourceId: values.resourceId,
        expenseDate: values.date,
        category: values.category,
        categoryOther: values.category === "other" ? values.categoryOther.trim() : undefined,
        amount: amountNum,
        projectId: values.projectId || undefined,
        notes: values.description.trim(),
      });
      toast.success("Expense submitted for approval");
      navigate("/expenses/approvals");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submit failed";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
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

      {(resourcesLoading || pipelineLoading || loadingCats) && (
        <PipelineLoadingBanner label="Loading expense form…" />
      )}
      <PipelineErrorBanner message={error ?? ""} />

      {!resourceOptions.length && !resourcesLoading ? (
        <PipelineEmptyState>
          Add a resource first, then submit an expense against it.
        </PipelineEmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-card">
            <CardHeader>
              <CardTitle className="text-base">Expense Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <ExpenseForm
                  values={values}
                  onChange={onFormChange}
                  categories={expenseCategories}
                  projects={projectOptions}
                  resources={resourceOptions}
                />
                <Button type="submit" disabled={submitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? "Submitting…" : "Submit Expense"}
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
                {route.map((step) => (
                  <div key={step.step} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                      {step.step}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{step.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

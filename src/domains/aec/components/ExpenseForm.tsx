import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { expenseCategories, type ExpenseCategory } from "@/domains/aec/data/expenses";
import { useAecApp } from "@/domains/aec/context/AecAppContext";

export interface ExpenseFormValues {
  date: string;
  category: ExpenseCategory;
  amount: string;
  project: string;
  description: string;
}

interface ExpenseFormProps {
  values: ExpenseFormValues;
  onChange: (values: ExpenseFormValues) => void;
}

export function ExpenseForm({ values, onChange }: ExpenseFormProps) {
  const { projectNames } = useAecApp();
  const set = (partial: Partial<ExpenseFormValues>) => onChange({ ...values, ...partial });

  return (
    <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="exp-date">Date</Label>
        <Input id="exp-date" type="date" value={values.date} onChange={(e) => set({ date: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={values.category} onValueChange={(v) => set({ category: v as ExpenseCategory })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {expenseCategories.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="exp-amount">Amount (£)</Label>
        <Input id="exp-amount" type="number" step="0.01" value={values.amount} onChange={(e) => set({ amount: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="exp-project">Project</Label>
        <Select value={values.project} onValueChange={(v) => set({ project: v })}>
          <SelectTrigger id="exp-project"><SelectValue placeholder="Select project" /></SelectTrigger>
          <SelectContent>
            {projectNames.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="exp-desc">Description</Label>
        <Textarea id="exp-desc" rows={3} value={values.description} onChange={(e) => set({ description: e.target.value })} placeholder="Brief description and business purpose…" />
      </div>
    </div>
  );
}

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
import type { ExpenseCategoryOption } from "@/domains/aec/data/expenses";

export interface ExpenseFormValues {
  date: string;
  category: string;
  categoryOther: string;
  amount: string;
  projectId: string;
  description: string;
  resourceId: string;
}

interface ExpenseFormProps {
  values: ExpenseFormValues;
  onChange: (values: ExpenseFormValues) => void;
  categories: ExpenseCategoryOption[];
  projects: { id: string; name: string }[];
  resources: { id: string; name: string }[];
}

export function ExpenseForm({
  values,
  onChange,
  categories,
  projects,
  resources,
}: ExpenseFormProps) {
  const set = (partial: Partial<ExpenseFormValues>) => onChange({ ...values, ...partial });

  return (
    <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
      <div className="space-y-2 sm:col-span-2">
        <Label>Resource</Label>
        <Select value={values.resourceId || undefined} onValueChange={(v) => set({ resourceId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select resource" />
          </SelectTrigger>
          <SelectContent>
            {resources.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="exp-date">Date</Label>
        <Input
          id="exp-date"
          type="date"
          value={values.date}
          onChange={(e) => set({ date: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={values.category || undefined} onValueChange={(v) => set({ category: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {values.category === "other" && (
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="exp-other">Other category</Label>
          <Input
            id="exp-other"
            value={values.categoryOther}
            onChange={(e) => set({ categoryOther: e.target.value })}
            placeholder="Describe category"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="exp-amount">Amount (£)</Label>
        <Input
          id="exp-amount"
          type="number"
          step="0.01"
          min={0}
          value={values.amount}
          onChange={(e) => set({ amount: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Project</Label>
        <Select
          value={values.projectId || undefined}
          onValueChange={(v) => set({ projectId: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="exp-desc">Notes</Label>
        <Textarea
          id="exp-desc"
          rows={3}
          value={values.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Brief description and business purpose…"
        />
      </div>
    </div>
  );
}

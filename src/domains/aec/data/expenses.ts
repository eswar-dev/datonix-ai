export interface ExpenseCategoryOption {
  value: string;
  label: string;
}

export interface ExpenseApprovalStep {
  step: number;
  label: string;
  active?: boolean;
}

export interface PendingExpense {
  id: string;
  resourceId?: string;
  employee: string;
  entity: string;
  category: string;
  categoryLabel?: string;
  amount: number;
  currency?: string;
  project: string;
  projectId?: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  notes?: string;
  approvalRoute?: ExpenseApprovalStep[];
}

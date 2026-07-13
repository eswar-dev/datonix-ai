export type ExpenseCategory = "Travel" | "Software" | "Materials" | "Subsistence" | "Other";

export interface ExpenseCategoryOption {
  value: ExpenseCategory;
  label: string;
}

export const expenseCategories: ExpenseCategoryOption[] = [
  { value: "Travel", label: "Travel" },
  { value: "Software", label: "Software & Licences" },
  { value: "Materials", label: "Materials" },
  { value: "Subsistence", label: "Subsistence" },
  { value: "Other", label: "Other" },
];

export const approvalRouteSteps = [
  { step: 1, role: "Employee", action: "Submit expense with receipt" },
  { step: 2, role: "Line Manager", action: "Review & approve (< £500)" },
  { step: 3, role: "Finance", action: "Validate against project budget" },
  { step: 4, role: "Entity CFO", action: "Approve (> £500 or cross-entity)" },
  { step: 5, role: "Accounts Payable", action: "Process reimbursement" },
];

export interface PendingExpense {
  id: string;
  employee: string;
  entity: string;
  category: ExpenseCategory;
  amount: number;
  project: string;
  date: string;
  status: "Pending" | "Approved";
}

export const pendingExpenses: PendingExpense[] = [
  { id: "exp-1", employee: "James Okafor", entity: "MA", category: "Travel", amount: 84.5, project: "Kings Cross Tower", date: "2026-03-14", status: "Pending" },
  { id: "exp-2", employee: "Priya Sharma", entity: "MA", category: "Software", amount: 249, project: "Kings Cross Tower", date: "2026-03-12", status: "Pending" },
];

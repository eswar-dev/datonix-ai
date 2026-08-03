export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Escalate";

export interface Invoice {
  id: string;
  /** Display number e.g. INV-MA-001 */
  number?: string;
  entity: string;
  entityId?: string;
  client: string;
  project: string;
  projectId?: string;
  amountGbp: number;
  amountDisplay?: string;
  daysOutstanding: number;
  status: InvoiceStatus;
  dueDate: string;
  chaseRequested?: boolean;
  escalated?: boolean;
}

export interface ApEntry {
  id: string;
  vendor: string;
  entity: string;
  amountGbp: number;
  amountDisplay?: string;
  status: "Paid" | "Pending" | "Due";
  dueDate: string;
}

export interface GlJournalEntry {
  id: string;
  date: string;
  account: string;
  description: string;
  debit: number | null;
  credit: number | null;
  source: string;
  entity: string;
}

export interface PayrollInput {
  id: string;
  name: string;
  entity: string;
  type: "UK PAYE" | "Contractor" | "UAE WPS";
  amountGbp: number;
  amountDisplay?: string;
  period: string;
  note?: string;
}

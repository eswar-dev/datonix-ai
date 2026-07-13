export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Escalate";

export interface Invoice {
  id: string;
  entity: string;
  client: string;
  project: string;
  amountGbp: number;
  daysOutstanding: number;
  status: InvoiceStatus;
  dueDate: string;
}

export interface ApEntry {
  id: string;
  vendor: string;
  entity: string;
  amountGbp: number;
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
  period: string;
  note?: string;
}

export const invoices: Invoice[] = [
  { id: "INV-MA-039", entity: "MA", client: "Holborn Partners", project: "Kings Cross Tower", amountGbp: 48_000, daysOutstanding: 65, status: "Escalate", dueDate: "2026-01-15" },
  { id: "INV-MA-041", entity: "MA", client: "Meridian Homes", project: "Camden Housing", amountGbp: 24_000, daysOutstanding: 12, status: "Pending", dueDate: "2026-04-01" },
  { id: "INV-ME-018", entity: "ME", client: "City Council", project: "Camden Housing Phase 2", amountGbp: 36_000, daysOutstanding: 0, status: "Paid", dueDate: "2026-03-01" },
  { id: "INV-MC-007", entity: "MC", client: "Dubai Dev. Authority", project: "Dubai Marina Dev.", amountGbp: 92_000, daysOutstanding: 28, status: "Pending", dueDate: "2026-03-20" },
  { id: "INV-MA-042", entity: "MA", client: "Northbridge Estates", project: "Kings Cross Tower Extension", amountGbp: 18_500, daysOutstanding: 5, status: "Pending", dueDate: "2026-04-10" },
];

export const apEntries: ApEntry[] = [
  { id: "AP-1021", vendor: "Klein & Partners", entity: "ME", amountGbp: 12_400, status: "Due", dueDate: "2026-03-25" },
  { id: "AP-1018", vendor: "BIM Solutions Ltd", entity: "MA", amountGbp: 4_200, status: "Pending", dueDate: "2026-04-02" },
  { id: "AP-1015", vendor: "UAE Site Services", entity: "MC", amountGbp: 28_600, status: "Paid", dueDate: "2026-03-01" },
];

export const glJournalEntries: GlJournalEntry[] = [
  { id: "GL-8841", date: "2026-03-14", account: "4100 · Project Revenue", description: "Kings Cross milestone billing", debit: null, credit: 48_000, source: "Invoice Auto", entity: "MA" },
  { id: "GL-8840", date: "2026-03-14", account: "5100 · Labour Cost", description: "Week 24 timesheet allocation", debit: 18_600, credit: null, source: "TS Auto", entity: "MA" },
  { id: "GL-8839", date: "2026-03-13", account: "5200 · Contractor Cost", description: "Marcus Klein — structural review", debit: 4_800, credit: null, source: "Rate Card Auto", entity: "ME" },
  { id: "GL-8838", date: "2026-03-12", account: "6100 · Overhead", description: "Software licences allocation", debit: 2_400, credit: null, source: "Manual", entity: "MA" },
  { id: "GL-8837", date: "2026-03-11", account: "2100 · WIP", description: "Camden Housing WIP accrual", debit: 8_200, credit: null, source: "Project Auto", entity: "MA" },
];

export const payrollInputs: PayrollInput[] = [
  { id: "pay-1", name: "Priya Sharma", entity: "MA", type: "UK PAYE", amountGbp: 6_200, period: "Mar 2026" },
  { id: "pay-2", name: "James Okafor", entity: "MA", type: "UK PAYE", amountGbp: 5_800, period: "Mar 2026" },
  { id: "pay-3", name: "Sarah Mitchell", entity: "MA", type: "UK PAYE", amountGbp: 8_400, period: "Mar 2026" },
  { id: "pay-4", name: "Marcus Klein", entity: "ME", type: "Contractor", amountGbp: 9_600, period: "Mar 2026", note: "Invoiced via AP" },
  { id: "pay-5", name: "Layla Patel", entity: "MA", type: "UK PAYE", amountGbp: 4_900, period: "Mar 2026" },
  { id: "pay-6", name: "Omar Hassan", entity: "MC", type: "UAE WPS", amountGbp: 12_200, period: "Mar 2026" },
];

export const taxRules: Record<string, string> = {
  MA: "UK VAT 20%",
  ME: "UK VAT 20%",
  MC: "UAE VAT 5%",
};

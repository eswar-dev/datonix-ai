import type { PendingExpense } from "@/domains/aec/data/expenses";
import type { TimesheetRow, TimesheetStatus, TimesheetSubmission } from "@/domains/aec/data/timesheets";

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

/** Monday of the week containing `date` as YYYY-MM-DD. */
export function mondayOf(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(`${date}T12:00:00`) : new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function weekDatesFromMonday(weekStart: string): string[] {
  const start = new Date(`${weekStart}T12:00:00`);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  });
}

export function formatWeekLabel(weekStart: string): string {
  const d = new Date(`${weekStart}T12:00:00`);
  if (Number.isNaN(d.getTime())) return weekStart;
  const week = getIsoWeek(d);
  return `Week ${week} · ${weekStart}`;
}

function getIsoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function mapTimesheetStatus(raw: unknown): TimesheetStatus {
  let s = "";
  if (typeof raw === "string" || typeof raw === "number") {
    s = String(raw).toLowerCase();
  } else {
    const o = asRecord(raw);
    s = String(o.statusCode ?? o.status ?? "").toLowerCase();
  }
  if (s.includes("approv")) return "Approved";
  if (s.includes("reject")) return "Rejected";
  if (s.includes("draft")) return "Draft";
  if (s.includes("submit") || s.includes("pending")) return "Pending";
  return "Draft";
}

export function mapTimesheetSubmission(raw: unknown): TimesheetSubmission {
  const o = asRecord(raw);
  const weekStart = String(o.weekStart ?? "");
  return {
    id: String(o.id ?? ""),
    resourceId: o.resourceId != null ? String(o.resourceId) : undefined,
    employee: String(o.employee ?? ""),
    entity: String(o.entity ?? "—"),
    week: formatWeekLabel(weekStart),
    weekStart,
    totalHours: Number(o.total ?? o.totalHours ?? 0) || 0,
    billableHours: Number(o.billable ?? o.billableHours ?? 0) || 0,
    projects: String(o.projects ?? ""),
    status: mapTimesheetStatus(o),
  };
}

export interface TimesheetSummaryView {
  pendingApproval: number;
  hoursLogged: number;
  billablePct: number;
  expensesPending: number;
  expensesPendingLabel: string;
  weekStart: string;
}

export function mapTimesheetSummary(raw: unknown): TimesheetSummaryView {
  const o = asRecord(raw);
  return {
    pendingApproval: Number(o.pendingApproval ?? 0) || 0,
    hoursLogged: Number(o.hoursLogged ?? 0) || 0,
    billablePct: Number(o.billablePct ?? 0) || 0,
    expensesPending: Number(o.expensesPending ?? 0) || 0,
    expensesPendingLabel: String(o.expensesPendingLabel ?? "£0"),
    weekStart: String(o.weekStart ?? ""),
  };
}

export interface TimesheetDetailView {
  id: string | null;
  resourceId: string;
  employee: string;
  weekStart: string;
  weekDates: string[];
  status: TimesheetStatus;
  rows: TimesheetRow[];
  totalHours: number;
  billableHours: number;
}

function hoursForDay(hours: Record<string, unknown>, date: string | undefined): number {
  if (!date) return 0;
  return Number(hours[date] ?? 0) || 0;
}

export function mapTimesheetDetail(raw: unknown): TimesheetDetailView {
  const o = asRecord(raw);
  const weekStart = String(o.weekStart ?? mondayOf());
  const weekDates = asArray(o.weekDates).map(String);
  const dates = weekDates.length ? weekDates : weekDatesFromMonday(weekStart);

  const rows: TimesheetRow[] = asArray(o.rows).map((row) => {
    const r = asRecord(row);
    const hours = asRecord(r.hours);
    return {
      projectId: String(r.projectId ?? ""),
      project: String(r.project ?? ""),
      task: String(r.task ?? ""),
      billable: r.billable !== false,
      mon: hoursForDay(hours, dates[0]),
      tue: hoursForDay(hours, dates[1]),
      wed: hoursForDay(hours, dates[2]),
      thu: hoursForDay(hours, dates[3]),
      fri: hoursForDay(hours, dates[4]),
    };
  });

  return {
    id: o.id != null && o.id !== "" ? String(o.id) : null,
    resourceId: String(o.resourceId ?? ""),
    employee: String(o.employee ?? ""),
    weekStart,
    weekDates: dates,
    status: mapTimesheetStatus(o),
    rows,
    totalHours: Number(o.totalHours ?? 0) || 0,
    billableHours: Number(o.billableHours ?? 0) || 0,
  };
}

export function gridRowsToSavePayload(
  rows: TimesheetRow[],
  weekDates: string[],
  opts: { resourceId: string; weekStart: string }
): Record<string, unknown> {
  const days = ["mon", "tue", "wed", "thu", "fri"] as const;
  const apiRows = rows
    .filter((r) => r.projectId)
    .map((r) => {
      const hours: Record<string, number> = {};
      days.forEach((day, i) => {
        const date = weekDates[i];
        if (!date) return;
        const val = r[day];
        if (val > 0) hours[date] = val;
      });
      return {
        projectId: r.projectId,
        task: r.task || "",
        billable: r.billable !== false,
        hours,
      };
    })
    .filter((r) => Object.keys(r.hours as object).length > 0);

  return {
    resourceId: opts.resourceId,
    weekStart: opts.weekStart,
    rows: apiRows,
  };
}

export interface ExpenseCategoryOption {
  value: string;
  label: string;
}

export function mapExpenseCategories(raw: unknown): ExpenseCategoryOption[] {
  return asArray(raw).map((item) => {
    const o = asRecord(item);
    return {
      value: String(o.value ?? ""),
      label: String(o.label ?? o.value ?? ""),
    };
  }).filter((c) => c.value);
}

export function mapExpenseStatus(raw: unknown): PendingExpense["status"] {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("approv")) return "Approved";
  if (s.includes("reject")) return "Rejected";
  return "Pending";
}

export function mapExpense(raw: unknown): PendingExpense {
  const o = asRecord(raw);
  const cat = String(o.category ?? "");
  return {
    id: String(o.id ?? ""),
    resourceId: o.resourceId != null ? String(o.resourceId) : undefined,
    employee: String(o.employee ?? ""),
    entity: String(o.entity ?? "—"),
    category: cat,
    categoryLabel: o.categoryOther != null && String(o.categoryOther) ? String(o.categoryOther) : undefined,
    amount: Number(o.amount ?? 0) || 0,
    currency: String(o.currency ?? "GBP"),
    project: String(o.project ?? "—"),
    projectId: o.projectId != null ? String(o.projectId) : undefined,
    date: String(o.expenseDate ?? o.date ?? ""),
    status: mapExpenseStatus(o.status),
    notes: o.notes != null ? String(o.notes) : undefined,
    approvalRoute: asArray(o.approvalRoute).map((step) => {
      const s = asRecord(step);
      return {
        step: Number(s.step ?? 0) || 0,
        label: String(s.label ?? s.role ?? s.action ?? ""),
        active: Boolean(s.active),
      };
    }),
  };
}

export function mapExpenseApprovalRoute(amount: number): { step: number; label: string; active: boolean }[] {
  const step2 =
    amount > 500
      ? "Finance Director approval (amount > £500)"
      : "Project Manager approval";
  return [
    { step: 1, label: "Employee submits expense", active: true },
    { step: 2, label: step2, active: false },
  ];
}

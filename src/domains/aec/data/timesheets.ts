export type TimesheetStatus = "Draft" | "Pending" | "Approved" | "Rejected";

export interface TimesheetSubmission {
  id: string;
  resourceId?: string;
  employee: string;
  entity: string;
  week: string;
  weekStart?: string;
  totalHours: number;
  billableHours: number;
  projects: string;
  status: TimesheetStatus;
}

export interface TimesheetRow {
  projectId: string;
  project: string;
  task: string;
  billable?: boolean;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
}

export function emptyTimesheetRow(): TimesheetRow {
  return {
    projectId: "",
    project: "",
    task: "",
    billable: true,
    mon: 0,
    tue: 0,
    wed: 0,
    thu: 0,
    fri: 0,
  };
}

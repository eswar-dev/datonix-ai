export type TimesheetStatus = "Pending" | "Approved" | "Rejected";

export interface TimesheetSubmission {
  id: string;
  employee: string;
  entity: string;
  week: string;
  totalHours: number;
  billableHours: number;
  projects: string;
  status: TimesheetStatus;
}

export const timesheetWeek = "Week 24";

export const timesheetSubmissions: TimesheetSubmission[] = [
  { id: "ts-1", employee: "Priya Sharma", entity: "MA", week: "Week 24", totalHours: 42, billableHours: 38, projects: "Kings Cross Tower", status: "Pending" },
  { id: "ts-2", employee: "James Okafor", entity: "MA", week: "Week 24", totalHours: 40, billableHours: 36, projects: "Kings Cross Tower", status: "Pending" },
  { id: "ts-3", employee: "Layla Patel", entity: "MA", week: "Week 24", totalHours: 38, billableHours: 32, projects: "Camden Housing", status: "Pending" },
  { id: "ts-4", employee: "Daniel Voss", entity: "MA", week: "Week 24", totalHours: 24, billableHours: 20, projects: "Kings Cross Tower", status: "Pending" },
  { id: "ts-5", employee: "Victoria Hayes", entity: "MA", week: "Week 24", totalHours: 40, billableHours: 28, projects: "Multiple", status: "Approved" },
  { id: "ts-6", employee: "Marcus Klein", entity: "ME", week: "Week 24", totalHours: 20, billableHours: 16, projects: "Kings Cross Tower", status: "Approved" },
];

export interface TimesheetRow {
  project: string;
  task: string;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
}

export const weeklyTimesheetTemplate: TimesheetRow[] = [
  { project: "Kings Cross Tower", task: "Planning drawings", mon: 6, tue: 7, wed: 8, thu: 6, fri: 5 },
  { project: "Kings Cross Tower", task: "Client meetings", mon: 0, tue: 1, wed: 0, thu: 2, fri: 0 },
  { project: "Camden Housing", task: "DD package", mon: 2, tue: 0, wed: 0, thu: 0, fri: 4 },
];

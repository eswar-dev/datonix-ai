export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface LeaveRequest {
  id: string;
  employee: string;
  entity: string;
  type: "Annual Leave" | "Sick Leave" | "Unpaid Leave" | "Resignation Notice";
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  impact: string;
}

export type LeaveStatus = "Draft" | "Pending" | "Approved" | "Rejected";
export type ResourceEmploymentType = "IN-HOUSE" | "CONTRACTOR" | "FREELANCER";
export type LeaveType =
  | "Annual Leave"
  | "Sick Leave"
  | "Unpaid Leave"
  | "Public Holiday"
  | "Bereavement Leave"
  | "Resignation Notice";

export interface LeaveSummary {
  onLeaveToday: number;
  pendingRequests: number;
  leaveDaysMonth: number;
  avgBalanceDays: number;
  monthLabel: string;
}

export interface LeaveRequest {
  id: string;
  employee: string;
  resourceId?: string;
  employmentType: ResourceEmploymentType;
  entity: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number | null;
  approver: string;
  status: LeaveStatus;
  impact: string;
}

export type DowntimeStatus = "On Bench" | "Partial" | "Inactive" | "Planned";

export interface DowntimeSummary {
  downtimeHours: number;
  downtimeCostGbp: number;
  benchResources: number;
  recoverablePct: number;
  monthLabel: string;
}

export interface DowntimeEntry {
  id: string;
  resource: string;
  employmentType: ResourceEmploymentType;
  entity: string;
  reason: string;
  hours: number | null;
  costImpactGbp: number;
  status: DowntimeStatus;
}

export const leaveSummary: LeaveSummary = {
  onLeaveToday: 3,
  pendingRequests: 2,
  leaveDaysMonth: 41,
  avgBalanceDays: 11.4,
  monthLabel: "Jun 2026",
};

export const leaveRequests: LeaveRequest[] = [
  {
    id: "lr-1",
    employee: "Marcus Klein",
    resourceId: "res-mk",
    employmentType: "CONTRACTOR",
    entity: "ME",
    type: "Annual Leave",
    startDate: "2026-06-24",
    endDate: "2026-06-28",
    days: 5,
    approver: "S. Mehta",
    status: "Pending",
    impact: "Overlaps Dubai Marina allocation — backfill required",
  },
  {
    id: "lr-2",
    employee: "Layla Patel",
    employmentType: "IN-HOUSE",
    entity: "MA",
    type: "Annual Leave",
    startDate: "2026-06-15",
    endDate: "2026-06-17",
    days: 3,
    approver: "J. Okafor",
    status: "Approved",
    impact: "Low — Camden Housing covered by backup",
  },
  {
    id: "lr-3",
    employee: "Aisha Ramos",
    employmentType: "IN-HOUSE",
    entity: "MA",
    type: "Sick Leave",
    startDate: "2026-06-11",
    endDate: "2026-06-12",
    days: 2,
    approver: "J. Okafor",
    status: "Approved",
    impact: "Low",
  },
  {
    id: "lr-4",
    employee: "Nadia Farouk",
    employmentType: "CONTRACTOR",
    entity: "MC",
    type: "Public Holiday",
    startDate: "2026-06-16",
    endDate: "2026-06-18",
    days: 3,
    approver: "M. Hassan",
    status: "Approved",
    impact: "UAE public holiday",
  },
  {
    id: "lr-5",
    employee: "James Okafor",
    employmentType: "IN-HOUSE",
    entity: "MA",
    type: "Annual Leave",
    startDate: "2026-07-06",
    endDate: "2026-07-10",
    days: 5,
    approver: "S. Mehta",
    status: "Pending",
    impact: "Medium — Kings Cross design review may shift",
  },
  {
    id: "lr-6",
    employee: "Sofia Almeida",
    employmentType: "IN-HOUSE",
    entity: "MA",
    type: "Bereavement Leave",
    startDate: "",
    endDate: "",
    days: null,
    approver: "J. Okafor",
    status: "Draft",
    impact: "—",
  },
  {
    id: "lr-7",
    employee: "Tom Reilly",
    employmentType: "CONTRACTOR",
    entity: "MA",
    type: "Unpaid Leave",
    startDate: "2026-06-02",
    endDate: "2026-06-06",
    days: 5,
    approver: "J. Okafor",
    status: "Rejected",
    impact: "Rejected — project critical window",
  },
];

export const downtimeSummary: DowntimeSummary = {
  downtimeHours: 318,
  downtimeCostGbp: 12400,
  benchResources: 4,
  recoverablePct: 62,
  monthLabel: "Jun 2026",
};

export const downtimeEntries: DowntimeEntry[] = [
  {
    id: "dt-1",
    resource: "Daniel Voss",
    employmentType: "FREELANCER",
    entity: "MA",
    reason: "Awaiting Kings Cross Phase 4 start",
    hours: 64,
    costImpactGbp: 4608,
    status: "On Bench",
  },
  {
    id: "dt-2",
    resource: "Marcus Klein",
    employmentType: "CONTRACTOR",
    entity: "ME",
    reason: "Drainage study approval delay",
    hours: 24,
    costImpactGbp: 1440,
    status: "Partial",
  },
  {
    id: "dt-3",
    resource: "Tom Reilly",
    employmentType: "CONTRACTOR",
    entity: "MA",
    reason: "Contract expired · not renewed",
    hours: null,
    costImpactGbp: 0,
    status: "Inactive",
  },
  {
    id: "dt-4",
    resource: "Aisha Ramos",
    employmentType: "IN-HOUSE",
    entity: "MA",
    reason: "Training — Revit Advanced",
    hours: 16,
    costImpactGbp: 720,
    status: "Planned",
  },
];

export const leaveAiInsight =
  "Marcus Klein's pending leave (24–28 Jun) overlaps his Dubai Marina allocation. Approving requires backfill or schedule shift.";

export const leaveTypes: LeaveType[] = [
  "Annual Leave",
  "Sick Leave",
  "Unpaid Leave",
  "Public Holiday",
  "Bereavement Leave",
];

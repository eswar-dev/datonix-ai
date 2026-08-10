import type { LeaveRequest, LeaveStatus, LeaveType, ResourceEmploymentType } from "@/domains/aec/data/leave";
import type { ReportItem, ReportTableRow } from "@/domains/aec/data/reports";
import type { AiAlert } from "@/domains/aec/data/dashboards";
import { mapResourceType } from "@/domains/aec/api/resourcesMappers";
import type { OrgMember } from "@/domains/aec/data/orgChart";

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function mapLeaveStatus(raw: unknown): LeaveStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("approv")) return "Approved";
  if (s.includes("reject")) return "Rejected";
  if (s.includes("draft")) return "Draft";
  return "Pending";
}

const LEAVE_TYPE_TO_API: Record<string, string> = {
  "Annual Leave": "annual",
  "Sick Leave": "sick",
  "Unpaid Leave": "unpaid",
  "Public Holiday": "public_holiday",
  "Bereavement Leave": "bereavement",
  "Resignation Notice": "resignation",
};

export function leaveTypeToApi(label: string): string {
  return LEAVE_TYPE_TO_API[label] ?? label.toLowerCase().replace(/\s+/g, "_");
}

export function mapLeaveRequest(raw: unknown): LeaveRequest {
  const o = asRecord(raw);
  const emp = asRecord(o.employee);
  const entity = asRecord(o.entity);
  const mgr = asRecord(o.reportingManager);
  const balance = asRecord(o.leaveBalance);
  const typeLabel = String(o.leaveTypeLabel ?? o.leaveType ?? "Annual Leave");
  const annualLeft = Number(balance.annualLeft ?? 0);
  return {
    id: String(o.id ?? ""),
    employee: String(emp.name ?? o.employee ?? ""),
    resourceId: emp.resourceId != null ? String(emp.resourceId) : undefined,
    employmentType: mapResourceType(emp.type ?? "IN-HOUSE") as ResourceEmploymentType,
    entity: String(entity.code ?? entity.name ?? ""),
    type: typeLabel as LeaveType,
    startDate: String(o.startDate ?? ""),
    endDate: String(o.endDate ?? ""),
    days: o.days != null ? Number(o.days) : null,
    approver: String(mgr.name ?? "—"),
    status: mapLeaveStatus(o.statusLabel ?? o.status),
    impact:
      annualLeft > 0
        ? `Balance ${annualLeft}d annual left`
        : String(o.notes ?? "").trim() || "—",
  };
}

export function mapLeaveList(raw: unknown): LeaveRequest[] {
  const o = asRecord(raw);
  const list = asArray(o.requests).length ? asArray(o.requests) : asArray(raw);
  return list.map(mapLeaveRequest);
}

export function mapLeaveSummaryFromList(rows: LeaveRequest[]): {
  onLeaveToday: number;
  pendingRequests: number;
  leaveDaysMonth: number;
  avgBalanceDays: number;
  monthLabel: string;
} {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monthLabel = now.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  const onLeaveToday = rows.filter(
    (r) =>
      r.status === "Approved" &&
      r.startDate <= today &&
      r.endDate >= today
  ).length;
  const pendingRequests = rows.filter((r) => r.status === "Pending").length;
  const monthPrefix = today.slice(0, 7);
  const leaveDaysMonth = rows
    .filter((r) => r.status !== "Rejected" && r.startDate.startsWith(monthPrefix))
    .reduce((s, r) => s + (r.days ?? 0), 0);
  return {
    onLeaveToday,
    pendingRequests,
    leaveDaysMonth,
    avgBalanceDays: 0,
    monthLabel,
  };
}

export interface MyDashboardView {
  utilizationPct: number;
  leaveBalanceDays: number;
  myProjects: { name: string; role: string; progress: number; health: "Good" | "At Risk" }[];
  pendingApprovals: { type: string; label: string; count: number }[];
  agentNotifications: { agent: string; message: string; time: string }[];
  teamUtilization: { name: string; utilization: number; entity: string }[];
  pendingApprovalItems: {
    id: string;
    type: string;
    employee: string;
    description: string;
    status: string;
  }[];
}

export function mapMyDashboard(raw: unknown): MyDashboardView {
  const o = asRecord(raw);
  const summary = asRecord(o.summary);
  const leave = asRecord(o.leave);
  const pending = asArray(o.pendingApprovals);
  const byType = new Map<string, number>();
  for (const item of pending) {
    const p = asRecord(item);
    const t = String(p.type ?? "").toLowerCase();
    const key = t.includes("time") ? "TS" : t.includes("exp") ? "EXP" : t.includes("leave") ? "Leave" : "Other";
    byType.set(key, (byType.get(key) ?? 0) + 1);
  }
  const pendingApprovals = [
    { type: "TS", label: "Timesheets pending", count: byType.get("TS") ?? 0 },
    { type: "EXP", label: "Expenses pending", count: byType.get("EXP") ?? 0 },
    { type: "Leave", label: "Leave requests", count: byType.get("Leave") ?? Number(leave.pendingRequests ?? 0) },
  ];

  return {
    utilizationPct: Number(summary.myUtilisationPct ?? summary.myUtilizationPct ?? 0) || 0,
    leaveBalanceDays: Number(summary.leaveBalanceDays ?? leave.annualLeft ?? 0) || 0,
    myProjects: asArray(o.projects).map((row) => {
      const p = asRecord(row);
      const healthRaw = String(p.health ?? p.healthCode ?? "Good");
      const health: "Good" | "At Risk" = /risk|critical|amber|red/i.test(healthRaw)
        ? "At Risk"
        : "Good";
      return {
        name: String(p.name ?? ""),
        role: String(p.role ?? "Team member"),
        progress: Number(p.progressPct ?? 0) || 0,
        health,
      };
    }),
    pendingApprovals,
    agentNotifications: asArray(o.agentNotifications).map((row) => {
      const a = asRecord(row);
      return {
        agent: String(a.agent ?? "Agent"),
        message: String(a.message ?? ""),
        time: "Recently",
      };
    }),
    teamUtilization: [],
    pendingApprovalItems: pending.map((row) => {
      const p = asRecord(row);
      return {
        id: String(p.id ?? ""),
        type: String(p.type ?? ""),
        employee: String(p.employee ?? ""),
        description: String(p.description ?? p.detail ?? ""),
        status: String(p.status ?? ""),
      };
    }),
  };
}

export interface ExecutiveDashboardView {
  groupRevenueGbp: number;
  groupMarginPct: number;
  projectsAtRisk: number;
  activeProjects: number;
  staffCount: number;
  avgUtilization: number;
  arDaysOutstanding: number;
  cashRunwayDays: number;
  revenueChangePct: number;
  costComposition: { employee: number; contractor: number; freelancer: number; other: number };
  revenueByEntity: { entity: string; revenueGbp: number; marginPct: number }[];
  utilizationTrend: { month: string; value: number }[];
  alerts: AiAlert[];
  reportingCurrency: string;
}

function mapAlertSeverity(raw: unknown): AiAlert["severity"] {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("high") || s === "critical") return "High";
  if (s.includes("low")) return "Low";
  return "Medium";
}

export function mapExecutiveDashboard(raw: unknown): ExecutiveDashboardView {
  const o = asRecord(raw);
  const kpis = asRecord(o.kpis);
  const costs = asRecord(o.costComposition);
  return {
    groupRevenueGbp: Number(kpis.groupRevenueYtd ?? 0) || 0,
    groupMarginPct: Number(kpis.grossMarginPct ?? 0) || 0,
    projectsAtRisk: Number(kpis.projectsAtRisk ?? 0) || 0,
    activeProjects: 0,
    staffCount: 0,
    avgUtilization: Number(kpis.avgUtilisationPct ?? kpis.avgUtilizationPct ?? 0) || 0,
    arDaysOutstanding: 0,
    cashRunwayDays: 0,
    revenueChangePct: Number(kpis.revenueChangePct ?? 0) || 0,
    costComposition: {
      employee: Number(costs.employee ?? 0) || 0,
      contractor: Number(costs.contractor ?? 0) || 0,
      freelancer: Number(costs.freelancer ?? 0) || 0,
      other: 0,
    },
    revenueByEntity: asArray(o.revenueByEntity).map((row) => {
      const r = asRecord(row);
      return {
        entity: String(r.entityCode ?? r.entity ?? ""),
        revenueGbp: Number(r.revenue ?? 0) || 0,
        marginPct: 0,
      };
    }),
    utilizationTrend: asArray(o.utilisationTrend ?? o.utilizationTrend).map((row) => {
      const r = asRecord(row);
      return {
        month: String(r.label ?? r.period ?? ""),
        value: Number(r.utilisationPct ?? r.utilizationPct ?? 0) || 0,
      };
    }),
    alerts: asArray(o.alerts).map((row) => {
      const a = asRecord(row);
      return {
        id: String(a.id ?? ""),
        severity: mapAlertSeverity(a.severity),
        title: String(a.info ?? a.category ?? "Alert"),
        message: String(a.info ?? ""),
        agent: String(a.source ?? a.category ?? "System"),
        time: "",
      };
    }),
    reportingCurrency: String(o.reportingCurrency ?? "GBP"),
  };
}

function reportIcon(id: string): ReportItem["icon"] {
  if (/profit|pnl|consolidat/i.test(id)) return "chart";
  if (/resource|cost/i.test(id)) return "people";
  if (/ar|aging/i.test(id)) return "clock";
  if (/rate/i.test(id)) return "money";
  if (/agent/i.test(id)) return "agent";
  if (/fx|currency/i.test(id)) return "globe";
  return "chart";
}

export function mapReportsLibrary(raw: unknown): ReportItem[] {
  const o = asRecord(raw);
  return asArray(o.reports).map((row) => {
    const r = asRecord(row);
    const id = String(r.href ?? r.id ?? r.code ?? "");
    return {
      id,
      name: String(r.title ?? r.name ?? id),
      category: String(r.badge ?? r.frequency ?? "Report"),
      description: String(r.description ?? ""),
      icon: reportIcon(id),
      lastRun: String(r.frequency ?? "On demand"),
    };
  });
}

export function mapReportRows(reportId: string, raw: unknown): ReportTableRow[] {
  const o = asRecord(raw);
  if (/project-profitability/i.test(reportId)) {
    return asArray(o.projects).map((row, i) => {
      const p = asRecord(row);
      const margin = Number(p.marginPct ?? 0) || 0;
      return {
        id: String(p.id ?? i),
        entity: String(p.currency ?? ""),
        project: String(p.name ?? ""),
        metric: "Gross Margin",
        value: `${margin}%`,
        status: margin < 20 ? "Critical" : margin < 28 ? "At Risk" : "Good",
      };
    });
  }
  if (/resource-cost/i.test(reportId)) {
    return asArray(o.breakdownByDepartment).map((row, i) => {
      const r = asRecord(row);
      return {
        id: String(i),
        entity: String(r.department ?? ""),
        project: "—",
        metric: "Total cost",
        value: String(r.totalDisplay ?? r.total ?? "—"),
        status: "Good",
      };
    });
  }
  if (/consolidated-pnl/i.test(reportId)) {
    return asArray(o.byEntity).map((row, i) => {
      const r = asRecord(row);
      const margin = Number(r.marginPct ?? 0) || 0;
      return {
        id: String(i),
        entity: String(r.entity ?? ""),
        project: "Group",
        metric: "Gross Profit",
        value: String(r.grossProfitDisplay ?? r.grossProfit ?? "—"),
        status: margin < 20 ? "Critical" : margin < 28 ? "At Risk" : "Good",
      };
    });
  }
  if (/ar-aging/i.test(reportId)) {
    const buckets = asRecord(o.buckets);
    const rows: ReportTableRow[] = [];
    for (const [bucket, list] of Object.entries(buckets)) {
      for (const item of asArray(list)) {
        const inv = asRecord(item);
        const days = Number(inv.agingDays ?? 0) || 0;
        rows.push({
          id: String(inv.id ?? `${bucket}-${rows.length}`),
          entity: String(inv.entityCode ?? ""),
          project: String(inv.client ?? ""),
          metric: `${inv.number ?? ""} · ${bucket}`,
          value: String(inv.amountDisplay ?? inv.amount ?? "—"),
          status: days >= 61 ? "Critical" : days >= 31 ? "At Risk" : "Good",
        });
      }
    }
    return rows;
  }
  if (/rate-card-audit/i.test(reportId)) {
    return asArray(o.rateCards).map((row, i) => {
      const r = asRecord(row);
      return {
        id: String(r.id ?? i),
        entity: String(r.entityCode ?? ""),
        project: String(r.resource ?? ""),
        metric: String(r.status ?? ""),
        value: `${r.hourlyCost ?? "—"} / ${r.hourlyBill ?? "—"}`,
        status: /pending/i.test(String(r.status ?? "")) ? "At Risk" : "Good",
      };
    });
  }
  if (/agent-audit/i.test(reportId)) {
    return asArray(o.decisions).map((row, i) => {
      const r = asRecord(row);
      return {
        id: String(r.id ?? i),
        entity: String(r.entityType ?? ""),
        project: String(r.entityId ?? ""),
        metric: String(r.action ?? ""),
        value: String(r.timestamp ?? ""),
        status: "Good",
      };
    });
  }
  return [];
}

export function mapOrgChartForest(raw: unknown): OrgMember[] {
  return asArray(raw).map(mapOrgNode);
}

function mapOrgNode(raw: unknown, parentId?: string): OrgMember {
  const o = asRecord(raw);
  const id = String(o.id ?? "");
  const name = String(o.name ?? "");
  const initials =
    String(o.initials ?? "").trim() ||
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") ||
    "?";
  return {
    id,
    initials,
    name,
    type: mapResourceType(o.type),
    title: String(o.title ?? ""),
    entity: String(o.entity ?? ""),
    reportsTo: parentId,
    email: o.email != null ? String(o.email) : undefined,
    costRate: String(o.costRate ?? "—"),
    billRate: String(o.billRate ?? "—"),
    utilization: Number(o.utilization ?? 0) || 0,
    allocation: String(o.allocation ?? ""),
    projects: asArray(o.projects).map(String),
    children: asArray(o.children).map((c) => mapOrgNode(c, id)),
  };
}

export function wrapOrgForest(roots: OrgMember[]): OrgMember | null {
  if (!roots.length) return null;
  if (roots.length === 1) return roots[0];
  return {
    id: "__org_root__",
    initials: "ORG",
    name: "Organization",
    type: "IN-HOUSE",
    title: "All reporting lines",
    entity: "",
    costRate: "—",
    billRate: "—",
    utilization: 0,
    allocation: "",
    projects: [],
    children: roots,
  };
}

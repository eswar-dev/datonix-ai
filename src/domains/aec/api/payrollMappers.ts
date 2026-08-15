import type {
  PayrollByDepartmentRow,
  PayrollByEntityRow,
  PayrollByProjectRow,
  PayrollCostBreakdown,
  PayrollDashboardSummary,
  PayrollKpis,
  PayrollResourceCostRow,
  PayrollTrendPoint,
} from "@/domains/aec/data/payrollAnalytics";

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function mapEmploymentType(raw: unknown): PayrollResourceCostRow["employmentType"] {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("contract")) return "CONTRACTOR";
  if (s.includes("free")) return "FREELANCER";
  return "IN-HOUSE";
}

export function mapPayrollSummary(raw: unknown): PayrollDashboardSummary {
  const o = asRecord(raw);
  return {
    periodLabel: String(o.periodLabel ?? o.period ?? ""),
    totalPayrollGbp: Number(o.totalPayroll ?? 0) || 0,
    totalPayrollDisplay: String(o.totalPayrollDisplay ?? "£0"),
    vsPriorPct: Number(o.vsPriorPct ?? 0) || 0,
    payrollPctOfRevenue: Number(o.payrollPctOfRevenue ?? 0) || 0,
    targetPctOfRevenue: Number(o.targetPctOfRevenue ?? 45) || 45,
    avgCostPerResourceGbp: Number(o.avgCostPerResource ?? 0) || 0,
    resourceCount: Number(o.resourceCount ?? 0) || 0,
    anomalyCount: Number(o.anomalyCount ?? 0) || 0,
  };
}

export function mapPayrollBreakdown(raw: unknown): PayrollCostBreakdown {
  const o = asRecord(raw);
  const b = asRecord(o.breakdown ?? o);
  const salaries = Number(b.salaries ?? 0) || 0;
  const oncost = Number(b.oncost ?? 0) || 0;
  const contractor = Number(b.contractor ?? 0) || 0;
  const freelancer = Number(b.freelancer ?? 0) || 0;
  const total = Number(b.total ?? salaries + oncost + contractor + freelancer) || 0;
  return { salariesGbp: salaries, oncostGbp: oncost, contractorGbp: contractor, freelancerGbp: freelancer, totalGbp: total };
}

export function mapPayrollKpis(raw: unknown): PayrollKpis {
  const o = asRecord(raw);
  const k = asRecord(o.kpis ?? o);
  return {
    payrollRevenueRatioPct: Number(k.payrollRevenueRatioPct ?? 0) || 0,
    recoveryRatePct: Number(k.recoveryRatePct ?? 0) || 0,
    costPerBillableHourGbp: Number(k.costPerBillableHour ?? 0) || 0,
    overtimePct: Number(k.overtimePct ?? 0) || 0,
    forecastNextGbp: Number(k.forecastNext ?? 0) || 0,
  };
}

export function mapPayrollTrend(raw: unknown): PayrollTrendPoint[] {
  const o = asRecord(raw);
  return asArray(o.trend).map((item) => {
    const t = asRecord(item);
    const label = String(t.label ?? t.month ?? "");
    return {
      month: label.length <= 3 ? label : label.slice(0, 3),
      amountGbp: Number(t.amount ?? 0) || 0,
    };
  });
}

export function mapPayrollByEntity(raw: unknown): PayrollByEntityRow[] {
  return asArray(raw).map((item) => {
    const o = asRecord(item);
    return {
      entity: String(o.entity ?? ""),
      entityCode: String(o.entityCode ?? "—"),
      amountGbp: Number(o.amount ?? 0) || 0,
      pctOfTotal: Number(o.pctOfTotal ?? 0) || 0,
    };
  });
}

export function mapPayrollByDepartment(raw: unknown): PayrollByDepartmentRow[] {
  return asArray(raw).map((item) => {
    const o = asRecord(item);
    const trend = o.trendPct;
    return {
      department: String(o.department ?? ""),
      headcount: Number(o.headcount ?? 0) || 0,
      amountGbp: Number(o.amount ?? 0) || 0,
      pctOfTotal: Number(o.pctOfTotal ?? 0) || 0,
      trendPct: trend == null ? null : Number(trend) || 0,
    };
  });
}

export function mapPayrollByProject(raw: unknown): PayrollByProjectRow[] {
  return asArray(raw).map((item) => {
    const o = asRecord(item);
    return {
      project: String(o.project ?? ""),
      entity: String(o.entityCode ?? o.entity ?? "—"),
      amountDisplay: String(o.amountDisplay ?? "—"),
      amountGbp: Number(o.amount ?? 0) || 0,
      pctOfProjectCost: Number(o.pctOfProjectCost ?? 0) || 0,
    };
  });
}

export interface PayrollResourcesView {
  summary: {
    employeeCostGbp: number;
    contractorCostGbp: number;
    freelancerCostGbp: number;
    highestCostSkill: string;
    highestCostSkillAmountDisplay: string;
  };
  rows: PayrollResourceCostRow[];
}

export function mapPayrollResources(raw: unknown): PayrollResourcesView {
  const o = asRecord(raw);
  const s = asRecord(o.summary);
  const rows = asArray(o.rows).map((item) => {
    const r = asRecord(item);
    return {
      resourceId: String(r.employeeId ?? r.resourceId ?? ""),
      name: String(r.name ?? ""),
      employmentType: mapEmploymentType(r.employmentType),
      entity: String(r.entityCode ?? "—"),
      location: String(r.location ?? "—"),
      skill: String(r.skill ?? "—"),
      monthlyCostDisplay: String(r.monthlyCostDisplay ?? "—"),
      monthlyCostGbp: Number(r.monthlyCost ?? 0) || 0,
      costPerHourDisplay: String(r.costPerHourDisplay ?? "—"),
      projects: Number(r.projects ?? 0) || 0,
    };
  });
  return {
    summary: {
      employeeCostGbp: Number(s.employeeCost ?? 0) || 0,
      contractorCostGbp: Number(s.contractorCost ?? 0) || 0,
      freelancerCostGbp: Number(s.freelancerCost ?? 0) || 0,
      highestCostSkill: String(s.highestCostSkill ?? "—"),
      highestCostSkillAmountDisplay: String(s.highestCostSkillAmountDisplay ?? "—"),
    },
    rows,
  };
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { MetricStrip } from "@/domains/aec/components/MetricStrip";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { currentPayrollPeriod } from "@/domains/aec/api/accountingMappers";
import {
  mapPayrollBreakdown,
  mapPayrollByDepartment,
  mapPayrollByEntity,
  mapPayrollByProject,
  mapPayrollKpis,
  mapPayrollResources,
  mapPayrollSummary,
  mapPayrollTrend,
} from "@/domains/aec/api/payrollMappers";
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
import {
  aecPayrollAnalyticsSummary,
  aecPayrollByDepartment,
  aecPayrollByEntity,
  aecPayrollByProject,
  aecPayrollResources,
} from "@/common/api/aecPayroll";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import { cn } from "@/common/lib/utils";

function typeBadge(type: string) {
  if (type === "CONTRACTOR") return "border-amber-500/30 bg-amber-500/10 text-amber-800";
  if (type === "FREELANCER") return "border-violet-500/30 bg-violet-500/10 text-violet-800";
  return "border-sky-500/30 bg-sky-500/10 text-sky-800";
}

function formatK(n: number): string {
  if (n >= 1000) return `£${(n / 1000).toFixed(0)}K`;
  return `£${n.toLocaleString()}`;
}

export default function PayrollAnalytics() {
  const { activeTwinId, activeTwin } = useAecApp();
  const [period, setPeriod] = useState(currentPayrollPeriod());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PayrollDashboardSummary | null>(null);
  const [breakdown, setBreakdown] = useState<PayrollCostBreakdown | null>(null);
  const [kpis, setKpis] = useState<PayrollKpis | null>(null);
  const [trend, setTrend] = useState<PayrollTrendPoint[]>([]);
  const [byEntity, setByEntity] = useState<PayrollByEntityRow[]>([]);
  const [byDepartment, setByDepartment] = useState<PayrollByDepartmentRow[]>([]);
  const [byProject, setByProject] = useState<PayrollByProjectRow[]>([]);
  const [resourceRows, setResourceRows] = useState<PayrollResourceCostRow[]>([]);
  const [resourceSummary, setResourceSummary] = useState({
    employeeCostGbp: 0,
    contractorCostGbp: 0,
    freelancerCostGbp: 0,
    highestCostSkill: "—",
    highestCostSkillAmountDisplay: "—",
  });
  const [entityFilter, setEntityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const load = useCallback(async () => {
    if (!activeTwinId || !isApiTwinId(activeTwinId)) {
      setError("Select a published API twin to load payroll analytics.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [summaryRaw, entityRaw, deptRaw, projectRaw, resourcesRaw] = await Promise.all([
        aecPayrollAnalyticsSummary(activeTwinId, period),
        aecPayrollByEntity(activeTwinId, period),
        aecPayrollByDepartment(activeTwinId, period),
        aecPayrollByProject(activeTwinId, period),
        aecPayrollResources(activeTwinId, period),
      ]);
      setSummary(mapPayrollSummary(summaryRaw));
      setBreakdown(mapPayrollBreakdown(summaryRaw));
      setKpis(mapPayrollKpis(summaryRaw));
      setTrend(mapPayrollTrend(summaryRaw));
      setByEntity(mapPayrollByEntity(entityRaw));
      setByDepartment(mapPayrollByDepartment(deptRaw));
      setByProject(mapPayrollByProject(projectRaw));
      const resources = mapPayrollResources(resourcesRaw);
      setResourceRows(resources.rows);
      setResourceSummary(resources.summary);
    } catch (e) {
      setSummary(null);
      setError(
        e instanceof Error
          ? e.message.includes("Processed payroll")
            ? `No processed payroll for ${period}. Process payroll on Accounting first.`
            : e.message
          : "Failed to load payroll analytics"
      );
    } finally {
      setLoading(false);
    }
  }, [activeTwinId, period]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredResources = useMemo(() => {
    return resourceRows.filter((r) => {
      if (entityFilter !== "all" && r.entity !== entityFilter) return false;
      if (typeFilter !== "all" && r.employmentType !== typeFilter) return false;
      return true;
    });
  }, [resourceRows, entityFilter, typeFilter]);

  const entityCodes = useMemo(
    () => [...new Set([...byEntity.map((e) => e.entityCode), ...resourceRows.map((r) => r.entity)])],
    [byEntity, resourceRows]
  );

  const s = summary;
  const b = breakdown;
  const k = kpis;
  const maxTrend = trend.length ? Math.max(...trend.map((t) => t.amountGbp)) : 1;
  const salaryPct = b && b.totalGbp ? Math.round((b.salariesGbp / b.totalGbp) * 100) : 0;
  const oncostPct = b && b.totalGbp ? Math.round((b.oncostGbp / b.totalGbp) * 100) : 0;
  const conPct = b && b.totalGbp ? Math.round((b.contractorGbp / b.totalGbp) * 100) : 0;
  const frePct = b && b.totalGbp ? Math.round((b.freelancerGbp / b.totalGbp) * 100) : 0;

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Payroll Analytics"
        subtitle="Live analytics from processed payroll runs · process payroll on Accounting first"
        breadcrumb={[
          { label: "Accounting", href: "/accounting" },
          { label: "Payroll Analytics" },
        ]}
        actions={
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Period</Label>
              <Input
                type="month"
                className="h-9 w-[140px]"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
            <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
              Refresh
            </Button>
          </div>
        }
      />

      {loading && <PipelineLoadingBanner label="Loading payroll analytics…" />}
      <PipelineErrorBanner message={error ?? ""} />

      {!loading && !s && !error ? (
        <PipelineEmptyState>No payroll analytics for {activeTwin.name} yet.</PipelineEmptyState>
      ) : null}

      {!loading && error && !s ? (
        <Card className="rounded-card">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            <p>{error}</p>
            <Button className="mt-4" size="sm" asChild>
              <Link to="/accounting">Open Accounting → Payroll Inputs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {s && b && k ? (
        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Payroll Dashboard</TabsTrigger>
            <TabsTrigger value="resource-cost">Resource Cost Analytics</TabsTrigger>
            <TabsTrigger value="by-entity">Payroll by Entity</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4 space-y-4">
            <MetricStrip
              metrics={[
                {
                  label: `Total payroll (${s.periodLabel})`,
                  value: s.totalPayrollDisplay,
                  change: s.vsPriorPct ? `↑ ${s.vsPriorPct}% vs prior` : "Processed run",
                  trend: s.vsPriorPct > 0 ? "up" : undefined,
                },
                {
                  label: "Payroll % of revenue",
                  value: s.payrollPctOfRevenue ? `${s.payrollPctOfRevenue}%` : "—",
                  change: `Target < ${s.targetPctOfRevenue}%`,
                },
                {
                  label: "Avg cost / resource",
                  value: `£${s.avgCostPerResourceGbp.toLocaleString()}`,
                  change: `${s.resourceCount} resources`,
                },
                {
                  label: "Payroll anomalies",
                  value: String(s.anomalyCount),
                  change: s.anomalyCount ? "Flagged" : "None",
                },
              ]}
            />

            <Card className="rounded-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Payroll Cost Breakdown — {s.periodLabel}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex h-8 w-full overflow-hidden rounded-md">
                  {salaryPct > 0 && (
                    <div
                      className="bg-sky-500/80 text-[10px] font-medium text-white flex items-center justify-center"
                      style={{ width: `${salaryPct}%` }}
                    >
                      {salaryPct > 12 ? `£${(b.salariesGbp / 1000).toFixed(0)}K Salaries` : ""}
                    </div>
                  )}
                  {oncostPct > 0 && (
                    <div
                      className="bg-teal-500/80 text-[10px] font-medium text-white flex items-center justify-center"
                      style={{ width: `${oncostPct}%` }}
                    >
                      {oncostPct > 8 ? "Oncost" : ""}
                    </div>
                  )}
                  {conPct > 0 && (
                    <div
                      className="bg-amber-500/80 text-[10px] font-medium text-white flex items-center justify-center"
                      style={{ width: `${conPct}%` }}
                    >
                      {conPct > 8 ? "Contractor" : ""}
                    </div>
                  )}
                  {frePct > 0 && (
                    <div
                      className="bg-violet-500/80 text-[10px] font-medium text-white flex items-center justify-center"
                      style={{ width: `${frePct}%` }}
                    >
                      {frePct > 6 ? "Fre." : ""}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>Base salaries: {formatK(b.salariesGbp)}</span>
                  <span>Employer oncost: {formatK(b.oncostGbp)}</span>
                  <span>Contractor invoices: {formatK(b.contractorGbp)}</span>
                  <span>Freelancer fees: {formatK(b.freelancerGbp)}</span>
                  <span className="font-semibold text-foreground">Total {formatK(b.totalGbp)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="rounded-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Payroll by Entity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {byEntity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No entity breakdown.</p>
                  ) : (
                    byEntity.map((e) => (
                      <div key={e.entityCode}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>{e.entity}</span>
                          <span className="font-semibold tabular-nums">{formatK(e.amountGbp)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full bg-accent"
                            style={{ width: `${e.pctOfTotal}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Payroll Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold tabular-nums">{s.totalPayrollDisplay}</p>
                  {trend.length === 0 ? (
                    <p className="mt-3 text-xs text-muted-foreground">Trend data not available yet.</p>
                  ) : (
                    <div className="mt-3 flex h-20 items-end gap-1.5">
                      {trend.map((t) => (
                        <div key={t.month} className="flex flex-1 flex-col items-center gap-1">
                          <div
                            className="w-full rounded-sm bg-sky-500/70"
                            style={{ height: `${Math.round((t.amountGbp / maxTrend) * 100)}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">{t.month}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Payroll KPIs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payroll / Revenue</span>
                    <span className="font-semibold">
                      {k.payrollRevenueRatioPct ? `${k.payrollRevenueRatioPct}%` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recovery rate</span>
                    <span className="font-semibold">
                      {k.recoveryRatePct ? `${k.recoveryRatePct}%` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost / billable hour</span>
                    <span className="font-semibold">
                      {k.costPerBillableHourGbp
                        ? `£${k.costPerBillableHourGbp.toFixed(2)}`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overtime % of payroll</span>
                    <span className="font-semibold">
                      {k.overtimePct ? `${k.overtimePct}%` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Forecast (next)</span>
                    <span className="font-semibold">{formatK(k.forecastNextGbp)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="rounded-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Payroll by Department</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Headcount</TableHead>
                        <TableHead className="text-right">Payroll</TableHead>
                        <TableHead className="text-right">% Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {byDepartment.map((d) => (
                        <TableRow key={d.department}>
                          <TableCell className="font-medium">{d.department}</TableCell>
                          <TableCell className="text-right">{d.headcount}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatK(d.amountGbp)}</TableCell>
                          <TableCell className="text-right">{d.pctOfTotal}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="rounded-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Payroll by Project</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead className="text-right">Allocated</TableHead>
                        <TableHead className="text-right">% Project cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {byProject.map((p) => (
                        <TableRow key={p.project}>
                          <TableCell className="font-medium">{p.project}</TableCell>
                          <TableCell>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">
                              {p.entity}
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{p.amountDisplay}</TableCell>
                          <TableCell className="text-right">{p.pctOfProjectCost}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resource-cost" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-3">
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All entities</SelectItem>
                  {entityCodes.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="IN-HOUSE">In-House</SelectItem>
                  <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                  <SelectItem value="FREELANCER">Freelancer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <MetricStrip
              metrics={[
                { label: "Employee cost (mo.)", value: formatK(resourceSummary.employeeCostGbp) },
                { label: "Contractor cost (mo.)", value: formatK(resourceSummary.contractorCostGbp) },
                { label: "Freelancer cost (mo.)", value: formatK(resourceSummary.freelancerCostGbp) },
                {
                  label: "Highest cost skill",
                  value: resourceSummary.highestCostSkill,
                  change: resourceSummary.highestCostSkillAmountDisplay,
                },
              ]}
            />

            <Card className="rounded-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cost per Resource</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Skill</TableHead>
                      <TableHead className="text-right">Monthly cost</TableHead>
                      <TableHead className="text-right">Cost / hr</TableHead>
                      <TableHead className="text-right">Projects</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResources.map((r) => (
                      <TableRow key={r.resourceId + r.name}>
                        <TableCell>
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-muted-foreground">{r.resourceId}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${typeBadge(r.employmentType)}`}>
                            {r.employmentType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{r.entity}</span>
                        </TableCell>
                        <TableCell>{r.skill}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.monthlyCostDisplay}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.costPerHourDisplay}</TableCell>
                        <TableCell className="text-right">{r.projects}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-entity" className="mt-4 space-y-4">
            <MetricStrip
              metrics={byEntity.map((e) => ({
                label: e.entityCode,
                value: formatK(e.amountGbp),
                change: `${e.pctOfTotal}% of total`,
              }))}
            />
            <Card className="rounded-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Entity payroll detail</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">% of total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byEntity.map((e) => (
                      <TableRow key={e.entityCode}>
                        <TableCell className="font-medium">{e.entity}</TableCell>
                        <TableCell>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">
                            {e.entityCode}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatK(e.amountGbp)}</TableCell>
                        <TableCell className="text-right">{e.pctOfTotal}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}

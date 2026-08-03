import { useEffect, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Label } from "@/common/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { CostCompositionChart } from "@/domains/aec/components/CostCompositionChart";
import { ProfitabilityStatement } from "@/domains/aec/components/ProfitabilityStatement";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
  PipelineProjectCard,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import type { ProfitabilityView } from "@/domains/aec/api/pipelineMappers";
import type { BillingType, ProjectEntity, ProjectHealth } from "@/domains/aec/data/projects";

const healthBadge: Record<ProjectHealth, string> = {
  Good: "Active",
  "At Risk": "At Risk",
  Critical: "At Risk",
};

export default function ProjectProfitability() {
  const {
    projects,
    activeTwin,
    activeProjectId,
    loadProjectProfitability,
    pipelineLoading,
    refreshPipeline,
  } = useAecApp();
  const [selectedId, setSelectedId] = useState(activeProjectId ?? projects[0]?.id ?? "");
  const [entityFilter, setEntityFilter] = useState<ProjectEntity | "all">("all");
  const [billingFilter, setBillingFilter] = useState<BillingType | "all">("all");
  const [healthFilter, setHealthFilter] = useState<ProjectHealth | "all">("all");
  const [apiView, setApiView] = useState<ProfitabilityView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refreshPipeline();
  }, [refreshPipeline]);

  useEffect(() => {
    if (!selectedId && projects[0]?.id) setSelectedId(projects[0].id);
  }, [projects, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    void loadProjectProfitability(selectedId)
      .then((view) => {
        setApiView(view);
        if (!view) setError("No profitability data returned for this project.");
      })
      .catch((e) => {
        setApiView(null);
        setError(e instanceof Error ? e.message : "Failed to load profitability");
      })
      .finally(() => setLoading(false));
  }, [selectedId, loadProjectProfitability]);

  const entityOptions = useMemo(() => {
    const fromTwin = activeTwin.entities.map((e) => e.code).filter(Boolean);
    const fromData = projects.map((p) => p.entity).filter(Boolean);
    return [...new Set([...fromTwin, ...fromData])];
  }, [activeTwin.entities, projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (entityFilter !== "all" && p.entity !== entityFilter) return false;
      if (billingFilter !== "all" && p.billingType !== billingFilter) return false;
      if (healthFilter !== "all" && p.health !== healthFilter) return false;
      return true;
    });
  }, [projects, entityFilter, billingFilter, healthFilter]);

  const selected =
    apiView?.project.id === selectedId
      ? apiView.project
      : projects.find((p) => p.id === selectedId) ?? projects[0];

  const statement = apiView?.project.id === selectedId ? apiView.statement : [];
  const costRows = apiView?.project.id === selectedId ? apiView.costLogic : [];
  const recommendations = apiView?.project.id === selectedId ? apiView.recommendations : [];

  if (!pipelineLoading && !projects.length) {
    return (
      <div className="space-y-6">
        <AecPageHeader
          title="Project Profitability"
          subtitle="No projects available for this twin."
          breadcrumb={[
            { label: "Pipeline", href: "/customer-inquiries" },
            { label: "Project Profitability" },
          ]}
        />
        <PipelineEmptyState>Create or convert a project to view profitability.</PipelineEmptyState>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="space-y-6">
        <AecPageHeader
          title="Project Profitability"
          subtitle="Loading projects…"
          breadcrumb={[
            { label: "Pipeline", href: "/customer-inquiries" },
            { label: "Project Profitability" },
          ]}
        />
        <PipelineLoadingBanner label="Loading projects…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Project Profitability"
        subtitle="P&L analysis, cost composition, and margin health across the portfolio."
        breadcrumb={[
          { label: "Pipeline", href: "/customer-inquiries" },
          { label: "Project Profitability" },
        ]}
      />

      {(loading || pipelineLoading) && <PipelineLoadingBanner label="Loading profitability…" />}
      <PipelineErrorBanner message={error ?? ""} />

      <Card className="rounded-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Entity</Label>
            <Select value={entityFilter} onValueChange={(v) => setEntityFilter(v as ProjectEntity | "all")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {entityOptions.map((code) => (
                  <SelectItem key={code} value={code}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Billing Type</Label>
            <Select value={billingFilter} onValueChange={(v) => setBillingFilter(v as BillingType | "all")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Lump Sum">Lump Sum</SelectItem>
                <SelectItem value="Milestone">Milestone</SelectItem>
                <SelectItem value="T&M">T&M</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Health</Label>
            <Select value={healthFilter} onValueChange={(v) => setHealthFilter(v as ProjectHealth | "all")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((p) => (
          <PipelineProjectCard
            key={p.id}
            selected={selectedId === p.id}
            onClick={() => setSelectedId(p.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold leading-snug">{p.name}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {p.client} · {p.entity}
                </p>
              </div>
              <StatusBadge status={healthBadge[p.health]} className="shrink-0" />
            </div>
            <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 shrink-0 text-accent" />
                <div>
                  <p className="text-lg font-semibold tabular-nums leading-none">{p.marginPct}%</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">margin</p>
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold tabular-nums leading-none">{p.progressPct}%</p>
                <p className="mt-1 text-[11px] text-muted-foreground">complete</p>
              </div>
            </div>
            <p className="mt-3 truncate text-xs text-muted-foreground">PM {p.projectManager}</p>
          </PipelineProjectCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card className="rounded-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cost Composition — {selected.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Revenue {selected.revenueDisplay} · Budget {selected.budgetDisplay} · {selected.marginPct}% margin
            </p>
          </CardHeader>
          <CardContent>
            <CostCompositionChart costs={selected.costs} currency={selected.currency} />
          </CardContent>
        </Card>

        <Card className="rounded-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profitability Statement</CardTitle>
          </CardHeader>
          <CardContent>
            {statement.length ? (
              <ProfitabilityStatement lines={statement} currency={selected.currency} />
            ) : (
              <p className="py-6 text-sm text-muted-foreground">No statement lines from API yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cost Logic — Employee vs Contractor</CardTitle>
        </CardHeader>
        <CardContent>
          {costRows.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Logic</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costRows.map((row) => (
                    <TableRow key={`${row.resource}-${row.total}`}>
                      <TableCell className="font-medium">{row.resource}</TableCell>
                      <TableCell className="tabular-nums">{row.rate}</TableCell>
                      <TableCell className="tabular-nums">
                        {row.hours != null ? `${row.hours} hrs` : row.days != null ? `${row.days} days` : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{row.total}</TableCell>
                      <TableCell className="max-w-[280px] text-muted-foreground">{row.logic}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-6 text-sm text-muted-foreground">No cost-logic rows from API yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Employee vs Contractor Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scenario</TableHead>
                    <TableHead>Recommendation</TableHead>
                    <TableHead className="text-right">Saving</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendations.map((row) => (
                    <TableRow key={row.scenario}>
                      <TableCell className="font-medium">{row.scenario}</TableCell>
                      <TableCell>{row.recommendation}</TableCell>
                      <TableCell className="text-right tabular-nums text-success">{row.saving}</TableCell>
                      <TableCell className="max-w-[320px] text-muted-foreground">{row.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-6 text-sm text-muted-foreground">No recommendations from API yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

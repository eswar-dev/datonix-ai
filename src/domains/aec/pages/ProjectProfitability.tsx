import { useMemo, useState } from "react";
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
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { profitabilityStatement, costLogicRows, employeeVsContractorLogic, type BillingType, type ProjectEntity, type ProjectHealth } from "@/domains/aec/data/projects";
import { cn } from "@/common/lib/utils";

const healthBadge: Record<ProjectHealth, string> = {
  Good: "Active",
  "At Risk": "At Risk",
  Critical: "At Risk",
};

export default function ProjectProfitability() {
  const { projects, activeProjectId } = useAecApp();
  const [selectedId, setSelectedId] = useState(activeProjectId ?? "prj-kings-cross");
  const [entityFilter, setEntityFilter] = useState<ProjectEntity | "all">("all");
  const [billingFilter, setBillingFilter] = useState<BillingType | "all">("all");
  const [healthFilter, setHealthFilter] = useState<ProjectHealth | "all">("all");

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (entityFilter !== "all" && p.entity !== entityFilter) return false;
      if (billingFilter !== "all" && p.billingType !== billingFilter) return false;
      if (healthFilter !== "all" && p.health !== healthFilter) return false;
      return true;
    });
  }, [entityFilter, billingFilter, healthFilter]);

  const selected = projects.find((p) => p.id === selectedId) ?? projects[0];
  const statement = profitabilityStatement(selected);

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

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Entity</Label>
            <Select value={entityFilter} onValueChange={(v) => setEntityFilter(v as ProjectEntity | "all")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="MA">MA</SelectItem>
                <SelectItem value="ME">ME</SelectItem>
                <SelectItem value="MC">MC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Billing Type</Label>
            <Select value={billingFilter} onValueChange={(v) => setBillingFilter(v as BillingType | "all")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
              <SelectTrigger><SelectValue /></SelectTrigger>
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

      <div className="grid gap-3 sm:grid-cols-3">
        {filteredProjects.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedId(p.id)}
            className={cn(
              "rounded-card border p-4 text-left transition-colors hover:bg-muted/30",
              selectedId === p.id && "border-accent ring-1 ring-accent/20"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.client} · {p.entity}</p>
              </div>
              <StatusBadge status={healthBadge[p.health]} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-lg font-semibold">{p.marginPct}%</span>
              <span className="text-xs text-muted-foreground">margin</span>
              <span className="text-xs text-muted-foreground">· {p.progressPct}% complete</span>
              <span className="text-xs text-muted-foreground">· PM {p.projectManager}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-card">
          <CardHeader>
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
          <CardHeader>
            <CardTitle className="text-base">Profitability Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitabilityStatement lines={statement} currency={selected.currency} />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Cost Logic — Employee vs Contractor</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Logic</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costLogicRows.map((row) => (
                <TableRow key={row.resource}>
                  <TableCell className="font-medium">{row.resource}</TableCell>
                  <TableCell>{row.rate}</TableCell>
                  <TableCell>
                    {row.hours != null ? `${row.hours} hrs` : row.days != null ? `${row.days} days` : "—"}
                  </TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell className="text-muted-foreground">{row.logic}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Employee vs Contractor Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario</TableHead>
                <TableHead>Recommendation</TableHead>
                <TableHead>Saving</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeVsContractorLogic.map((row) => (
                <TableRow key={row.scenario}>
                  <TableCell className="font-medium">{row.scenario}</TableCell>
                  <TableCell>{row.recommendation}</TableCell>
                  <TableCell className="text-success">{row.saving}</TableCell>
                  <TableCell className="text-muted-foreground">{row.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, FolderKanban } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Label } from "@/common/components/ui/label";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import type { BillingType, ProjectEntity, ProjectHealth } from "@/domains/aec/data/projects";
import { cn } from "@/common/lib/utils";

const healthBadge: Record<ProjectHealth, string> = {
  Good: "Active",
  "At Risk": "At Risk",
  Critical: "At Risk",
};

export default function ProjectPortfolio() {
  const navigate = useNavigate();
  const { projects, setActiveProjectId } = useAecApp();
  const [entityFilter, setEntityFilter] = useState<ProjectEntity | "all">("all");
  const [billingFilter, setBillingFilter] = useState<BillingType | "all">("all");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (entityFilter !== "all" && p.entity !== entityFilter) return false;
      if (billingFilter !== "all" && p.billingType !== billingFilter) return false;
      return true;
    });
  }, [projects, entityFilter, billingFilter]);

  const openWbs = (projectId: string) => {
    setActiveProjectId(projectId);
    navigate("/projects/wbs");
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Project Portfolio"
        subtitle={`${projects.length} active projects across ${new Set(projects.map((p) => p.entity)).size} entities.`}
        breadcrumb={[
          { label: "Pipeline", href: "/customer-inquiries" },
          { label: "Project Portfolio" },
        ]}
        actions={
          <Button size="sm" asChild>
            <Link to="/projects/create">
              <FolderKanban className="mr-2 h-4 w-4" />
              Create Project
            </Link>
          </Button>
        }
      />

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Entity</Label>
            <Select value={entityFilter} onValueChange={(v) => setEntityFilter(v as ProjectEntity | "all")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                <SelectItem value="MA">MA</SelectItem>
                <SelectItem value="ME">ME</SelectItem>
                <SelectItem value="MC">MC</SelectItem>
                <SelectItem value="MC+MA">MC+MA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Billing Type</Label>
            <Select value={billingFilter} onValueChange={(v) => setBillingFilter(v as BillingType | "all")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="Lump Sum">Lump Sum</SelectItem>
                <SelectItem value="Milestone">Milestone</SelectItem>
                <SelectItem value="T&M">T&M</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <Card key={p.id} className="rounded-card">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{p.client} · {p.entity}</p>
                </div>
                <StatusBadge status={healthBadge[p.health]} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-2 py-0.5">{p.billingType}</span>
                <span>{p.budgetDisplay} budget</span>
                <span>{p.marginPct}% margin</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className={cn("font-semibold", p.progressPct < 30 && "text-warning")}>{p.progressPct}%</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openWbs(p.id)}>
                  WBS
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to="/projects/profitability">
                    P&L
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

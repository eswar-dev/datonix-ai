import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, FolderKanban, Loader2 } from "lucide-react";
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
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
  PipelineProjectCard,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import type { BillingType, ProjectEntity, ProjectHealth } from "@/domains/aec/data/projects";

const healthBadge: Record<ProjectHealth, string> = {
  Good: "Active",
  "At Risk": "At Risk",
  Critical: "At Risk",
};

export default function ProjectPortfolio() {
  const navigate = useNavigate();
  const {
    projects,
    activeTwin,
    setActiveProjectId,
    pipelineLoading,
    pipelineError,
    refreshPipeline,
  } = useAecApp();
  const [entityFilter, setEntityFilter] = useState<ProjectEntity | "all">("all");
  const [billingFilter, setBillingFilter] = useState<BillingType | "all">("all");

  useEffect(() => {
    void refreshPipeline();
  }, [refreshPipeline]);

  const entityOptions = useMemo(() => {
    const fromTwin = activeTwin.entities.map((e) => e.code).filter(Boolean);
    const fromData = projects.map((p) => p.entity).filter(Boolean);
    return [...new Set([...fromTwin, ...fromData])];
  }, [activeTwin.entities, projects]);

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

  const entityCount = new Set(projects.map((p) => p.entity).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Project Portfolio"
        subtitle={`${projects.length} project${projects.length === 1 ? "" : "s"} across ${entityCount} entit${entityCount === 1 ? "y" : "ies"}.`}
        breadcrumb={[
          { label: "Pipeline", href: "/customer-inquiries" },
          { label: "Project Portfolio" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void refreshPipeline()} disabled={pipelineLoading}>
              {pipelineLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Refresh
            </Button>
            <Button size="sm" asChild>
              <Link to="/projects/create">
                <FolderKanban className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
          </div>
        }
      />

      <PipelineErrorBanner message={pipelineError ?? ""} />

      <Card className="rounded-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      {pipelineLoading && !projects.length ? (
        <PipelineLoadingBanner label="Loading projects…" />
      ) : !filtered.length ? (
        <PipelineEmptyState>
          <div className="space-y-3">
            <p>No projects found for this twin.</p>
            <Button size="sm" asChild>
              <Link to="/projects/create">Create Project</Link>
            </Button>
          </div>
        </PipelineEmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PipelineProjectCard key={p.id} onClick={() => openWbs(p.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold leading-snug">{p.name}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {p.client} · {p.entity}
                  </p>
                </div>
                <StatusBadge status={healthBadge[p.health]} className="shrink-0" />
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-4 text-xs text-muted-foreground">
                <span className="tabular-nums">{p.budgetDisplay}</span>
                <span aria-hidden>·</span>
                <span>{p.billingType}</span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{p.progressPct}% complete</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm font-medium text-accent">
                Open WBS <ArrowRight className="h-4 w-4" />
              </div>
            </PipelineProjectCard>
          ))}
        </div>
      )}
    </div>
  );
}

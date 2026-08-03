import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Check, GitBranch, Loader2, Sparkles } from "lucide-react";
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
import { WbsTree } from "@/domains/aec/components/WbsTree";
import { MilestoneTable } from "@/domains/aec/components/MilestoneTable";
import {
  PipelineEmptyState,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { cn } from "@/common/lib/utils";

export default function WbsBuilder() {
  const {
    projectDraft,
    activeProjectId,
    wbsProjects,
    projects,
    setActiveProjectId,
    loadProjectWbs,
    generateProjectWbs,
    approveProjectWbs,
    pipelineLoading,
    refreshPipeline,
  } = useAecApp();

  useEffect(() => {
    void refreshPipeline();
  }, [refreshPipeline]);

  const projectOptions = useMemo(() => {
    const fromWbs = wbsProjects.map((w) => ({ id: w.id, name: w.name }));
    const fromProjects = projects.map((p) => ({ id: p.id, name: p.name }));
    const map = new Map<string, string>();
    for (const p of [...fromProjects, ...fromWbs]) map.set(p.id, p.name);
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [wbsProjects, projects]);

  const defaultId = activeProjectId ?? projectOptions[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(defaultId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultId && !selectedId) setSelectedId(defaultId);
  }, [defaultId, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    void loadProjectWbs(selectedId).finally(() => setLoading(false));
  }, [selectedId, loadProjectWbs]);

  const project = useMemo(
    () => wbsProjects.find((p) => p.id === selectedId) ?? null,
    [selectedId, wbsProjects]
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setActiveProjectId(id);
  };

  const displayName =
    projectDraft.name && activeProjectId === selectedId
      ? projectDraft.name
      : project?.name ?? projectOptions.find((p) => p.id === selectedId)?.name ?? "Project";

  if (!projectOptions.length) {
    return (
      <div className="space-y-6">
        <AecPageHeader
          title="WBS Builder"
          subtitle="No projects available."
          breadcrumb={[
            { label: "Pipeline", href: "/projects" },
            { label: "WBS Builder" },
          ]}
        />
        <PipelineEmptyState>
          <div className="space-y-3">
            <p>Create a project first to build its work breakdown structure.</p>
            <Button size="sm" asChild>
              <Link to="/projects/create">Create a project</Link>
            </Button>
          </div>
        </PipelineEmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="WBS Builder"
        subtitle={`${displayName} — work breakdown structure, phases, and milestones.`}
        breadcrumb={[
          { label: "Pipeline", href: "/projects" },
          { label: "WBS Builder" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || !selectedId}
              onClick={() => {
                setLoading(true);
                void generateProjectWbs(selectedId).finally(() => setLoading(false));
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate WBS
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || !selectedId}
              onClick={() => {
                setLoading(true);
                void approveProjectWbs(selectedId).finally(() => setLoading(false));
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/projects/profitability">
                View Profitability
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        }
      />

      <Card className="rounded-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Project</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <Label className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-accent" />
                Active project
              </Label>
              <Select value={selectedId} onValueChange={handleSelect}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(loading || pipelineLoading) && (
              <div className="flex items-center gap-2 pb-2 text-sm text-muted-foreground sm:pb-0">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading WBS…
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {project?.riskSignal && (
        <div
          className={cn(
            "rounded-lg border p-4",
            project.riskSignal.severity === "High"
              ? "border-destructive/40 bg-destructive/5"
              : "border-warning/40 bg-warning/5"
          )}
        >
          <div className="flex gap-3">
            <AlertTriangle
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                project.riskSignal.severity === "High" ? "text-destructive" : "text-warning"
              )}
            />
            <div className="min-w-0">
              <p className="font-semibold leading-snug">{project.riskSignal.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{project.riskSignal.message}</p>
              <p className="mt-2 text-sm">
                <span className="font-medium">Recommendation: </span>
                {project.riskSignal.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {project ? (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <Card className="rounded-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Phases & Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {project.phases.length ? (
                <WbsTree phases={project.phases} />
              ) : (
                <p className="py-6 text-sm text-muted-foreground">
                  No phases yet. Click Generate WBS to create a draft from the API.
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {project.milestones.length ? (
                <MilestoneTable milestones={project.milestones} bordered={false} />
              ) : (
                <p className="py-6 text-sm text-muted-foreground">No milestones yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <PipelineEmptyState>Select a project to load its WBS.</PipelineEmptyState>
      )}
    </div>
  );
}

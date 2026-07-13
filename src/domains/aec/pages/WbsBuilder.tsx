import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, GitBranch, ArrowRight } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { WbsTree } from "@/domains/aec/components/WbsTree";
import { MilestoneTable } from "@/domains/aec/components/MilestoneTable";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { cn } from "@/common/lib/utils";

export default function WbsBuilder() {
  const { projectDraft, activeProjectId, wbsProjects, setActiveProjectId } = useAecApp();
  const defaultId = activeProjectId ?? wbsProjects[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(defaultId);

  const project = useMemo(
    () => wbsProjects.find((p) => p.id === selectedId) ?? wbsProjects[0],
    [selectedId, wbsProjects]
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setActiveProjectId(id);
  };

  const displayName = projectDraft.name && activeProjectId === selectedId ? projectDraft.name : project?.name ?? "Project";

  if (!project) {
    return (
      <div className="space-y-6">
        <AecPageHeader title="WBS Builder" subtitle="No projects available." breadcrumb={[{ label: "WBS Builder" }]} />
        <Button asChild><Link to="/projects/create">Create a project</Link></Button>
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
          <Button variant="outline" size="sm" asChild>
            <Link to="/projects/profitability">
              View Profitability
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <GitBranch className="h-5 w-5 text-accent" />
        <Select value={selectedId} onValueChange={handleSelect}>
          <SelectTrigger className="w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {wbsProjects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
              "h-5 w-5 shrink-0",
              project.riskSignal.severity === "High" ? "text-destructive" : "text-warning"
            )}
          />
          <div>
            <p className="font-semibold">{project.riskSignal.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{project.riskSignal.message}</p>
            <p className="mt-2 text-sm">
              <span className="font-medium">Recommendation: </span>
              {project.riskSignal.recommendation}
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Work Breakdown Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <WbsTree phases={project.phases} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Milestones</h2>
        <MilestoneTable milestones={project.milestones} />
      </div>
    </div>
  );
}

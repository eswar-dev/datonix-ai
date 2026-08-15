import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Progress } from "@/common/components/ui/progress";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import type { WbsPhase } from "@/domains/aec/data/wbs";

export function WbsTree({
  phases,
  onUpdatePhaseProgress,
  onUpdateTaskProgress,
}: {
  phases: WbsPhase[];
  onUpdatePhaseProgress?: (phaseId: string, progress: number) => Promise<void>;
  onUpdateTaskProgress?: (taskId: string, progress: number) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(phases.map((p) => [p.id, p.progress < 100]))
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const save = async (id: string, kind: "phase" | "task") => {
    const raw = drafts[id];
    const progress = Number(raw);
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) return;
    setBusyId(id);
    try {
      if (kind === "phase") await onUpdatePhaseProgress?.(id, progress);
      else await onUpdateTaskProgress?.(id, progress);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-2">
      {phases.map((phase) => {
        const isOpen = expanded[phase.id];
        return (
          <div key={phase.id} className="rounded-lg border">
            <div className="flex w-full items-center gap-3 px-4 py-3">
              <button type="button" className="shrink-0" onClick={() => toggle(phase.id)}>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{phase.name}</p>
                <div className="mt-1.5 flex items-center gap-3">
                  <Progress value={phase.progress} className="h-1.5 flex-1" />
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      phase.progress < 70 ? "text-warning" : "text-success"
                    )}
                  >
                    {phase.progress}%
                  </span>
                </div>
              </div>
              {onUpdatePhaseProgress && (
                <div className="flex items-center gap-1">
                  <Input
                    className="h-8 w-16"
                    type="number"
                    min={0}
                    max={100}
                    value={drafts[phase.id] ?? String(phase.progress)}
                    onChange={(e) => setDrafts((d) => ({ ...d, [phase.id]: e.target.value }))}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === phase.id}
                    onClick={() => void save(phase.id, "phase")}
                  >
                    Save
                  </Button>
                </div>
              )}
              <div className="hidden text-right text-xs text-muted-foreground sm:block">
                <p>
                  £{phase.spentGbp.toLocaleString()} / £{phase.budgetGbp.toLocaleString()}
                </p>
              </div>
            </div>
            {isOpen && phase.tasks.length > 0 && (
              <div className="border-t bg-muted/20 px-4 py-2">
                {phase.tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 py-2 pl-7">
                    <Progress value={task.progress} className="h-1 flex-1 max-w-[200px]" />
                    <span className="flex-1 text-xs">{task.name}</span>
                    <span className="text-xs text-muted-foreground">{task.progress}%</span>
                    {onUpdateTaskProgress && (
                      <div className="flex items-center gap-1">
                        <Input
                          className="h-7 w-14"
                          type="number"
                          min={0}
                          max={100}
                          value={drafts[task.id] ?? String(task.progress)}
                          onChange={(e) => setDrafts((d) => ({ ...d, [task.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7"
                          disabled={busyId === task.id}
                          onClick={() => void save(task.id, "task")}
                        >
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

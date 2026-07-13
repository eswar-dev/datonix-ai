import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Progress } from "@/common/components/ui/progress";
import { cn } from "@/common/lib/utils";
import type { WbsPhase } from "@/domains/aec/data/wbs";

export function WbsTree({ phases }: { phases: WbsPhase[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(phases.map((p) => [p.id, p.progress < 100]))
  );

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-2">
      {phases.map((phase) => {
        const isOpen = expanded[phase.id];
        return (
          <div key={phase.id} className="rounded-lg border">
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30"
              onClick={() => toggle(phase.id)}
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{phase.name}</p>
                <div className="mt-1.5 flex items-center gap-3">
                  <Progress value={phase.progress} className="h-1.5 flex-1" />
                  <span className={cn("text-xs font-semibold", phase.progress < 70 ? "text-warning" : "text-success")}>
                    {phase.progress}%
                  </span>
                </div>
              </div>
              <div className="hidden text-right text-xs text-muted-foreground sm:block">
                <p>£{phase.spentGbp.toLocaleString()} / £{phase.budgetGbp.toLocaleString()}</p>
              </div>
            </button>
            {isOpen && phase.tasks.length > 0 && (
              <div className="border-t bg-muted/20 px-4 py-2">
                {phase.tasks.map((task) => (
                  <div key={task.id} className="py-2 pl-7">
                    <div className="flex items-center gap-3">
                      <Progress value={task.progress} className="h-1 flex-1 max-w-[200px]" />
                      <span className="flex-1 text-xs">{task.name}</span>
                      <span className="text-xs text-muted-foreground">{task.progress}%</span>
                    </div>
                    {task.children && (
                      <ul className="mt-1 space-y-0.5 pl-4 text-[10px] text-muted-foreground">
                        {task.children.map((child) => (
                          <li key={child}>· {child}</li>
                        ))}
                      </ul>
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

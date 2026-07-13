import { ArrowRight, Bot, CheckCircle, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";

interface ApprovalWorkflowDiagramProps {
  steps: { step: number; label: string; description: string }[];
}

const stepIcons = [Bot, User, CheckCircle, CheckCircle];

export function ApprovalWorkflowDiagram({ steps }: ApprovalWorkflowDiagramProps) {
  return (
    <Card className="rounded-card">
      <CardHeader>
        <CardTitle className="text-base">Approval Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          {steps.map((s, i) => {
            const Icon = stepIcons[i] ?? CheckCircle;
            return (
              <div key={s.step} className="flex flex-1 items-start gap-2 md:flex-col md:items-center md:text-center">
                <div className="flex items-center gap-2 md:flex-col">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight className="hidden h-4 w-4 text-muted-foreground md:block md:rotate-0" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground md:hidden" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

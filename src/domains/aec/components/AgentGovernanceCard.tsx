import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import type { GovernanceAgent, AgentAction } from "@/domains/aec/data/agentGovernance";
import { StatusBadge } from "./StatusBadge";

interface AgentGovernanceCardProps {
  agent: GovernanceAgent;
  onAction: (id: string, action: AgentAction) => void;
}

export function AgentGovernanceCard({ agent, onAction }: AgentGovernanceCardProps) {
  const isPending = agent.status === "Pending";

  return (
    <Card className="rounded-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{agent.name}</CardTitle>
          {!isPending && <StatusBadge status={agent.status} />}
        </div>
        {agent.entity && (
          <Badge variant="outline" className="w-fit text-[10px]">
            {agent.entity}{agent.project ? ` · ${agent.project}` : ""}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Trigger</p>
          <p className="text-sm">{agent.trigger}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Recommendation</p>
          <p className="text-sm">{agent.recommendation}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Confidence: <span className="font-semibold text-foreground">{agent.confidence}%</span>
          </span>
        </div>
        {isPending && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1" onClick={() => onAction(agent.id, "Approve")}>
              <Check className="mr-1 h-3 w-3" />
              Approve
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onAction(agent.id, "Modify")}>
              <Pencil className="mr-1 h-3 w-3" />
              Modify
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onAction(agent.id, "Reject")}>
              <X className="mr-1 h-3 w-3" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

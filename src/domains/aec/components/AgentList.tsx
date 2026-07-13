import { Link } from "react-router-dom";
import { Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Progress } from "@/common/components/ui/progress";
import { StatusBadge } from "./StatusBadge";
import type { GeneratedAgent } from "@/domains/aec/data/agents";

export function AgentList({ agents }: { agents: GeneratedAgent[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <Card key={agent.id} className="rounded-card">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
                <CardTitle className="text-sm font-medium">{agent.name}</CardTitle>
              </div>
              <StatusBadge status={agent.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">{agent.trigger}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{agent.layer}</span>
              <span className="text-muted-foreground">Last run: {agent.lastRun}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Confidence</span>
                <span>{agent.confidence}%</span>
              </div>
              <Progress value={agent.confidence} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className="rounded-card flex items-center justify-center border-dashed sm:col-span-2 lg:col-span-3">
        <Link to="/ai-agents" className="text-sm font-medium text-accent hover:underline">
          Open AI Agent Governance →
        </Link>
      </Card>
    </div>
  );
}

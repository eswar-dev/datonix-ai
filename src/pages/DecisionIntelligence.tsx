import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Bot, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { roleData } from "@/data/roleData";

const urgencyColor: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Med: "bg-warning/10 text-warning border-warning/20",
  Low: "bg-muted text-muted-foreground",
};

function confidenceColor(c: number) {
  if (c >= 85) return "text-success";
  if (c >= 70) return "text-warning";
  return "text-destructive";
}

export default function DecisionIntelligence() {
  const { user } = useAuth();
  if (!user) return null;
  const data = roleData[user.role].decisionIntelligence;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Decision Intelligence</h1>

      {/* Active AI Agents */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Bot className="h-4 w-4 text-accent" />
          Active AI Agents
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.agents.map((agent) => (
            <Card key={agent.name} className="rounded-card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  <p className="text-sm font-semibold">{agent.name}</p>
                </div>
                <Badge
                  variant={agent.status === "Active" ? "secondary" : "outline"}
                  className={`text-[10px] ${agent.status === "Active" ? "bg-success/10 text-success border-success/20" : ""}`}
                >
                  {agent.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{agent.trigger}</p>
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Confidence</span>
                  <span className={confidenceColor(agent.confidence)}>{agent.confidence}%</span>
                </div>
                <Progress value={agent.confidence} className="h-1.5" />
              </div>
              <p className="text-[11px] text-muted-foreground">Last fired: {agent.lastFired}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Decision Recommendations */}
      <div>
        <h2 className="mb-4 text-sm font-semibold">Decision Recommendations</h2>
        <Card className="rounded-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pillar</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Recommendation</TableHead>
                <TableHead className="text-center">Confidence</TableHead>
                <TableHead className="text-center">Urgency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.decisions.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-sm">{d.pillar}</TableCell>
                  <TableCell className="text-sm">{d.question}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.recommendation}</TableCell>
                  <TableCell className="text-center">
                    <span className={`font-semibold text-sm ${confidenceColor(d.confidence)}`}>
                      {d.confidence}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={urgencyColor[d.urgency]}>{d.urgency}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import type { AuditLogEntry } from "@/domains/aec/data/agentGovernance";

interface AgentAuditLogProps {
  entries: AuditLogEntry[];
}

export function AgentAuditLog({ entries }: AgentAuditLogProps) {
  return (
    <Card className="rounded-card">
      <CardHeader>
        <CardTitle className="text-base">Audit Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {entries.map((entry, i) => (
            <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
              {i < entries.length - 1 && (
                <div className="absolute left-[7px] top-4 h-full w-px bg-border" />
              )}
              <div className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-accent bg-background" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                  <StatusBadge status={entry.action === "Alert raised" ? "Pending" : entry.action} />
                </div>
                <p className="mt-1 text-sm font-medium">{entry.agent}</p>
                <p className="text-sm text-muted-foreground">{entry.detail}</p>
                <p className="mt-1 text-xs text-muted-foreground">By {entry.user}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

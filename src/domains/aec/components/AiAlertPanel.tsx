import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { cn } from "@/common/lib/utils";
import type { AiAlert } from "@/domains/aec/data/dashboards";

interface AiAlertPanelProps {
  alerts: AiAlert[];
}

const severityIcon = {
  High: AlertCircle,
  Medium: AlertTriangle,
  Low: Info,
};

const severityStyle = {
  High: "border-destructive/30 bg-destructive/5",
  Medium: "border-warning/30 bg-warning/5",
  Low: "border-border bg-muted/30",
};

export function AiAlertPanel({ alerts }: AiAlertPanelProps) {
  return (
    <Card className="rounded-card">
      <CardHeader>
        <CardTitle className="text-base">AI Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const Icon = severityIcon[alert.severity];
          return (
            <div
              key={alert.id}
              className={cn("rounded-lg border p-3", severityStyle[alert.severity])}
            >
              <div className="flex items-start gap-2">
                <Icon
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    alert.severity === "High" && "text-destructive",
                    alert.severity === "Medium" && "text-warning",
                    alert.severity === "Low" && "text-muted-foreground"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{alert.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{alert.message}</p>
                  <p className="mt-1 text-[10px] font-medium text-accent">{alert.agent}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

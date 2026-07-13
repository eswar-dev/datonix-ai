import { Card } from "@/common/components/ui/card";
import { cn } from "@/common/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export interface MetricItem {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export function MetricStrip({ metrics }: { metrics: MetricItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.label} className="rounded-card p-4">
          <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
          <div className="mt-1 flex items-end gap-2">
            <p className="text-2xl font-semibold">{m.value}</p>
            {m.change && (
              <span
                className={cn(
                  "mb-0.5 flex items-center gap-0.5 text-xs font-medium",
                  m.trend === "up" && "text-success",
                  m.trend === "down" && "text-destructive",
                  m.trend === "neutral" && "text-muted-foreground"
                )}
              >
                {m.trend === "up" && <TrendingUp className="h-3 w-3" />}
                {m.trend === "down" && <TrendingDown className="h-3 w-3" />}
                {m.trend === "neutral" && <Minus className="h-3 w-3" />}
                {m.change}
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

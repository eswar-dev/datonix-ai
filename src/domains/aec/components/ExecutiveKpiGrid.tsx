import { Card, CardContent } from "@/common/components/ui/card";
import { cn } from "@/common/lib/utils";

interface ExecutiveKpiGridProps {
  kpis: {
    groupRevenueGbp: number;
    groupMarginPct: number;
    projectsAtRisk: number;
    activeProjects: number;
    staffCount: number;
    avgUtilization: number;
    arDaysOutstanding: number;
    cashRunwayDays: number;
  };
}

export function ExecutiveKpiGrid({ kpis }: ExecutiveKpiGridProps) {
  const items = [
    { label: "Group Revenue", value: `£${(kpis.groupRevenueGbp / 1_000_000).toFixed(2)}M`, highlight: true },
    { label: "Group Margin", value: `${kpis.groupMarginPct}%`, highlight: true },
    { label: "Projects at Risk", value: String(kpis.projectsAtRisk), alert: kpis.projectsAtRisk > 0 },
    { label: "Active Projects", value: String(kpis.activeProjects) },
    { label: "Staff", value: String(kpis.staffCount) },
    { label: "Avg Utilization", value: `${kpis.avgUtilization}%` },
    { label: "AR Days Outstanding", value: `${kpis.arDaysOutstanding}d` },
    { label: "Cash Runway", value: `${kpis.cashRunwayDays}d` },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="rounded-card">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums",
                item.highlight && "text-accent",
                item.alert && "text-destructive"
              )}
            >
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

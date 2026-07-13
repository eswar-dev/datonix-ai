import { Link } from "react-router-dom";
import { BarChart3, Bot, PoundSterling, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import type { KpiItem, kpiFrameworkCategories } from "@/domains/aec/data/kpis";

type KpiCategory = (typeof kpiFrameworkCategories)[number];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  financial: PoundSterling,
  project: BarChart3,
  people: Users,
  agent: Bot,
};

export function KpiFrameworkGrid({
  categories,
  kpis,
}: {
  categories?: KpiCategory[];
  kpis?: KpiItem[];
}) {
  if (categories) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.id] ?? BarChart3;
          return (
            <Card key={cat.id} className="rounded-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4 text-accent" />
                  {cat.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed text-muted-foreground">{cat.items}</p>
              </CardContent>
            </Card>
          );
        })}
        <Card className="rounded-card flex items-center justify-center border-dashed">
          <Link to="/dashboard/executive" className="text-sm font-medium text-accent hover:underline">
            View Executive Dashboard →
          </Link>
        </Card>
      </div>
    );
  }

  if (!kpis) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.id} className="rounded-card">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm font-medium leading-tight">{kpi.name}</CardTitle>
              <StatusBadge status={kpi.status} />
            </div>
            <p className="text-[10px] text-muted-foreground">{kpi.category} · {kpi.layer}</p>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="text-sm font-medium">{kpi.target}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Actual</p>
              <p className="text-lg font-semibold">{kpi.actual}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

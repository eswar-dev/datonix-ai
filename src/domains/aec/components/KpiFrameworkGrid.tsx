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

const CATEGORY_ORDER = ["financial", "project", "people", "agent"];

function hasMeasuredValues(kpi: KpiItem) {
  return Boolean(kpi.target?.trim() || kpi.actual?.trim());
}

function groupByCategory(kpis: KpiItem[]) {
  const groups = new Map<string, { id: string; label: string; items: KpiItem[] }>();
  for (const kpi of kpis) {
    const id = (kpi.category || "general").toLowerCase();
    const existing = groups.get(id);
    if (existing) {
      existing.items.push(kpi);
    } else {
      groups.set(id, {
        id,
        label: kpi.categoryLabel ?? `${id.charAt(0).toUpperCase()}${id.slice(1)} KPIs`,
        items: [kpi],
      });
    }
  }
  return [...groups.values()].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.id);
    const bi = CATEGORY_ORDER.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

/** Twin API KPIs are definitions (name + description by category), not live Target/Actual metrics. */
function DefinitionFramework({ kpis }: { kpis: KpiItem[] }) {
  const groups = groupByCategory(kpis);
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {groups.map((group) => {
        const Icon = categoryIcons[group.id] ?? BarChart3;
        return (
          <Card key={group.id} className="rounded-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4 text-accent" />
                {group.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.items.map((kpi) => (
                <div key={kpi.id} className="space-y-1 border-b border-border/60 pb-2 last:border-0 last:pb-0">
                  <p className="text-sm font-medium leading-tight">{kpi.name}</p>
                  {kpi.description ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">{kpi.description}</p>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
      <Card className="rounded-card flex items-center justify-center border-dashed sm:col-span-2 lg:col-span-1">
        <Link to="/dashboard/executive" className="text-sm font-medium text-accent hover:underline">
          View Executive Dashboard →
        </Link>
      </Card>
    </div>
  );
}

function MeasuredKpiGrid({ kpis }: { kpis: KpiItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.id} className="rounded-card">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm font-medium leading-tight">{kpi.name}</CardTitle>
              <StatusBadge status={kpi.status} />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {kpi.categoryLabel ?? kpi.category}
              {kpi.layer && kpi.layer !== kpi.category ? ` · ${kpi.layer}` : ""}
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {kpi.description ? (
              <p className="text-xs leading-relaxed text-muted-foreground">{kpi.description}</p>
            ) : null}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="text-sm font-medium">{kpi.target || "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Actual</p>
                <p className="text-lg font-semibold">{kpi.actual || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

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

  if (!kpis?.length) return null;

  const measured = kpis.some(hasMeasuredValues);
  return measured ? <MeasuredKpiGrid kpis={kpis} /> : <DefinitionFramework kpis={kpis} />;
}

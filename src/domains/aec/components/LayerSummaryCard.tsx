import { Link } from "react-router-dom";
import { Building2, Users, PoundSterling, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import type { LayerSummary } from "@/domains/aec/data/enterpriseTwin";

const icons = {
  org: Building2,
  resource: Users,
  financial: PoundSterling,
  operational: Briefcase,
};

export function LayerSummaryCard({ layer }: { layer: LayerSummary }) {
  const Icon = icons[layer.id];

  return (
    <Card className="rounded-card flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <Icon className="h-4 w-4 text-accent" />
          </div>
          <div>
            <CardTitle className="text-base">{layer.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{layer.subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {layer.metrics.map((m) => (
            <div key={m.label} className="rounded-md bg-muted/50 p-2 text-center">
              <p className="text-lg font-semibold">{m.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{m.label}</p>
            </div>
          ))}
        </div>
        <Button variant="link" className="mt-auto h-auto justify-start p-0 text-accent" asChild>
          <Link to={layer.linkTo}>{layer.linkLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

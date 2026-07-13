import { BarChart3, Bot, Clock, Globe, Users, Wallet } from "lucide-react";
import { Card, CardContent } from "@/common/components/ui/card";
import { cn } from "@/common/lib/utils";
import type { ReportItem } from "@/domains/aec/data/reports";

interface ReportLibraryProps {
  reports: ReportItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const iconMap = {
  chart: BarChart3,
  people: Users,
  money: Wallet,
  clock: Clock,
  globe: Globe,
  agent: Bot,
};

export function ReportLibrary({ reports, selectedId, onSelect }: ReportLibraryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reports.map((r) => {
        const Icon = iconMap[r.icon];
        const selected = selectedId === r.id;
        return (
          <Card
            key={r.id}
            className={cn(
              "rounded-card cursor-pointer transition-colors hover:border-accent/50",
              selected && "border-accent ring-1 ring-accent/30"
            )}
            onClick={() => onSelect(r.id)}
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-accent/10 p-2">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.category}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                  <p className="mt-2 text-[10px] text-muted-foreground">Last run: {r.lastRun}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

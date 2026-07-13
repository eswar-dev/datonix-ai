import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";
import { cn } from "@/common/lib/utils";

function heatColor(value: number) {
  if (value >= 95) return "bg-destructive/80 text-destructive-foreground";
  if (value >= 85) return "bg-warning/80 text-warning-foreground";
  if (value < 70) return "bg-muted text-muted-foreground";
  return "bg-success/70 text-success-foreground";
}

export function UtilizationHeatmap({
  weeks,
  rows,
}: {
  weeks: string[];
  rows: { name: string; values: number[] }[];
}) {
  return (
    <TooltipProvider>
      <div className="overflow-x-auto rounded-card border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-3 py-2 text-left font-medium">Resource</th>
              {weeks.map((w) => (
                <th key={w} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b last:border-0">
                <td className="px-3 py-2 font-medium whitespace-nowrap">{row.name}</td>
                {row.values.map((v, i) => (
                  <td key={i} className="p-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "mx-auto flex h-8 w-10 items-center justify-center rounded text-xs font-semibold",
                            heatColor(v)
                          )}
                        >
                          {v}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {row.name} · {weeks[i]}: {v}% utilization
                      </TooltipContent>
                    </Tooltip>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-wrap gap-3 border-t px-3 py-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-muted" /> &lt;70%</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-success/70" /> 70–84%</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-warning/80" /> 85–94%</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-destructive/80" /> ≥95%</span>
        </div>
      </div>
    </TooltipProvider>
  );
}

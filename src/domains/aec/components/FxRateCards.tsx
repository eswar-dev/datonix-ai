import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/common/components/ui/card";
import { cn } from "@/common/lib/utils";
import type { FxRate } from "@/domains/aec/data/currency";

interface FxRateCardsProps {
  rates: FxRate[];
  exposureGbp: number;
  fxPnlGbp: number;
}

export function FxRateCards({ rates, exposureGbp, fxPnlGbp }: FxRateCardsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rates.map((r) => (
          <Card key={r.pair} className="rounded-card">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{r.pair}</p>
              <p className="text-2xl font-semibold tabular-nums">{r.rate.toFixed(3)}</p>
              <div className="mt-1 flex items-center gap-1 text-xs">
                {r.trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                {r.trend === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
                {r.trend === "flat" && <Minus className="h-3 w-3 text-muted-foreground" />}
                <span
                  className={cn(
                    r.trend === "up" && "text-success",
                    r.trend === "down" && "text-destructive",
                    r.trend === "flat" && "text-muted-foreground"
                  )}
                >
                  {r.change24h >= 0 ? "+" : ""}{r.change24h.toFixed(3)} 24h
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-card">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total FX Exposure</p>
            <p className="text-2xl font-semibold">£{exposureGbp.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="rounded-card">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Unrealized FX P&L</p>
            <p className="text-2xl font-semibold text-destructive">
              −£{Math.abs(fxPnlGbp).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

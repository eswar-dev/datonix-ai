import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/common/components/ui/chart";

interface CostCompositionChartProps {
  costs: { employee: number; contractor: number; freelancer: number; other: number };
  currency?: string;
}

export function CostCompositionChart({ costs, currency = "GBP" }: CostCompositionChartProps) {
  const symbol = currency === "AED" ? "AED " : "£";
  const data = [
    { category: "Employee", value: costs.employee, fill: "hsl(var(--accent))" },
    { category: "Contractor", value: costs.contractor, fill: "hsl(var(--purple))" },
    { category: "Freelancer", value: costs.freelancer, fill: "hsl(var(--teal))" },
    { category: "Other", value: costs.other, fill: "hsl(var(--muted-foreground))" },
  ];

  const chartConfig = {
    value: { label: "Cost", color: "hsl(var(--accent))" },
    Employee: { label: "Employee", color: "hsl(var(--accent))" },
    Contractor: { label: "Contractor", color: "hsl(var(--purple))" },
    Freelancer: { label: "Freelancer", color: "hsl(var(--teal))" },
    Other: { label: "Other", color: "hsl(var(--muted-foreground))" },
  };

  return (
    <ChartContainer config={chartConfig} className="aspect-[2/1] max-h-[280px] w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="category" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}K`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => `${symbol}${Number(value).toLocaleString()}`}
            />
          }
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

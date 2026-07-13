import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/common/components/ui/chart";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { ExecutiveKpiGrid } from "@/domains/aec/components/ExecutiveKpiGrid";
import { AiAlertPanel } from "@/domains/aec/components/AiAlertPanel";
import { CostCompositionChart } from "@/domains/aec/components/CostCompositionChart";
import {
  costComposition,
  executiveAlerts,
  executiveKpis,
  revenueByEntity,
  utilizationTrend,
} from "@/domains/aec/data/dashboards";

export default function ExecutiveDashboard() {
  const costData = {
    employee: costComposition.find((c) => c.category === "Employee")!.amountGbp,
    contractor: costComposition.find((c) => c.category === "Contractor")!.amountGbp,
    freelancer: costComposition.find((c) => c.category === "Freelancer")!.amountGbp,
    other: costComposition.find((c) => c.category === "Other")!.amountGbp,
  };

  const revenueChartConfig = {
    revenueGbp: { label: "Revenue", color: "hsl(var(--accent))" },
  };

  const utilChartConfig = {
    value: { label: "Utilization %", color: "hsl(var(--teal))" },
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Executive Dashboard"
        subtitle="Group KPIs, cost composition, revenue by entity, and AI-driven alerts."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Executive" },
        ]}
      />

      <ExecutiveKpiGrid kpis={executiveKpis} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="text-base">Cost Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <CostCompositionChart costs={costData} />
          </CardContent>
        </Card>

        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="text-base">Revenue by Entity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="aspect-[2/1] max-h-[280px] w-full">
              <BarChart data={revenueByEntity} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="entity" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `£${(v / 1_000_000).toFixed(1)}M`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `£${Number(value).toLocaleString()}`}
                    />
                  }
                />
                <Bar dataKey="revenueGbp" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="text-base">Utilization Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={utilChartConfig} className="aspect-[2/1] max-h-[240px] w-full">
              <LineChart data={utilizationTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} domain={[65, 85]} tickFormatter={(v) => `${v}%`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--teal))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <AiAlertPanel alerts={executiveAlerts} />
      </div>
    </div>
  );
}

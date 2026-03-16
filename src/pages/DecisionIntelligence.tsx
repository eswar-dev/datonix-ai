import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Sparkles, ArrowRight, Save, X, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const inferences = [
  {
    title: "Seasonal revenue pattern detected",
    confidence: 87,
    snippet: "Q4 shows 23% higher revenue consistently across 3 years of data",
    impact: "High" as const,
  },
  {
    title: "Customer churn correlated with support tickets",
    confidence: 74,
    snippet: "Users with 3+ support tickets in 30 days have 5x churn probability",
    impact: "High" as const,
  },
  {
    title: "Inventory optimization opportunity",
    confidence: 65,
    snippet: "15% of SKUs account for 80% of carrying cost with low turnover",
    impact: "Med" as const,
  },
];

const recommendations = [
  { priority: "High", summary: "Implement proactive support outreach for high-ticket users", impact: "High" },
  { priority: "Med", summary: "Adjust Q1 inventory orders based on seasonal patterns", impact: "Med" },
  { priority: "Low", summary: "Review marketing spend allocation across channels", impact: "Low" },
];

const actions = [
  { id: "1", title: "Review revenue anomaly in APAC region", status: "New" as const, assignee: "Unassigned" },
  { id: "2", title: "Investigate supplier delivery delays", status: "New" as const, assignee: "Unassigned" },
  { id: "3", title: "Customer churn mitigation plan", status: "In Progress" as const, assignee: "Sarah K." },
  { id: "4", title: "Updated inventory safety stock levels", status: "Resolved" as const, assignee: "Mike T." },
];

const statusColor: Record<string, string> = {
  "New": "bg-accent/10 text-accent border-accent/20",
  "In Progress": "bg-warning/10 text-warning border-warning/20",
  "Resolved": "bg-success/10 text-success border-success/20",
};

type KanbanColumn = "New" | "In Progress" | "Resolved";

const initialKanban: Record<KanbanColumn, { id: string; title: string }[]> = {
  "New": [
    { id: "1", title: "Review revenue anomaly in APAC region" },
    { id: "2", title: "Investigate supplier delivery delays" },
  ],
  "In Progress": [
    { id: "3", title: "Customer churn mitigation plan" },
  ],
  "Resolved": [
    { id: "4", title: "Updated inventory safety stock levels" },
  ],
};

const impactColor: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Med: "bg-warning/10 text-warning border-warning/20",
  Low: "bg-success/10 text-success border-success/20",
};

export default function DecisionIntelligence() {
  const [tier] = useState<"lite" | "enterprise">("lite");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Decision Intelligence</h1>
        <Badge variant="secondary" className="text-xs">Lite Tier</Badge>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="rounded-button">
          <TabsTrigger value="insights" className="rounded-button">Insights</TabsTrigger>
          <TabsTrigger value="actions" className="rounded-button">Actions Tracker</TabsTrigger>
          <TabsTrigger value="agents" className="rounded-button">
            Agent Builder
            <Badge variant="outline" className="ml-1.5 text-[10px] border-purple text-purple">Enterprise</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {/* Inferences */}
          <div>
            <h2 className="mb-3 text-sm font-semibold">Pattern Inferences</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inferences.map((inf, i) => (
                <Card key={i} className="rounded-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-medium leading-tight">{inf.title}</h3>
                    <Badge variant="outline" className={impactColor[inf.impact]}>{inf.impact}</Badge>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Confidence</span>
                      <span>{inf.confidence}%</span>
                    </div>
                    <Progress value={inf.confidence} className="h-1.5" />
                  </div>
                  <p className="text-xs text-muted-foreground">{inf.snippet}</p>
                  <Button variant="outline" size="sm" className="w-full rounded-button text-xs">
                    Explain <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h2 className="mb-3 text-sm font-semibold">Recommendations</h2>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <Card key={i} className="flex items-center justify-between rounded-card p-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={impactColor[rec.priority]}>{rec.priority}</Badge>
                    <span className="text-sm">{rec.summary}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs rounded-button">
                      <Save className="mr-1 h-3 w-3" /> Save
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs rounded-button text-muted-foreground">
                      <X className="mr-1 h-3 w-3" /> Dismiss
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {(Object.keys(initialKanban) as KanbanColumn[]).map((col) => (
              <div key={col}>
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{col}</h3>
                  <Badge variant="secondary" className="text-[10px]">{initialKanban[col].length}</Badge>
                </div>
                <div className="space-y-2">
                  {initialKanban[col].map((item) => (
                    <Card key={item.id} className="flex items-center gap-2 rounded-card p-3 cursor-grab">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-xs">{item.title}</span>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agents">
          {tier === "lite" ? (
            <Card className="relative rounded-card overflow-hidden">
              <div className="p-12 blur-[2px] pointer-events-none opacity-50">
                <div className="h-64 rounded-card border-2 border-dashed border-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Agent Builder Canvas</p>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm">
                <Lock className="h-10 w-10 text-purple mb-3" />
                <Badge className="bg-purple text-purple-foreground mb-3">Enterprise</Badge>
                <p className="text-sm font-medium mb-1">Agent Builder is an Enterprise feature</p>
                <p className="text-xs text-muted-foreground mb-4">Build automated decision workflows with visual node graphs</p>
                <Button className="rounded-button bg-purple hover:bg-purple/90 text-purple-foreground">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Talk to Sales
                </Button>
              </div>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

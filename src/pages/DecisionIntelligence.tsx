import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Lock, Sparkles, ArrowRight, Save, X, CheckCircle2, Clock, AlertCircle,
  Lightbulb, Play, TrendingUp, BarChart3, Bot, Zap,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { roleData } from "@/data/roleData";

// ─── Insights data (static) ───
const inferences = [
  {
    title: "Seasonal revenue pattern detected",
    confidence: 87,
    snippet: "Q4 shows 23% higher revenue consistently across 3 years of data",
    impact: "High" as const,
    explanation: {
      summary: "A strong seasonal revenue pattern has been identified, with Q4 consistently outperforming other quarters by approximately 23% over a 3-year period.",
      methodology: "Time-series decomposition was applied to monthly revenue data from Jan 2023 – Dec 2025. The model separated trend, seasonal, and residual components using STL decomposition with a 12-month seasonal window.",
      keyFindings: [
        "Q4 revenue averages $2.4M compared to $1.95M across Q1–Q3.",
        "The seasonal uplift is strongest in November (28% above mean) and December (31% above mean).",
        "October shows a ramp-up effect with 12% above the quarterly average.",
        "The pattern has strengthened year-over-year, growing from 18% uplift in 2023 to 27% in 2025.",
      ],
      dataPoints: "36 monthly data points analyzed across 4 revenue streams (Product Sales, Subscriptions, Services, Licensing).",
      businessImplications: [
        "Allocate additional inventory and staffing resources for Q4 to capture maximum demand.",
        "Front-load marketing spend in September to capitalize on the October ramp-up.",
        "Adjust annual forecasting models to account for seasonal weighting.",
        "Consider running promotional campaigns in Q1–Q2 to smooth revenue distribution.",
      ],
      limitations: "The model assumes historical patterns will continue. External factors such as economic downturns, new competitors, or regulatory changes could alter the pattern. 3 years of data provides moderate confidence; 5+ years would strengthen the finding.",
    },
  },
  {
    title: "Customer churn correlated with support tickets",
    confidence: 74,
    snippet: "Users with 3+ support tickets in 30 days have 5x churn probability",
    impact: "High" as const,
    explanation: {
      summary: "A significant correlation has been found between support ticket frequency and customer churn, where users submitting 3 or more tickets within a 30-day window are 5 times more likely to cancel their subscription.",
      methodology: "Logistic regression and survival analysis were applied to 18 months of customer data (N=12,450 users). Support ticket counts were binned into frequency buckets and cross-referenced with churn events within 60-day follow-up windows.",
      keyFindings: [
        "Users with 0–1 tickets/month have a 4.2% churn rate.",
        "Users with 2 tickets/month have an 8.7% churn rate (2.1x baseline).",
        "Users with 3+ tickets/month have a 21.3% churn rate (5.1x baseline).",
        "The most common ticket categories preceding churn are: Billing Issues (34%), Product Bugs (28%), and Feature Requests (22%).",
      ],
      dataPoints: "12,450 user accounts analyzed with 47,800 support tickets over 18 months. 1,890 churn events recorded.",
      businessImplications: [
        "Implement proactive outreach when a user files their 2nd ticket within 30 days.",
        "Create a dedicated retention team for high-ticket users.",
        "Prioritize fixing product bugs that generate repeat tickets.",
        "Offer service credits or dedicated support for at-risk accounts.",
      ],
      limitations: "Correlation does not imply causation — high ticket volume may indicate engaged users facing issues, not necessarily dissatisfied users. Further A/B testing of interventions is recommended.",
    },
  },
  {
    title: "Inventory optimization opportunity",
    confidence: 65,
    snippet: "15% of SKUs account for 80% of carrying cost with low turnover",
    impact: "Med" as const,
    explanation: {
      summary: "An ABC analysis reveals that 15% of SKUs contribute to 80% of total carrying costs while maintaining below-average inventory turnover rates, indicating significant optimization potential.",
      methodology: "Pareto analysis combined with inventory turnover ratio calculations across all 3,200 SKUs. Carrying costs include warehousing, insurance, depreciation, and opportunity cost of capital at 8% annual rate.",
      keyFindings: [
        "480 SKUs (15%) account for $3.2M in annual carrying costs out of $4M total.",
        "These high-cost SKUs have an average turnover ratio of 2.1x vs. the company average of 6.8x.",
        "72% of these slow-moving SKUs have not been reordered in the past 90 days.",
        "Potential annual savings of $800K–$1.2M through inventory right-sizing.",
      ],
      dataPoints: "3,200 SKUs analyzed across 5 warehouse locations. 24 months of sales and inventory movement data.",
      businessImplications: [
        "Implement safety stock recalculations for the identified 480 SKUs.",
        "Negotiate return or markdown agreements with suppliers for excess stock.",
        "Transition slow-moving items to just-in-time ordering where supplier lead times allow.",
        "Review product lifecycle status — some SKUs may be candidates for discontinuation.",
      ],
      limitations: "Analysis does not account for strategic inventory (safety stock for critical items) or items with long lead times that require buffer stock. Seasonal demand variations for specific SKUs need individual review.",
    },
  },
];

const insightRecommendations = [
  { priority: "High", summary: "Implement proactive support outreach for high-ticket users" },
  { priority: "Med", summary: "Adjust Q1 inventory orders based on seasonal patterns" },
  { priority: "Low", summary: "Review marketing spend allocation across channels" },
];

const insightActions = [
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

const impactColor: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Med: "bg-warning/10 text-warning border-warning/20",
  Low: "bg-success/10 text-success border-success/20",
};

const urgencyColor: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Med: "bg-warning/10 text-warning border-warning/20",
  Low: "bg-muted text-muted-foreground",
};

function confidenceColor(c: number) {
  if (c >= 85) return "text-success";
  if (c >= 70) return "text-warning";
  return "text-destructive";
}

// ─── Missing Values data ───
const missingValuesData = [
  { vin: "YK5W305D0PS263028", timestamp: "2026-01-16T17:50:54.025", engine_speed: 1834.5, engine_load: 0, vehicle_speed: 3.691, fuel_rate: 0, engine_hours: 3477600 },
  { vin: "YK5W305D0PS263028", timestamp: "2026-01-16T17:50:43.993", engine_speed: 1910, engine_load: 0, vehicle_speed: 8.33, fuel_rate: 0, engine_hours: 3477600 },
  { vin: "YK5W305D0PS263028", timestamp: "2026-01-16T17:50:33.961", engine_speed: 1727.5, engine_load: 0, vehicle_speed: 9.904, fuel_rate: 0, engine_hours: 3477600 },
  { vin: "YK5W305D0PS263028", timestamp: "2026-01-16T17:49:43.796", engine_speed: 1570, engine_load: 100, vehicle_speed: 9.948, fuel_rate: 0, engine_hours: 3477600 },
  { vin: "YK5W305D0PS263028", timestamp: "2026-01-16T17:46:43.163", engine_speed: 1854.5, engine_load: 0, vehicle_speed: 11.668, fuel_rate: 0, engine_hours: 3477600 },
  { vin: "YK5W305D0PS263028", timestamp: "2026-01-16T17:46:03.034", engine_speed: 1748, engine_load: 0, vehicle_speed: 10.882, fuel_rate: 0, engine_hours: 3477600 },
  { vin: "YK5W305D0PS263028", timestamp: "2026-01-16T17:45:52.996", engine_speed: 1861, engine_load: 0, vehicle_speed: 11.504, fuel_rate: 0, engine_hours: 3477600 },
  { vin: "YK5W305D0PS263028", timestamp: "2026-01-16T17:45:42.970", engine_speed: 1769, engine_load: 0, vehicle_speed: 10.913, fuel_rate: 0, engine_hours: 3477600 },
];

// ─── Forecast data ───
const forecastChartData = [
  { date: "2025-01-24", value: 1411.0 },
  { date: "2025-01-25", value: 1411.1 },
  { date: "2025-01-26", value: 1411.0 },
  { date: "2025-01-27", value: 1411.05 },
  { date: "2025-01-28", value: 1411.1 },
];

// ─── Prediction data ───
const outputLevels = [
  { level: "LOW", range: "0 – 752" },
  { level: "MEDIUM", range: "752 – 1608" },
  { level: "HIGH", range: "1608 – 1837.5" },
  { level: "CRITICAL", range: "1837.5 – 2794.5" },
];

export default function DecisionIntelligence() {
  const { user } = useAuth();
  const [tier] = useState<"lite" | "enterprise">("lite");
  const [viewOption, setViewOption] = useState("missing");
  const [explainIndex, setExplainIndex] = useState<number | null>(null);

  // Prediction state
  const [predictionRun, setPredictionRun] = useState(false);
  const [predTargetCol, setPredTargetCol] = useState("engine_speed");
  const [predForm, setPredForm] = useState({
    vin: "YK5W305D0PS263028",
    timestamp: "09/01/2026, 07:04 AM",
    engine_load: "0",
    vehicle_speed: "2.785",
    fuel_rate: "0",
    engine_hours: "3434400",
  });

  // Forecast state
  const [forecastRun, setForecastRun] = useState(false);
  const [forecastTarget, setForecastTarget] = useState("engine_speed");
  const [forecastFreq, setForecastFreq] = useState("Days");
  const [forecastPeriod, setForecastPeriod] = useState("5 days");

  if (!user) return null;
  const data = roleData[user.role].decisionIntelligence;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Decision Intelligence</h1>
        <Badge variant="secondary" className="text-xs">Lite Tier</Badge>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="rounded-button">
          <TabsTrigger value="insights" className="rounded-button">Insights</TabsTrigger>
          <TabsTrigger value="missing" className="rounded-button">Missing Value Treatment</TabsTrigger>
          <TabsTrigger value="prediction" className="rounded-button">Prediction</TabsTrigger>
          <TabsTrigger value="forecast" className="rounded-button">Forecast</TabsTrigger>
          <TabsTrigger value="agents" className="rounded-button">
            Agent Builder
            <Badge variant="outline" className="ml-1.5 text-[10px] border-purple text-purple">Enterprise</Badge>
          </TabsTrigger>
        </TabsList>

        {/* ─── Insights Tab ─── */}
        <TabsContent value="insights" className="space-y-6">
          {explainIndex !== null ? (
            (() => {
              const inf = inferences[explainIndex];
              const exp = inf.explanation;
              return (
                <div className="space-y-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-button text-xs text-muted-foreground"
                    onClick={() => setExplainIndex(null)}
                  >
                    <ArrowRight className="mr-1 h-3 w-3 rotate-180" /> Back to Insights
                  </Button>

                  <Card className="rounded-card p-6 space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">{inf.title}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{exp.summary}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={impactColor[inf.impact]}>{inf.impact} Impact</Badge>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{inf.confidence}% Confidence</Badge>
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <Card className="rounded-card border p-5 space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" /> Methodology
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{exp.methodology}</p>
                        <div className="rounded-button bg-muted/30 border p-3">
                          <p className="text-[11px] text-muted-foreground"><span className="font-semibold text-foreground">Data Scope:</span> {exp.dataPoints}</p>
                        </div>
                      </Card>

                      <Card className="rounded-card border p-5 space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-warning" /> Key Findings
                        </h3>
                        <ul className="space-y-2">
                          {exp.keyFindings.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>

                    <Card className="rounded-card border p-5 space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" /> Business Implications
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {exp.businessImplications.map((impl, i) => (
                          <div key={i} className="flex items-start gap-2.5 rounded-button border bg-muted/20 p-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                            <p className="text-xs text-muted-foreground">{impl}</p>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="rounded-card border border-warning/20 bg-warning/5 p-5 space-y-2">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-warning" /> Limitations & Caveats
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{exp.limitations}</p>
                    </Card>
                  </Card>
                </div>
              );
            })()
          ) : (
            <>
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
                          <span>Confidence</span><span>{inf.confidence}%</span>
                        </div>
                        <Progress value={inf.confidence} className="h-1.5" />
                      </div>
                      <p className="text-xs text-muted-foreground">{inf.snippet}</p>
                      <Button variant="outline" size="sm" className="w-full rounded-button text-xs" onClick={() => setExplainIndex(i)}>
                        Explain <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-sm font-semibold">Actions</h2>
                <div className="space-y-2">
                  {insightActions.map((action) => {
                    const StatusIcon = action.status === "Resolved" ? CheckCircle2 : action.status === "In Progress" ? Clock : AlertCircle;
                    return (
                      <Card key={action.id} className="flex items-center justify-between rounded-card p-4">
                        <div className="flex items-center gap-3">
                          <StatusIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">{action.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{action.assignee}</span>
                          <Badge variant="outline" className={statusColor[action.status]}>{action.status}</Badge>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-sm font-semibold">Recommendations</h2>
                <div className="space-y-2">
                  {insightRecommendations.map((rec, i) => (
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

              {/* Role-Dynamic: Active AI Agents */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <Bot className="h-4 w-4 text-accent" />
                  Active AI Agents
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {data.agents.map((agent) => (
                    <Card key={agent.name} className="rounded-card p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-accent" />
                          <p className="text-sm font-semibold">{agent.name}</p>
                        </div>
                        <Badge
                          variant={agent.status === "Active" ? "secondary" : "outline"}
                          className={`text-[10px] ${agent.status === "Active" ? "bg-success/10 text-success border-success/20" : ""}`}
                        >
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{agent.trigger}</p>
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Confidence</span>
                          <span className={confidenceColor(agent.confidence)}>{agent.confidence}%</span>
                        </div>
                        <Progress value={agent.confidence} className="h-1.5" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Last fired: {agent.lastFired}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Role-Dynamic: Decision Recommendations */}
              <div>
                <h2 className="mb-4 text-sm font-semibold">Decision Recommendations</h2>
                <Card className="rounded-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pillar</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Recommendation</TableHead>
                        <TableHead className="text-center">Confidence</TableHead>
                        <TableHead className="text-center">Urgency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.decisions.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-sm">{d.pillar}</TableCell>
                          <TableCell className="text-sm">{d.question}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{d.recommendation}</TableCell>
                          <TableCell className="text-center">
                            <span className={`font-semibold text-sm ${confidenceColor(d.confidence)}`}>
                              {d.confidence}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={urgencyColor[d.urgency]}>{d.urgency}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ─── Missing Value Treatment Tab ─── */}
        <TabsContent value="missing" className="space-y-6">
          <Card className="rounded-card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Missing Values Analysis</h2>

            <div className="flex items-center gap-3">
              <Label className="text-xs font-medium text-muted-foreground">View Options</Label>
              <Select value={viewOption} onValueChange={setViewOption}>
                <SelectTrigger className="w-64 rounded-button">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-warning" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="missing">Only Missing Rows (500)</SelectItem>
                  <SelectItem value="all">All Rows</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-card border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold text-primary">vin</TableHead>
                    <TableHead className="text-xs font-semibold text-primary">timestampmessage</TableHead>
                    <TableHead className="text-xs font-semibold text-primary">engine_speed</TableHead>
                    <TableHead className="text-xs font-semibold text-primary">engine_load</TableHead>
                    <TableHead className="text-xs font-semibold text-primary">vehicle_speed</TableHead>
                    <TableHead className="text-xs font-semibold text-primary">fuel_rate</TableHead>
                    <TableHead className="text-xs font-semibold text-primary">engine_hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missingValuesData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-mono">{row.vin}</TableCell>
                      <TableCell className="text-xs">{row.timestamp}</TableCell>
                      <TableCell className="text-xs">{row.engine_speed}</TableCell>
                      <TableCell className="text-xs">{row.engine_load}</TableCell>
                      <TableCell className="text-xs">{row.vehicle_speed}</TableCell>
                      <TableCell className={`text-xs font-semibold ${row.fuel_rate === 0 ? "text-destructive bg-destructive/5" : ""}`}>
                        {row.fuel_rate}
                      </TableCell>
                      <TableCell className="text-xs">{row.engine_hours}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ─── Prediction Tab ─── */}
        <TabsContent value="prediction" className="space-y-6">
          <Card className="rounded-card p-6 space-y-5">
            <p className="text-sm text-muted-foreground">Categorize data into distinct groups using supervised learning</p>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Target Column</Label>
                <Select value={predTargetCol} onValueChange={setPredTargetCol}>
                  <SelectTrigger className="mt-1.5 rounded-button">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engine_speed">engine_speed</SelectItem>
                    <SelectItem value="vehicle_speed">vehicle_speed</SelectItem>
                    <SelectItem value="fuel_rate">fuel_rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => setPredictionRun(true)}
                className="w-full rounded-button bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Play className="mr-2 h-4 w-4" />
                Run Prediction Analysis
              </Button>
            </div>
          </Card>

          {predictionRun && (
            <Card className="rounded-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Prediction Analysis</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Model Status: Successfully Trained
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-card border p-5 space-y-4">
                  <h3 className="text-sm font-semibold">Enter Values for Engine Speed Prediction:</h3>
                  {Object.entries(predForm).map(([key, val]) => (
                    <div key={key}>
                      <Label className="text-xs font-medium capitalize">{key.replace(/_/g, " ")}</Label>
                      <Input
                        value={val}
                        onChange={(e) => setPredForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="mt-1 rounded-button"
                      />
                    </div>
                  ))}
                  <Button className="w-full rounded-button bg-primary hover:bg-primary/90">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Get Prediction
                  </Button>
                </Card>

                <div className="space-y-4">
                  <Card className="rounded-card border p-5 space-y-3">
                    <h3 className="text-sm font-semibold">Output Levels</h3>
                    <div className="rounded-button border p-3 text-xs text-muted-foreground bg-muted/20">
                      Value: Predicted engine speed is <span className="font-semibold text-foreground">1454.62</span>
                    </div>
                    <Badge className="bg-warning/15 text-warning border-warning/30">Predicted: Medium</Badge>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Level</TableHead>
                          <TableHead className="text-xs">Range</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {outputLevels.map((l) => (
                          <TableRow key={l.level}>
                            <TableCell className="text-xs font-semibold">{l.level}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{l.range}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>

                  <Card className="rounded-card border p-5 space-y-2">
                    <h3 className="text-sm font-semibold">Prediction Result</h3>
                    <p className="text-xs text-muted-foreground">Engine Speed</p>
                    <div className="rounded-card bg-primary/5 border border-primary/20 p-6 text-center">
                      <p className="text-xl font-bold text-primary">Predicted engine_speed value is 1454.62</p>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ─── Forecast Tab ─── */}
        <TabsContent value="forecast" className="space-y-6">
          <Card className="rounded-card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Time Series Forecasting</h2>
            <p className="text-sm text-muted-foreground">Generate time-based forecasts to predict future trends</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Target Column</Label>
                <Select value={forecastTarget} onValueChange={setForecastTarget}>
                  <SelectTrigger className="mt-1.5 rounded-button">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engine_speed">engine_speed</SelectItem>
                    <SelectItem value="vehicle_speed">vehicle_speed</SelectItem>
                    <SelectItem value="fuel_rate">fuel_rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Frequency</Label>
                <Select value={forecastFreq} onValueChange={setForecastFreq}>
                  <SelectTrigger className="mt-1.5 rounded-button">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hours">Hours</SelectItem>
                    <SelectItem value="Days">Days</SelectItem>
                    <SelectItem value="Weeks">Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Forecast Period</Label>
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger className="mt-1.5 rounded-button w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 day">1 day</SelectItem>
                  <SelectItem value="5 days">5 days</SelectItem>
                  <SelectItem value="2 weeks">2 weeks</SelectItem>
                  <SelectItem value="1 month">1 month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => setForecastRun(true)}
              className="w-full rounded-button bg-primary hover:bg-primary/90"
              size="lg"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Run Forecast Analysis
            </Button>
          </Card>

          {forecastRun && (
            <Card className="rounded-card p-6 space-y-6">
              <h2 className="text-lg font-semibold">Time Series Forecast Results</h2>

              <Card className="rounded-card border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-primary">Business Insights:</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      This forecast analysis predicts future trends for <span className="font-semibold text-foreground">{forecastTarget}</span> over the next {forecastPeriod}. The model identifies seasonal patterns, trends, and potential future values to support strategic planning and resource allocation.
                    </p>
                  </div>
                </div>
              </Card>

              <div>
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Forecast Status: Successfully Generated
                </p>

                <Card className="rounded-card border p-5">
                  <h3 className="text-sm font-semibold mb-4">Forecasted {forecastTarget} values Over Time</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={forecastChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          stroke="hsl(var(--muted-foreground))"
                          angle={-30}
                          textAnchor="end"
                          height={60}
                          label={{ value: "Date", position: "insideBottom", offset: -5, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          stroke="hsl(var(--muted-foreground))"
                          domain={["dataMin - 1", "dataMax + 1"]}
                          label={{ value: "Values", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", r: 4 }}
                          name={forecastTarget}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ─── Agent Builder (Enterprise locked) ─── */}
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

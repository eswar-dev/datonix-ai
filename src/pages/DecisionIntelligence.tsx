import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Lock, Sparkles, ArrowRight, Save, X, CheckCircle2, Clock, AlertCircle,
  Lightbulb, Play, TrendingUp, BarChart3, Bot, Zap, Info,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { roleData } from "@/data/machineData";

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

export default function DecisionIntelligence() {
  const { user } = useAuth();
  const role = user?.role ?? "datapx_user";
  const data = roleData[role].decisionIntelligence;

  const [tier] = useState<"lite" | "enterprise">("lite");
  const [viewOption, setViewOption] = useState("missing");
  const [explainIndex, setExplainIndex] = useState<number | null>(null);
  const [predictionRun, setPredictionRun] = useState(false);
  const [forecastRun, setForecastRun] = useState(false);
  const [predTargetCol, setPredTargetCol] = useState(data.prediction.defaultTarget);
  const [predForm, setPredForm] = useState(() =>
    Object.fromEntries(data.prediction.inputFields.map((f) => [f.key, f.defaultValue]))
  );
  const [forecastTarget, setForecastTarget] = useState(data.forecast.defaultTarget);
  const [forecastFreq, setForecastFreq] = useState("Days");
  const [forecastPeriod, setForecastPeriod] = useState("5 days");

  if (!user) return null;

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
              const inf = data.inferences[explainIndex];
              const exp = inf.explanation;
              return (
                <div className="space-y-6">
                  <Button variant="ghost" size="sm" className="rounded-button text-xs text-muted-foreground" onClick={() => setExplainIndex(null)}>
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
                        <h3 className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Methodology</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{exp.methodology}</p>
                        <div className="rounded-button bg-muted/30 border p-3">
                          <p className="text-[11px] text-muted-foreground"><span className="font-semibold text-foreground">Data Scope:</span> {exp.dataPoints}</p>
                        </div>
                      </Card>
                      <Card className="rounded-card border p-5 space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4 text-warning" /> Key Findings</h3>
                        <ul className="space-y-2">
                          {exp.keyFindings.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" /><span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                    <Card className="rounded-card border p-5 space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Business Implications</h3>
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
                      <h3 className="text-sm font-semibold flex items-center gap-2"><AlertCircle className="h-4 w-4 text-warning" /> Limitations & Caveats</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{exp.limitations}</p>
                    </Card>
                  </Card>
                </div>
              );
            })()
          ) : (
            <>
              {/* Pattern Inferences */}
              <div>
                <h2 className="mb-3 text-sm font-semibold">Pattern Inferences</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.inferences.map((inf, i) => (
                    <Card key={i} className="rounded-card p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-medium leading-tight">{inf.title}</h3>
                        <Badge variant="outline" className={impactColor[inf.impact]}>{inf.impact}</Badge>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1"><span>Confidence</span><span>{inf.confidence}%</span></div>
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

              {/* Actions */}
              <div>
                <h2 className="mb-3 text-sm font-semibold">Actions</h2>
                <div className="space-y-2">
                  {data.insightActions.map((action) => {
                    const StatusIcon = action.status === "Resolved" ? CheckCircle2 : action.status === "In Progress" ? Clock : AlertCircle;
                    return (
                      <Card key={action.id} className="flex items-center justify-between rounded-card p-4">
                        <div className="flex items-center gap-3"><StatusIcon className="h-4 w-4 text-muted-foreground shrink-0" /><span className="text-sm">{action.title}</span></div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{action.assignee}</span>
                          <Badge variant="outline" className={statusColor[action.status]}>{action.status}</Badge>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h2 className="mb-3 text-sm font-semibold">Recommendations</h2>
                <div className="space-y-2">
                  {data.insightRecommendations.map((rec, i) => (
                    <Card key={i} className="flex items-center justify-between rounded-card p-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={impactColor[rec.priority]}>{rec.priority}</Badge>
                        <span className="text-sm">{rec.summary}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs rounded-button"><Save className="mr-1 h-3 w-3" /> Save</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs rounded-button text-muted-foreground"><X className="mr-1 h-3 w-3" /> Dismiss</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Active AI Agents */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Bot className="h-4 w-4 text-accent" /> Active AI Agents</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {data.agents.map((agent) => (
                    <Card key={agent.name} className="rounded-card p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-accent" /><p className="text-sm font-semibold">{agent.name}</p></div>
                        <Badge variant={agent.status === "Active" ? "secondary" : "outline"} className={`text-[10px] ${agent.status === "Active" ? "bg-success/10 text-success border-success/20" : ""}`}>{agent.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{agent.trigger}</p>
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1"><span>Confidence</span><span className={confidenceColor(agent.confidence)}>{agent.confidence}%</span></div>
                        <Progress value={agent.confidence} className="h-1.5" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Last fired: {agent.lastFired}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Decision Recommendations Table */}
              <div>
                <h2 className="mb-4 text-sm font-semibold">Decision Recommendations</h2>
                <Card className="rounded-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pillar</TableHead><TableHead>Question</TableHead><TableHead>Recommendation</TableHead>
                        <TableHead className="text-center">Confidence</TableHead><TableHead className="text-center">Urgency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.decisions.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-sm">{d.pillar}</TableCell>
                          <TableCell className="text-sm">{d.question}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{d.recommendation}</TableCell>
                          <TableCell className="text-center"><span className={`font-semibold text-sm ${confidenceColor(d.confidence)}`}>{d.confidence}%</span></TableCell>
                          <TableCell className="text-center"><Badge variant="outline" className={urgencyColor[d.urgency]}>{d.urgency}</Badge></TableCell>
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
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-warning" /><SelectValue /></div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="missing">Only Missing Rows ({data.missingValues.totalMissing})</SelectItem>
                  <SelectItem value="all">All Rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-card border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    {data.missingValues.columns.map((col) => (
                      <TableHead key={col} className="text-xs font-semibold text-primary">{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.missingValues.rows.map((row, i) => (
                    <TableRow key={i}>
                      {data.missingValues.columns.map((col) => {
                        const val = row.columns[col];
                        const isHighlighted = row.highlightColumn === col || (data.missingValues.highlightColumn === col && (val === 0 || val === "0"));
                        return (
                          <TableCell key={col} className={`text-xs ${isHighlighted ? "font-semibold text-destructive bg-destructive/5" : ""}`}>
                            {val !== undefined ? String(val) : "—"}
                          </TableCell>
                        );
                      })}
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
                  <SelectTrigger className="mt-1.5 rounded-button"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {data.prediction.targetColumns.map((col) => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setPredictionRun(true)} className="w-full rounded-button bg-primary hover:bg-primary/90" size="lg">
                <Play className="mr-2 h-4 w-4" /> Run Prediction Analysis
              </Button>
            </div>
          </Card>

          {predictionRun && (
            <Card className="rounded-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Prediction Analysis</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1"><CheckCircle2 className="h-4 w-4 text-success" /> Model Status: Successfully Trained</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-card border p-5 space-y-4">
                  <h3 className="text-sm font-semibold">Enter Values for {predTargetCol} Prediction:</h3>
                  {data.prediction.inputFields.map((field) => (
                    <div key={field.key}>
                      <Label className="text-xs font-medium capitalize">{field.key.replace(/_/g, " ")}</Label>
                      <Input value={predForm[field.key] || field.defaultValue} onChange={(e) => setPredForm((f) => ({ ...f, [field.key]: e.target.value }))} className="mt-1 rounded-button" />
                    </div>
                  ))}
                  <Button className="w-full rounded-button bg-primary hover:bg-primary/90"><TrendingUp className="mr-2 h-4 w-4" /> Get Prediction</Button>
                </Card>
                <div className="space-y-4">
                  <Card className="rounded-card border p-5 space-y-3">
                    <h3 className="text-sm font-semibold">Output Levels</h3>
                    <div className="rounded-button border p-3 text-xs text-muted-foreground bg-muted/20">
                      Value: Predicted {predTargetCol} is <span className="font-semibold text-foreground">{data.prediction.predictedValue}</span>
                    </div>
                    <Badge className="bg-warning/15 text-warning border-warning/30">Predicted: {data.prediction.predictedLabel}</Badge>
                    <Table>
                      <TableHeader><TableRow><TableHead className="text-xs">Level</TableHead><TableHead className="text-xs">Range</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {data.prediction.outputLevels.map((l) => (
                          <TableRow key={l.level}><TableCell className="text-xs font-semibold">{l.level}</TableCell><TableCell className="text-xs text-muted-foreground">{l.range}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                  <Card className="rounded-card border p-5 space-y-2">
                    <h3 className="text-sm font-semibold">Prediction Result</h3>
                    <p className="text-xs text-muted-foreground">{predTargetCol}</p>
                    <div className="rounded-card bg-primary/5 border border-primary/20 p-6 text-center">
                      <p className="text-xl font-bold text-primary">Predicted {predTargetCol} value is {data.prediction.predictedValue}</p>
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
                  <SelectTrigger className="mt-1.5 rounded-button"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {data.forecast.targetColumns.map((col) => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Frequency</Label>
                <Select value={forecastFreq} onValueChange={setForecastFreq}>
                  <SelectTrigger className="mt-1.5 rounded-button"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Hours">Hours</SelectItem><SelectItem value="Days">Days</SelectItem><SelectItem value="Weeks">Weeks</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Forecast Period</Label>
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger className="mt-1.5 rounded-button w-48"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="1 day">1 day</SelectItem><SelectItem value="5 days">5 days</SelectItem><SelectItem value="2 weeks">2 weeks</SelectItem><SelectItem value="1 month">1 month</SelectItem></SelectContent>
              </Select>
            </div>
            <Button onClick={() => setForecastRun(true)} className="w-full rounded-button bg-primary hover:bg-primary/90" size="lg">
              <BarChart3 className="mr-2 h-4 w-4" /> Run Forecast Analysis
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
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{data.forecast.insightText}</p>
                  </div>
                </div>
              </Card>
              <div>
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Forecast Status: Successfully Generated</p>
                <Card className="rounded-card border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Forecasted {forecastTarget} values Over Time</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-[300px]">
                          <p className="text-xs leading-relaxed">{data.forecast.insightText}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.forecast.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" angle={-30} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={["dataMin - 1", "dataMax + 1"]} />
                        <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} name={forecastTarget} />
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
                <Button className="rounded-button bg-purple hover:bg-purple/90 text-purple-foreground"><Sparkles className="mr-2 h-4 w-4" /> Talk to Sales</Button>
              </div>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sparkles, ArrowLeft, ArrowRight, Play, TrendingUp, TrendingDown, Minus,
  BarChart3, CheckCircle2, Lightbulb, Info, Send, ThumbsUp, ThumbsDown,
  Target, AlertTriangle, Bot, MessageSquareText, TableIcon,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { roleData, kpiCatalog, outlierConfig, type BotResponse, type KpiCard } from "@/data/machineData";

const promptTypeIcon = {
  text: MessageSquareText,
  table: TableIcon,
  chart: BarChart3,
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "chart" | "table";
  response?: BotResponse;
}

// ─── KPI Tab ────────────────────────────────────────────────────────────────
function KpiPanel() {
  const [selected, setSelected] = useState<KpiCard | null>(null);
  const [prompt, setPrompt] = useState("");

  if (selected) {
    const TrendIcon = selected.trend === "up" ? TrendingUp : selected.trend === "down" ? TrendingDown : Minus;
    const trendColor = selected.trend === "up" ? "text-success" : selected.trend === "down" ? "text-destructive" : "text-muted-foreground";

    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="rounded-button text-xs text-muted-foreground" onClick={() => setSelected(null)}>
          <ArrowLeft className="mr-1 h-3 w-3" /> Back to KPIs
        </Button>

        <Card className="rounded-card p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{selected.title}</h2>
              <p className="text-xs text-muted-foreground mt-1">Column: <span className="font-mono text-foreground">{selected.column}</span></p>
            </div>
            <Badge variant="outline" className={`text-xs ${trendColor}`}>
              <TrendIcon className="mr-1 h-3 w-3" /> {selected.delta}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{selected.value}</span>
            <span className="text-sm text-muted-foreground">{selected.unit}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="rounded-card p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent" /> Trend Over Time
            </h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selected.series.map(s => ({ name: s.label, value: s.value }))}>
                  <defs>
                    <linearGradient id="kpiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#kpiGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-card p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Calculation Logic
            </h3>
            <div className="rounded-button border bg-muted/30 p-4">
              <p className="text-xs font-mono text-foreground leading-relaxed">{selected.logic}</p>
            </div>
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Source Column</span>
                <span className="font-mono">{selected.column}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Current Value</span>
                <span className="font-semibold">{selected.value} {selected.unit}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Period Change</span>
                <span className={`font-semibold ${trendColor}`}>{selected.delta}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-card p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-center">KPI Generator</h2>
        <div className="flex gap-2 max-w-2xl mx-auto w-full">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt"
            className="rounded-input"
          />
          <Button className="rounded-button bg-primary hover:bg-primary/90 px-6">
            Generate KPIs
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Below are the suggested {kpiCatalog.length} KPIs based on the input data.</p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCatalog.map((kpi) => (
          <Card
            key={kpi.id}
            onClick={() => setSelected(kpi)}
            className="rounded-card p-5 space-y-3 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all"
          >
            <h3 className="text-base font-semibold">{kpi.title}</h3>
            <div className="border-t pt-3 space-y-2">
              <div className="flex gap-3 text-xs">
                <span className="text-muted-foreground w-16 shrink-0">Column:</span>
                <span className="font-mono text-foreground">{kpi.column}</span>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-muted-foreground w-16 shrink-0">Logic:</span>
                <span className="text-muted-foreground leading-relaxed">{kpi.logic}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Modelling Tab ──────────────────────────────────────────────────────────
function ModellingPanel() {
  const { user } = useAuth();
  const role = user?.role ?? "datapx_user";
  const data = roleData[role].decisionIntelligence;

  const [predictionRun, setPredictionRun] = useState(false);
  const [forecastRun, setForecastRun] = useState(false);
  const [outlierRun, setOutlierRun] = useState(false);
  const [predTargetCol, setPredTargetCol] = useState(data.prediction.defaultTarget);
  const [predForm, setPredForm] = useState(() =>
    Object.fromEntries(data.prediction.inputFields.map((f) => [f.key, f.defaultValue]))
  );
  const [forecastTarget, setForecastTarget] = useState(data.forecast.defaultTarget);
  const [forecastFreq, setForecastFreq] = useState("Days");
  const [forecastPeriod, setForecastPeriod] = useState("5 days");
  const [outlierTarget, setOutlierTarget] = useState(outlierConfig.defaultTarget);

  return (
    <Tabs defaultValue="prediction" className="space-y-4">
      <TabsList className="rounded-button">
        <TabsTrigger value="prediction" className="rounded-button">Prediction</TabsTrigger>
        <TabsTrigger value="forecast" className="rounded-button">Forecast</TabsTrigger>
        <TabsTrigger value="outlier" className="rounded-button">Outlier Detection</TabsTrigger>
      </TabsList>

      {/* Prediction */}
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
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="h-4 w-4 text-success" /> Model Status: Successfully Trained
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-card border p-5 space-y-4">
                <h3 className="text-sm font-semibold">Enter Values for {predTargetCol} Prediction:</h3>
                {data.prediction.inputFields.map((field) => (
                  <div key={field.key}>
                    <Label className="text-xs font-medium capitalize">{field.key.replace(/_/g, " ")}</Label>
                    <Input
                      value={predForm[field.key] || field.defaultValue}
                      onChange={(e) => setPredForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      className="mt-1 rounded-button"
                    />
                  </div>
                ))}
                <Button className="w-full rounded-button bg-primary hover:bg-primary/90">
                  <TrendingUp className="mr-2 h-4 w-4" /> Get Prediction
                </Button>
              </Card>
              <div className="space-y-4">
                <Card className="rounded-card border p-5 space-y-3">
                  <h3 className="text-sm font-semibold">Output Levels</h3>
                  <div className="rounded-button border p-3 text-xs text-muted-foreground bg-muted/20">
                    Value: Predicted {predTargetCol} is <span className="font-semibold text-foreground">{data.prediction.predictedValue}</span>
                  </div>
                  <Badge className="bg-warning/15 text-warning border-warning/30">Predicted: {data.prediction.predictedLabel}</Badge>
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead className="text-xs">Level</TableHead><TableHead className="text-xs">Range</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.prediction.outputLevels.map((l) => (
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

      {/* Forecast */}
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
              <SelectTrigger className="mt-1.5 rounded-button w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1 day">1 day</SelectItem>
                <SelectItem value="5 days">5 days</SelectItem>
                <SelectItem value="2 weeks">2 weeks</SelectItem>
                <SelectItem value="1 month">1 month</SelectItem>
              </SelectContent>
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
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Forecast Status: Successfully Generated
              </p>
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

      {/* Outlier Detection */}
      <TabsContent value="outlier" className="space-y-6">
        <Card className="rounded-card p-6 space-y-5">
          <h2 className="text-lg font-semibold">Outlier Detection</h2>
          <p className="text-sm text-muted-foreground">
            Detect anomalies in your data using the Interquartile Range (IQR) method
          </p>
          <div>
            <Label className="text-sm font-medium">Target Column</Label>
            <Select value={outlierTarget} onValueChange={setOutlierTarget}>
              <SelectTrigger className="mt-1.5 rounded-button"><SelectValue /></SelectTrigger>
              <SelectContent>
                {outlierConfig.targetColumns.map((col) => (
                  <SelectItem key={col} value={col}>{col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setOutlierRun(true)} className="w-full rounded-button bg-primary hover:bg-primary/90" size="lg">
            <AlertTriangle className="mr-2 h-4 w-4" /> Run Outlier Detection
          </Button>
        </Card>

        {outlierRun && (
          <Card className="rounded-card p-6 space-y-6">
            <h2 className="text-lg font-semibold">Anomaly Detection Results</h2>

            <Card className="rounded-card border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-primary">Business Insights:</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    This analysis identifies unusual patterns or anomalies in your <span className="font-mono font-semibold text-destructive">{outlierTarget}</span> data.
                    Outliers can indicate data quality issues, fraud, exceptional performance, or opportunities for investigation.
                  </p>
                </div>
              </div>
            </Card>

            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" /> Detection Status: Analysis Complete
            </p>

            <Card className="rounded-card border p-5 space-y-3 bg-muted/20">
              <h3 className="text-base font-semibold">
                Outlier Analysis Report for <span className="font-mono text-destructive">{outlierTarget}</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                We analyzed the distribution of the <span className="font-mono">{outlierTarget}</span> values using the <span className="font-semibold">{outlierConfig.method}</span> method to detect potential outliers.
              </p>
              <ul className="space-y-1.5 text-xs">
                <li>• <span className="font-semibold">Lower Bound:</span> Values below <span className="font-mono text-destructive">{outlierConfig.lowerBound}</span></li>
                <li>• <span className="font-semibold">Upper Bound:</span> Values above <span className="font-mono text-destructive">{outlierConfig.upperBound}</span></li>
              </ul>
              <p className="text-xs text-muted-foreground pt-2 border-t">
                Any data points falling <span className="font-semibold">outside this range</span> are considered <span className="font-semibold">outliers</span>.
              </p>
            </Card>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Summary:</h3>
              <p className="text-xs text-muted-foreground">
                A total of <span className="font-bold text-foreground">{outlierConfig.totalOutliers.toLocaleString()} outliers</span> were detected.
              </p>
              <p className="text-xs text-muted-foreground">
                These values may represent rare events, data entry errors, or legitimate but extreme variations.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Detected Outlier Values:</h3>
              <Card className="rounded-card border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs">timestamp</TableHead>
                        <TableHead className="text-xs">mode</TableHead>
                        <TableHead className="text-xs text-right">speed_kmph</TableHead>
                        <TableHead className="text-xs text-right">traction_power_kw</TableHead>
                        <TableHead className="text-xs text-right">energy_consumption_kwh</TableHead>
                        <TableHead className="text-xs text-right">system_temp_c</TableHead>
                        <TableHead className="text-xs text-right">vibration_g</TableHead>
                        <TableHead className="text-xs text-right">component_wear_pct</TableHead>
                        <TableHead className="text-xs text-right">health_index</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outlierConfig.rows.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-mono">{r.timestamp}</TableCell>
                          <TableCell className="text-xs">{r.mode}</TableCell>
                          <TableCell className="text-xs text-right">{r.speed.toFixed(3)}</TableCell>
                          <TableCell className="text-xs text-right">{r.traction.toFixed(3)}</TableCell>
                          <TableCell className="text-xs text-right font-semibold text-destructive">{r.energy.toFixed(3)}</TableCell>
                          <TableCell className="text-xs text-right">{r.temp.toFixed(3)}</TableCell>
                          <TableCell className="text-xs text-right">{r.vibration.toFixed(3)}</TableCell>
                          <TableCell className="text-xs text-right">{r.wear.toFixed(3)}</TableCell>
                          <TableCell className="text-xs text-right">{r.health.toFixed(3)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}

// ─── AI Chatbot Tab ─────────────────────────────────────────────────────────
function AiPanel() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const botConfig = user ? roleData[user.role].botConfig : null;

  useEffect(() => {
    if (botConfig) {
      setMessages([{ id: "1", role: "assistant", content: botConfig.greeting, type: "text" }]);
    }
  }, [user?.role]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const getMockResponse = (query: string): BotResponse => {
    if (!botConfig) return { type: "text", content: "" };
    const lowerQuery = query.toLowerCase();
    for (const [keyword, response] of Object.entries(botConfig.mockResponses)) {
      if (keyword !== "default" && lowerQuery.includes(keyword.toLowerCase())) return response;
    }
    return botConfig.mockResponses.default || {
      type: "text",
      content: `Based on your query "${query}", here's what I found in the fleet data.`,
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, type: "text" };
    setMessages((prev) => [...prev, userMsg]);
    const queryText = input;
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const response = getMockResponse(queryText);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        type: response.type,
        response,
      }]);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user || !botConfig) return null;

  return (
    <div className="flex h-[calc(100vh-16rem)] gap-4">
      <div className="flex w-[280px] shrink-0 flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Suggested Prompts</p>
          <div className="flex flex-col gap-1.5">
            {botConfig.suggestedPrompts.map((p) => {
              const Icon = promptTypeIcon[p.type];
              return (
                <button
                  key={p.text}
                  onClick={() => setInput(p.text)}
                  className="flex items-center gap-2 rounded-button border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span className="truncate">{p.text}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Datasets</p>
          <Select>
            <SelectTrigger className="rounded-input"><SelectValue placeholder="Select dataset" /></SelectTrigger>
            <SelectContent>
              {botConfig.datasets.map((ds) => (
                <SelectItem key={ds.value} value={ds.value}>{ds.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="flex flex-1 flex-col rounded-card overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            if (msg.role === "user") {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-card px-4 py-3 text-sm bg-accent text-accent-foreground">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            }
            const resp = msg.response;
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[85%] space-y-3">
                  <div className="rounded-card bg-card border px-4 py-3 text-sm leading-relaxed">{msg.content}</div>
                  {resp?.type === "table" && resp.tableHeaders && resp.tableRows && (
                    <Card className="rounded-card border overflow-hidden">
                      <Table>
                        <TableHeader><TableRow>{resp.tableHeaders.map((h) => <TableHead key={h} className="text-xs font-semibold">{h}</TableHead>)}</TableRow></TableHeader>
                        <TableBody>
                          {resp.tableRows.map((row, ri) => (
                            <TableRow key={ri}>{row.map((cell, ci) => <TableCell key={ci} className="text-xs">{cell}</TableCell>)}</TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  )}
                  {resp?.type === "chart" && resp.chartData && (
                    <Card className="rounded-card border p-4">
                      <h4 className="text-sm font-semibold mb-3">{resp.chartTitle}</h4>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={resp.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                            <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  )}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6"><ThumbsUp className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><ThumbsDown className="h-3 w-3" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
          {typing && (
            <div className="flex justify-start">
              <div className="rounded-card border bg-card px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your data… (Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none rounded-input border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button onClick={handleSend} size="icon" className="rounded-button shrink-0" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function DataModelling() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Data Modelling</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Generate KPIs, run predictive models, and chat with your fleet data
        </p>
      </div>

      <Tabs defaultValue="kpi" className="space-y-4">
        <TabsList className="rounded-button">
          <TabsTrigger value="kpi" className="rounded-button gap-1.5"><Target className="h-3.5 w-3.5" /> KPI</TabsTrigger>
          <TabsTrigger value="modelling" className="rounded-button gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Modelling</TabsTrigger>
          <TabsTrigger value="ai" className="rounded-button gap-1.5"><Bot className="h-3.5 w-3.5" /> AI</TabsTrigger>
        </TabsList>

        <TabsContent value="kpi"><KpiPanel /></TabsContent>
        <TabsContent value="modelling"><ModellingPanel /></TabsContent>
        <TabsContent value="ai"><AiPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

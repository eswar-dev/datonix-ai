// ─────────────────────────────────────────────────────────────────────────────
//  Datapx1 — single industrial role data layer.
//  No industries / managers / hierarchy. All users see the same machinery data.
// ─────────────────────────────────────────────────────────────────────────────

export type RoleKey = "datapx_user";

export interface UserAccount {
  email: string;
  password: string;
  role: RoleKey;
  name: string;
  title: string;
  initials: string;
}

// 6 industrial users — operations & maintenance personas
export const userAccounts: UserAccount[] = [
  { email: "alex@datapx1.com",     password: "datapx2026", role: "datapx_user", name: "Alex Chen",      title: "Operations Lead",         initials: "AC" },
  { email: "priya@datapx1.com",    password: "datapx2026", role: "datapx_user", name: "Priya Sharma",   title: "Maintenance Engineer",    initials: "PS" },
  { email: "sarah@datapx1.com",    password: "datapx2026", role: "datapx_user", name: "Sarah Okafor",   title: "Plant Supervisor",        initials: "SO" },
  { email: "david@datapx1.com",    password: "datapx2026", role: "datapx_user", name: "David Kim",      title: "Reliability Engineer",    initials: "DK" },
  { email: "james@datapx1.com",    password: "datapx2026", role: "datapx_user", name: "James Whitfield", title: "Production Analyst",     initials: "JW" },
  { email: "sophie@datapx1.com",   password: "datapx2026", role: "datapx_user", name: "Sophie Clark",   title: "Quality Inspector",       initials: "SC" },
];

// ─── Shared types (kept compatible with existing pages) ─────────────────────
export interface BotResponse {
  type: "text" | "table" | "chart";
  content: string;
  chartData?: { name: string; value: number }[];
  chartTitle?: string;
  chartInfo?: string;
  tableHeaders?: string[];
  tableRows?: string[][];
}

export interface SuggestedPrompt {
  text: string;
  type: "text" | "table" | "chart";
}

interface Inference {
  title: string; confidence: number; snippet: string; impact: "High" | "Med" | "Low";
  explanation: { summary: string; methodology: string; keyFindings: string[]; dataPoints: string; businessImplications: string[]; limitations: string };
}
interface InsightAction { id: string; title: string; status: "New" | "In Progress" | "Resolved"; assignee: string }
interface InsightRecommendation { priority: "High" | "Med" | "Low"; summary: string }
interface MissingValueRow { columns: Record<string, string | number>; highlightColumn?: string }
interface PredictionConfig {
  targetColumns: string[]; defaultTarget: string;
  inputFields: { key: string; defaultValue: string }[];
  predictedValue: number; predictedLabel: string;
  outputLevels: { level: string; range: string }[];
}
interface ForecastConfig {
  targetColumns: string[]; defaultTarget: string;
  chartData: { date: string; value: number }[]; insightText: string;
}

interface RoleDataShape {
  dashboard: {
    stats: { label: string; value: string; change: string; trend: "up" | "down" }[];
    chartTitle: string;
    chartKeys: [string, string];
    chartKeyLabels: [string, string];
    chartData: Record<string, string | number>[];
    risks: { severity: string; label: string }[];
    actions: { severity: string; label: string }[];
  };
  dataSources: {
    connected: { name: string; type: string; status: string; records: string; lastSync: string }[];
    datasets: { id: string; name: string; rows: number; columns: number; uploadDate: string; status: "Ready" | "Processing" | "Error" }[];
  };
  reports: {
    available: { name: string; category: string; lastRun: string; status: string }[];
    recentInsights: string[];
    reportContent: Record<string, { summary: string; keyMetrics: { label: string; value: string }[]; sections: string[] }>;
  };
  decisionIntelligence: {
    agents: { name: string; status: string; trigger: string; lastFired: string; confidence: number }[];
    decisions: { pillar: string; question: string; recommendation: string; confidence: number; urgency: string }[];
    inferences: Inference[];
    insightActions: InsightAction[];
    insightRecommendations: InsightRecommendation[];
    missingValues: { columns: string[]; rows: MissingValueRow[]; highlightColumn: string; totalMissing: number };
    prediction: PredictionConfig;
    forecast: ForecastConfig;
  };
  botConfig: {
    greeting: string;
    suggestedPrompts: SuggestedPrompt[];
    datasets: { value: string; label: string }[];
    chatHistory: { id: string; title: string; pinned: boolean }[];
    mockResponses: Record<string, BotResponse>;
  };
}

// ─── Datapx1 industrial mock dataset ────────────────────────────────────────
export const roleData: Record<RoleKey, RoleDataShape> = {
  datapx_user: {
    dashboard: {
      stats: [
        { label: "Fleet OEE",            value: "76%",   change: "+2.1%", trend: "up" },
        { label: "Machines Running",     value: "6 / 8", change: "+1",    trend: "up" },
        { label: "At-Risk Machines",     value: "3",     change: "+1",    trend: "down" },
        { label: "Unplanned Downtime",   value: "4.2h",  change: "-1.1h", trend: "up" },
      ],
      chartTitle: "Fleet Output vs Capacity (12 months)",
      chartKeys: ["output", "capacity"],
      chartKeyLabels: ["Actual Output", "Capacity"],
      chartData: [
        { month: "May", output: 11200, capacity: 14000 },
        { month: "Jun", output: 11800, capacity: 14000 },
        { month: "Jul", output: 12400, capacity: 14000 },
        { month: "Aug", output: 11600, capacity: 14000 },
        { month: "Sep", output: 12800, capacity: 14000 },
        { month: "Oct", output: 13100, capacity: 14000 },
        { month: "Nov", output: 12600, capacity: 14000 },
        { month: "Dec", output: 13400, capacity: 14000 },
        { month: "Jan", output: 12900, capacity: 14000 },
        { month: "Feb", output: 13700, capacity: 14000 },
        { month: "Mar", output: 13200, capacity: 14000 },
        { month: "Apr", output: 13800, capacity: 14000 },
      ],
      risks: [
        { severity: "high",   label: "Lathe Zeta (M-106) — vibration 6.8 mm/s, fault state" },
        { severity: "high",   label: "Robot Arm Gamma (M-103) — maintenance overdue" },
        { severity: "medium", label: "Conveyor Epsilon (M-105) — availability dropped to 45%" },
        { severity: "low",    label: "Press Beta (M-102) — temperature trending up" },
      ],
      actions: [
        { severity: "high",   label: "Schedule emergency PM on Lathe Zeta within 24h" },
        { severity: "medium", label: "Rebalance load from Conveyor Epsilon to Line A" },
        { severity: "low",    label: "Order spare bearings for CNC Mill Alpha (90-day window)" },
      ],
    },

    dataSources: {
      connected: [
        { name: "SAP S/4HANA",         type: "ERP",            status: "Active",  records: "4.2M", lastSync: "2m ago"  },
        { name: "Siemens Opcenter MES", type: "MES",           status: "Active",  records: "1.8M", lastSync: "5m ago"  },
        { name: "AWS IoT Core",         type: "Telemetry",     status: "Active",  records: "12.4M", lastSync: "Live"   },
        { name: "Ignition SCADA",       type: "SCADA",         status: "Active",  records: "3.1M", lastSync: "1m ago"  },
        { name: "Snowflake DWH",        type: "Warehouse",     status: "Active",  records: "28M",  lastSync: "1h ago"  },
        { name: "Maximo CMMS",          type: "Maintenance",   status: "Warning", records: "210K", lastSync: "3h ago"  },
      ],
      datasets: [
        { id: "1", name: "machine_telemetry_q1.parquet", rows: 1240000, columns: 18, uploadDate: "2026-04-01", status: "Ready" },
        { id: "2", name: "maintenance_logs.csv",         rows: 8400,    columns: 12, uploadDate: "2026-03-28", status: "Ready" },
        { id: "3", name: "production_orders.json",       rows: 32100,   columns: 22, uploadDate: "2026-04-10", status: "Processing" },
        { id: "4", name: "quality_inspections.xlsx",     rows: 5600,    columns: 9,  uploadDate: "2026-03-25", status: "Ready" },
        { id: "5", name: "scrap_corrupt.csv",            rows: 0,       columns: 0,  uploadDate: "2026-04-12", status: "Error" },
      ],
    },

    reports: {
      available: [
        { name: "Fleet OEE Performance",        category: "Operations",   lastRun: "2026-04-15", status: "Ready" },
        { name: "Predictive Maintenance Risk",  category: "Reliability",  lastRun: "2026-04-14", status: "Ready" },
        { name: "Downtime Pareto Analysis",     category: "Operations",   lastRun: "2026-04-13", status: "Ready" },
        { name: "Energy Consumption Report",    category: "Sustainability", lastRun: "2026-04-10", status: "Ready" },
      ],
      recentInsights: [
        "Lathe Zeta accounts for 38% of unplanned downtime this month.",
        "Vibration anomalies detected on Press Beta correlate with afternoon shifts.",
        "Switching to predictive PM on Line A could save ~$28k/quarter.",
      ],
      reportContent: {
        "Fleet OEE Performance": {
          summary: "Fleet-wide OEE landed at 76%, +2.1pp vs prior period. Line D (Injection + Grinder) leads at 82%; Line C is the laggard at 24% due to Lathe Zeta fault state.",
          keyMetrics: [
            { label: "Fleet OEE", value: "76%" },
            { label: "Best Line", value: "Line D — 82%" },
            { label: "Worst Line", value: "Line C — 24%" },
            { label: "MTBF", value: "112 hrs" },
          ],
          sections: ["Executive Summary", "Line-by-Line OEE", "Top Loss Drivers", "Recommendations"],
        },
        "Predictive Maintenance Risk": {
          summary: "3 machines flagged high-risk. Lathe Zeta (M-106) has 88% failure probability within 14 days based on vibration & temperature trend.",
          keyMetrics: [
            { label: "High Risk", value: "3" },
            { label: "Medium Risk", value: "2" },
            { label: "Avg Risk Score", value: "39 / 100" },
            { label: "Predicted Saves", value: "$112k" },
          ],
          sections: ["Risk Heatmap", "Per-Machine Forecast", "Recommended PM Schedule"],
        },
        "Downtime Pareto Analysis": {
          summary: "80% of downtime in the last 30 days came from 2 machines: Lathe Zeta and Robot Arm Gamma.",
          keyMetrics: [
            { label: "Total Downtime", value: "42.6 hrs" },
            { label: "Top Offender", value: "Lathe Zeta (16.2h)" },
            { label: "Cost Impact", value: "$84k" },
            { label: "Trend", value: "↑ vs last month" },
          ],
          sections: ["Pareto Chart", "Root Cause Breakdown", "Action Plan"],
        },
        "Energy Consumption Report": {
          summary: "Plant-wide kWh up 4% vs target. Injection Eta is the top consumer; opportunity to shift load off-peak.",
          keyMetrics: [
            { label: "Total kWh", value: "284k" },
            { label: "Cost", value: "$31.2k" },
            { label: "Top Consumer", value: "Injection Eta" },
            { label: "vs Target", value: "+4%" },
          ],
          sections: ["Consumption by Machine", "Time-of-Use Analysis", "Savings Opportunities"],
        },
      },
    },

    decisionIntelligence: {
      agents: [
        { name: "Vibration Anomaly Watch",   status: "Active", trigger: "RMS > 5 mm/s",          lastFired: "12m ago", confidence: 91 },
        { name: "Temperature Drift Monitor", status: "Active", trigger: "ΔT > 15°C / hour",      lastFired: "1h ago",  confidence: 84 },
        { name: "Production Lag Detector",   status: "Active", trigger: "Output < 70% of plan",  lastFired: "3h ago",  confidence: 78 },
        { name: "Maintenance Overdue Bot",   status: "Active", trigger: "PM date passed",        lastFired: "Today",   confidence: 100 },
      ],
      decisions: [
        { pillar: "Reliability", question: "Should we shutdown Lathe Zeta now?",                recommendation: "Yes — controlled shutdown saves ~$60k vs catastrophic failure", confidence: 88, urgency: "High" },
        { pillar: "Throughput",  question: "Re-route Line C work to Line A?",                   recommendation: "Yes — Line A has 18% spare capacity",                              confidence: 82, urgency: "Med" },
        { pillar: "Quality",     question: "Tighten quality gates on Press Beta?",              recommendation: "Yes — scrap rate drift suggests die wear",                          confidence: 74, urgency: "Med" },
        { pillar: "Energy",      question: "Shift Injection Eta runs to off-peak hours?",       recommendation: "Yes — projected $4.2k/month savings",                              confidence: 79, urgency: "Low" },
      ],
      inferences: [
        {
          title: "Lathe Zeta failure imminent",
          confidence: 88,
          snippet: "Vibration RMS climbed 3.1× in 48 hours; temperature 96°C above tolerance.",
          impact: "High",
          explanation: {
            summary: "Bearing degradation pattern matches historical pre-failure signatures.",
            methodology: "FFT vibration analysis + ML classifier trained on 2 years of fleet data.",
            keyFindings: ["Peak at 240 Hz (bearing race frequency)", "Temp delta +14°C vs baseline", "Lubricant due 6 days ago"],
            dataPoints: "12,400 sensor readings over the last 7 days",
            businessImplications: ["~$60k saved by controlled shutdown", "Avoid 18h unplanned downtime", "Protect Line C throughput"],
            limitations: "Model accuracy drops when ambient temp >35°C; ambient is currently 28°C.",
          },
        },
      ],
      insightActions: [
        { id: "A-1", title: "Shutdown Lathe Zeta and replace bearings", status: "New", assignee: "Priya Sharma" },
        { id: "A-2", title: "Re-route Line C orders to Line A",         status: "In Progress", assignee: "Alex Chen" },
        { id: "A-3", title: "Recalibrate Press Beta die-clearance",     status: "New", assignee: "David Kim" },
      ],
      insightRecommendations: [
        { priority: "High", summary: "Schedule emergency PM on M-106 within 24h." },
        { priority: "Med",  summary: "Increase vibration sampling frequency on Line A." },
        { priority: "Low",  summary: "Review lubricant supplier for Line C machines." },
      ],
      missingValues: {
        columns: ["machine_id", "timestamp", "vibration", "temperature", "pressure"],
        highlightColumn: "vibration",
        totalMissing: 142,
        rows: [
          { columns: { machine_id: "M-101", timestamp: "10:00", vibration: "—",   temperature: 62, pressure: 5.4 }, highlightColumn: "vibration" },
          { columns: { machine_id: "M-102", timestamp: "10:05", vibration: 3.4,   temperature: 71, pressure: 6.8 } },
          { columns: { machine_id: "M-103", timestamp: "10:10", vibration: "—",   temperature: 38, pressure: 0.0 }, highlightColumn: "vibration" },
          { columns: { machine_id: "M-104", timestamp: "10:15", vibration: 2.7,   temperature: 84, pressure: 4.2 } },
          { columns: { machine_id: "M-105", timestamp: "10:20", vibration: "—",   temperature: 41, pressure: 2.1 }, highlightColumn: "vibration" },
        ],
      },
      prediction: {
        targetColumns: ["failure_probability_14d", "remaining_useful_life_days", "next_oee"],
        defaultTarget: "failure_probability_14d",
        inputFields: [
          { key: "vibration_mm_s",   defaultValue: "6.8" },
          { key: "temperature_c",    defaultValue: "96"  },
          { key: "uptime_hours",     defaultValue: "22"  },
          { key: "days_since_pm",    defaultValue: "94"  },
        ],
        predictedValue: 88,
        predictedLabel: "Failure probability within 14 days",
        outputLevels: [
          { level: "Low",      range: "0 – 30"  },
          { level: "Medium",   range: "31 – 60" },
          { level: "High",     range: "61 – 100" },
        ],
      },
      forecast: {
        targetColumns: ["fleet_output", "fleet_oee", "energy_kwh"],
        defaultTarget: "fleet_output",
        chartData: [
          { date: "Apr 15", value: 13800 },
          { date: "Apr 16", value: 13900 },
          { date: "Apr 17", value: 14050 },
          { date: "Apr 18", value: 14100 },
          { date: "Apr 19", value: 14250 },
          { date: "Apr 20", value: 14300 },
        ],
        insightText: "Fleet output expected to climb 3.6% over next 5 days, assuming Lathe Zeta is restored by Apr 18.",
      },
    },

    botConfig: {
      greeting: "Hi! I'm Datapx1 AI. Ask me about machine health, OEE, downtime, or maintenance — I'll dig through the fleet data for you.",
      suggestedPrompts: [
        { text: "Which machine is most at risk right now?",            type: "text"  },
        { text: "Show me OEE by machine",                              type: "chart" },
        { text: "List machines with maintenance due in the next 30 days", type: "table" },
        { text: "What's driving downtime on Line C?",                  type: "text"  },
      ],
      datasets: [
        { value: "telemetry", label: "machine_telemetry_q1" },
        { value: "maint",     label: "maintenance_logs"     },
        { value: "orders",    label: "production_orders"    },
      ],
      chatHistory: [
        { id: "1", title: "Lathe Zeta failure analysis", pinned: true  },
        { id: "2", title: "Line C downtime root cause",  pinned: false },
        { id: "3", title: "Energy savings opportunities", pinned: false },
      ],
      mockResponses: {
        "Which machine is most at risk right now?": {
          type: "text",
          content: "Lathe Zeta (M-106) is the highest-risk asset right now with a risk score of 88/100. Vibration is at 6.8 mm/s (3.1× baseline) and temperature is 96°C. I recommend a controlled shutdown within 24h.",
        },
        "Show me OEE by machine": {
          type: "chart",
          content: "Here's OEE across the fleet. Three machines are below the 80% target.",
          chartTitle: "OEE by Machine",
          chartInfo: "Target = 80%. Anything below 60% is critical.",
          chartData: [
            { name: "M-101", value: 84 },
            { name: "M-102", value: 78 },
            { name: "M-103", value: 0  },
            { name: "M-104", value: 82 },
            { name: "M-105", value: 35 },
            { name: "M-106", value: 12 },
            { name: "M-107", value: 88 },
            { name: "M-108", value: 76 },
          ],
        },
        "List machines with maintenance due in the next 30 days": {
          type: "table",
          content: "5 machines have planned maintenance in the next 30 days; 1 is overdue.",
          tableHeaders: ["Machine", "Type", "Next PM", "Status"],
          tableRows: [
            ["M-106 Lathe Zeta",      "CNC Lathe",         "OVERDUE",    "Critical"],
            ["M-103 Robot Arm Gamma", "Pick & Place",      "2026-04-18", "Scheduled"],
            ["M-105 Conveyor Epsilon", "Conveyor",         "2026-04-25", "Scheduled"],
            ["M-102 Press Beta",      "Hydraulic Press",   "2026-05-10", "Scheduled"],
            ["M-101 CNC Mill Alpha",  "CNC Milling",       "2026-05-22", "Scheduled"],
          ],
        },
      },
    },
  },
};

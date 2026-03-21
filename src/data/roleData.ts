export type RoleKey = "aec_principal" | "mfg_plant_manager" | "retail_ops_head";

export interface UserAccount {
  email: string;
  password: string;
  role: RoleKey;
  name: string;
  title: string;
  industry: string;
  initials: string;
}

export const userAccounts: UserAccount[] = [
  { email: "alex@meridianarchitects.com", password: "datonix2026", role: "aec_principal", name: "Alex Chen", title: "Managing Principal", industry: "AEC", initials: "AC" },
  { email: "sarah@precisionmfg.com", password: "datonix2026", role: "mfg_plant_manager", name: "Sarah Okafor", title: "Plant Manager", industry: "Manufacturing", initials: "SO" },
  { email: "james@urbanretail.com", password: "datonix2026", role: "retail_ops_head", name: "James Whitfield", title: "Head of Retail Operations", industry: "Retail", initials: "JW" },
];

// ─── Shared types ───
interface Inference {
  title: string;
  confidence: number;
  snippet: string;
  impact: "High" | "Med" | "Low";
  explanation: {
    summary: string;
    methodology: string;
    keyFindings: string[];
    dataPoints: string;
    businessImplications: string[];
    limitations: string;
  };
}

interface InsightAction {
  id: string;
  title: string;
  status: "New" | "In Progress" | "Resolved";
  assignee: string;
}

interface InsightRecommendation {
  priority: "High" | "Med" | "Low";
  summary: string;
}

interface MissingValueRow {
  columns: Record<string, string | number>;
  highlightColumn?: string;
}

interface PredictionConfig {
  targetColumns: string[];
  defaultTarget: string;
  inputFields: { key: string; defaultValue: string }[];
  predictedValue: number;
  predictedLabel: string;
  outputLevels: { level: string; range: string }[];
}

interface ForecastConfig {
  targetColumns: string[];
  defaultTarget: string;
  chartData: { date: string; value: number }[];
  insightText: string;
}

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
    missingValues: {
      columns: string[];
      rows: MissingValueRow[];
      highlightColumn: string;
      totalMissing: number;
    };
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
  administration: {
    users: { name: string; role: string; status: string; lastLogin: string }[];
    integrations: string[];
    plan: string;
    dataQuality: number;
  };
}

export const roleData: Record<RoleKey, RoleDataShape> = {
  // ═══════════════════════════════════════════════════
  // AEC PRINCIPAL
  // ═══════════════════════════════════════════════════
  aec_principal: {
    dashboard: {
      stats: [
        { label: "Active Projects", value: "47", change: "+3", trend: "up" },
        { label: "Portfolio Margin", value: "18.4%", change: "-1.2%", trend: "down" },
        { label: "Backlog (months)", value: "6.2", change: "+0.8", trend: "up" },
        { label: "Cash Runway (days)", value: "94", change: "-6", trend: "down" },
      ],
      chartTitle: "Net Revenue vs Planned Revenue",
      chartKeys: ["actual", "planned"],
      chartKeyLabels: ["Actual Revenue", "Planned Revenue"],
      chartData: [
        { month: "Jan", planned: 4200, actual: 3980 },
        { month: "Feb", planned: 4500, actual: 4320 },
        { month: "Mar", planned: 4800, actual: 4950 },
        { month: "Apr", planned: 5100, actual: 4780 },
        { month: "May", planned: 5300, actual: 5500 },
        { month: "Jun", planned: 5600, actual: 5420 },
        { month: "Jul", planned: 5900, actual: 6100 },
        { month: "Aug", planned: 6200, actual: 6450 },
        { month: "Sep", planned: 6500, actual: 6280 },
        { month: "Oct", planned: 6800, actual: 7100 },
        { month: "Nov", planned: 7000, actual: 7300 },
        { month: "Dec", planned: 7200, actual: 8600 },
      ],
      risks: [
        { severity: "High", label: "3 projects trending toward margin erosion below 8%" },
        { severity: "High", label: "Civil vertical at 130% resource load — next 60 days" },
        { severity: "Med", label: "Milestone billing lag causing 22-day cash delay on Project Helios" },
        { severity: "Med", label: "Healthcare sector win rate slipping below 35%" },
        { severity: "Low", label: "Overhead burden exceeds 28% threshold on 2 projects" },
      ],
      actions: [
        { severity: "High", label: "Renegotiate scope on Projects Atlas, Nexus, and Solaris" },
        { severity: "Med", label: "Reallocate 2 structural engineers from civil vertical" },
        { severity: "Low", label: "Initiate billing cycle for 5 T&M underbilled contracts" },
      ],
    },
    dataSources: {
      connected: [
        { name: "Deltek Vantagepoint", type: "ERP", status: "Active", records: "1.2M", lastSync: "5m ago" },
        { name: "HubSpot CRM", type: "CRM", status: "Active", records: "48K", lastSync: "12m ago" },
        { name: "QuickBooks Online", type: "Accounting", status: "Active", records: "210K", lastSync: "1h ago" },
        { name: "Float", type: "Resource Planning", status: "Active", records: "8.4K", lastSync: "30m ago" },
        { name: "Procore", type: "Project Management", status: "Warning", records: "96K", lastSync: "3h ago" },
        { name: "ADP Payroll", type: "HR/Payroll", status: "Active", records: "14K", lastSync: "Daily" },
      ],
      datasets: [
        { id: "1", name: "project_financials_q4.csv", rows: 24800, columns: 18, uploadDate: "2026-03-12", status: "Ready" },
        { id: "2", name: "resource_utilization.xlsx", rows: 8400, columns: 12, uploadDate: "2026-03-14", status: "Ready" },
        { id: "3", name: "pipeline_backlog.json", rows: 3200, columns: 9, uploadDate: "2026-03-15", status: "Processing" },
        { id: "4", name: "client_profitability.csv", rows: 1800, columns: 7, uploadDate: "2026-03-10", status: "Ready" },
        { id: "5", name: "wip_aging_export.csv", rows: 0, columns: 0, uploadDate: "2026-03-16", status: "Error" },
      ],
    },
    reports: {
      available: [
        { name: "Portfolio Margin Heatmap", category: "Financial", lastRun: "Today", status: "Ready" },
        { name: "Backlog Health Index", category: "Pipeline", lastRun: "Yesterday", status: "Ready" },
        { name: "Resource Utilization vs Realization", category: "Operations", lastRun: "2 days ago", status: "Ready" },
        { name: "WIP Aging Diagnostic", category: "Financial", lastRun: "Today", status: "Alert" },
        { name: "Pipeline-to-Capacity Comparison", category: "Strategy", lastRun: "1 week ago", status: "Ready" },
        { name: "Client Profitability Ranking", category: "Financial", lastRun: "Today", status: "Ready" },
        { name: "Cash Runway Projection (180-day)", category: "Financial", lastRun: "Today", status: "Ready" },
      ],
      recentInsights: [
        "Project Nexus WIP aging > 45 days — write-off risk flagged",
        "Payroll cost will exceed revenue by 12% next quarter at current utilization",
        "Underbilling detected in 5 T&M projects worth $380K",
      ],
      reportContent: {
        "Portfolio Margin Heatmap": {
          summary: "Portfolio-wide margin analysis across 47 active projects reveals 3 projects trending below the 8% minimum threshold. The civil vertical shows the strongest margins at 22.4%, while healthcare projects are averaging 11.2%.",
          keyMetrics: [{ label: "Avg Portfolio Margin", value: "18.4%" }, { label: "Projects Below Threshold", value: "3" }, { label: "Highest Margin Vertical", value: "Civil (22.4%)" }],
          sections: ["Margin Distribution by Vertical", "Project-Level Margin Trends", "At-Risk Project Detail", "Recommendations"],
        },
        "WIP Aging Diagnostic": {
          summary: "Work-in-progress aging analysis has identified $1.2M in WIP older than 45 days across 8 projects. Project Nexus accounts for 34% of the aging exposure. Immediate billing action recommended.",
          keyMetrics: [{ label: "Total WIP > 45 Days", value: "$1.2M" }, { label: "Projects Affected", value: "8" }, { label: "Largest Exposure", value: "Project Nexus ($408K)" }],
          sections: ["WIP Aging by Project", "Billing Lag Analysis", "Write-off Risk Assessment", "Action Items"],
        },
      },
    },
    decisionIntelligence: {
      agents: [
        { name: "Margin Guardian", status: "Active", trigger: "Margin forecast < 12%", lastFired: "2h ago", confidence: 87 },
        { name: "Cash Protector", status: "Active", trigger: "WIP aging > 45 days", lastFired: "Yesterday", confidence: 92 },
        { name: "Resource Balancer", status: "Active", trigger: "Utilization > 130% or < 60%", lastFired: "4h ago", confidence: 79 },
        { name: "Pursuit Advisor", status: "Paused", trigger: "Backlog < 3.5 months", lastFired: "3 days ago", confidence: 84 },
      ],
      decisions: [
        { pillar: "Margin Protection", question: "Should scope be renegotiated on Project Atlas?", recommendation: "Yes — burn rate 11% above plan, milestone delayed", confidence: 87, urgency: "High" },
        { pillar: "Resource Optimization", question: "Is the civil team overloaded?", recommendation: "Critical — 130% utilization, hire 1 mid-level engineer", confidence: 92, urgency: "High" },
        { pillar: "Cash Flow Stability", question: "Is billing aligned to project progress?", recommendation: "No — 22-day billing lag across 3 projects", confidence: 79, urgency: "Med" },
        { pillar: "Strategic Growth", question: "Should we pursue the Healthcare Authority RFP?", recommendation: "Yes — 42% win rate, highest ROI sector", confidence: 84, urgency: "Low" },
      ],
      inferences: [
        {
          title: "Project margin erosion pattern detected",
          confidence: 87,
          snippet: "3 projects show consistent margin decline over 6 months, correlating with scope creep",
          impact: "High",
          explanation: {
            summary: "A recurring margin erosion pattern has been identified across Projects Atlas, Nexus, and Solaris, with margins declining 2-3% per quarter due to uncontrolled scope expansion.",
            methodology: "Earned value analysis (EVM) combined with change order tracking across all active projects. Burn rate vs. planned spend was compared over rolling 6-month windows.",
            keyFindings: [
              "Project Atlas margin dropped from 18% to 11% over 6 months.",
              "72% of scope changes were client-requested without corresponding fee adjustments.",
              "Average change order processing time is 18 days — creating billing lag.",
              "Civil vertical projects show 2x the scope creep rate of other verticals.",
            ],
            dataPoints: "47 active projects analyzed with 1,240 change orders over 12 months.",
            businessImplications: [
              "Implement mandatory scope change impact assessments before approval.",
              "Renegotiate contracts on the 3 at-risk projects immediately.",
              "Add scope creep monitoring to the bi-weekly project review process.",
              "Consider fixed-fee caps with built-in contingency for civil projects.",
            ],
            limitations: "Analysis based on current billing data which may lag actual project progress by 2-3 weeks. External market pressures on fee rates not factored in.",
          },
        },
        {
          title: "Resource utilization imbalance across verticals",
          confidence: 79,
          snippet: "Civil vertical at 130% while healthcare sits at 62% — rebalancing could improve margins by 4%",
          impact: "High",
          explanation: {
            summary: "Significant resource utilization imbalance detected between verticals. Civil team is overloaded at 130% while healthcare has capacity at 62%, creating burnout risk and missed opportunities.",
            methodology: "Resource allocation analysis using Float data cross-referenced with Deltek project assignments and billable hour tracking over the past 90 days.",
            keyFindings: [
              "Civil vertical: 14 staff at 130% avg utilization (target: 85%).",
              "Healthcare vertical: 8 staff at 62% avg utilization.",
              "Cross-training potential exists for 3 structural engineers.",
              "Overtime costs in civil have increased 45% this quarter.",
            ],
            dataPoints: "84 staff members analyzed across 5 verticals. 90 days of timesheet data from Deltek.",
            businessImplications: [
              "Cross-assign 2-3 structural engineers from civil to healthcare projects.",
              "Hire 1 mid-level civil engineer within 30 days to relieve pressure.",
              "Implement utilization alerts when any vertical exceeds 110%.",
              "Develop cross-vertical training program for versatile staff.",
            ],
            limitations: "Utilization metrics don't capture non-billable but essential activities. Staff preferences and specialization constraints may limit cross-assignment feasibility.",
          },
        },
        {
          title: "Billing lag causing cash flow pressure",
          confidence: 74,
          snippet: "Average 22-day billing lag across T&M contracts reducing cash runway by 15 days",
          impact: "Med",
          explanation: {
            summary: "Time & materials contracts show a systemic 22-day average billing lag, resulting in $380K in unbilled revenue and reducing effective cash runway from 109 to 94 days.",
            methodology: "Invoice timing analysis comparing project milestone completion dates against actual billing dates across all 18 active T&M contracts.",
            keyFindings: [
              "5 T&M contracts have unbilled work exceeding $50K each.",
              "Project Helios has the largest single lag at 34 days.",
              "Billing department capacity is the primary bottleneck (2 staff for 47 projects).",
              "Automated billing triggers could reduce lag to under 7 days.",
            ],
            dataPoints: "18 T&M contracts analyzed. 6 months of billing cycle data from QuickBooks.",
            businessImplications: [
              "Initiate immediate billing cycle for the top 5 underbilled contracts.",
              "Add one billing coordinator or automate invoice generation.",
              "Set up weekly billing status reviews for T&M contracts.",
              "Negotiate shorter payment terms with key clients.",
            ],
            limitations: "Some billing delays are client-driven (approval bottlenecks) rather than internal process issues. Client payment behavior not modeled.",
          },
        },
      ],
      insightActions: [
        { id: "1", title: "Renegotiate scope on Project Atlas — margin at 11%", status: "New", assignee: "Unassigned" },
        { id: "2", title: "Cross-assign engineers to healthcare vertical", status: "New", assignee: "Unassigned" },
        { id: "3", title: "Initiate billing cycle for underbilled T&M contracts", status: "In Progress", assignee: "Priya S." },
        { id: "4", title: "Review WIP aging on Project Nexus", status: "Resolved", assignee: "Marcus L." },
      ],
      insightRecommendations: [
        { priority: "High", summary: "Implement scope change impact assessment process across all verticals" },
        { priority: "Med", summary: "Hire 1 mid-level civil engineer to address 130% utilization" },
        { priority: "Low", summary: "Automate T&M billing triggers to reduce 22-day lag" },
      ],
      missingValues: {
        columns: ["project_id", "milestone_date", "planned_cost", "actual_cost", "variance", "billing_status", "margin_pct"],
        rows: [
          { columns: { project_id: "PRJ-Atlas", milestone_date: "2026-01-15", planned_cost: 245000, actual_cost: 272000, variance: -27000, billing_status: "Pending", margin_pct: 11.2 } },
          { columns: { project_id: "PRJ-Nexus", milestone_date: "2026-01-20", planned_cost: 180000, actual_cost: 198000, variance: -18000, billing_status: "Overdue", margin_pct: 0 }, highlightColumn: "margin_pct" },
          { columns: { project_id: "PRJ-Solaris", milestone_date: "2026-02-01", planned_cost: 320000, actual_cost: 310000, variance: 10000, billing_status: "Billed", margin_pct: 15.8 } },
          { columns: { project_id: "PRJ-Helios", milestone_date: "2026-02-10", planned_cost: 95000, actual_cost: 0, variance: 0, billing_status: "Unbilled", margin_pct: 0 }, highlightColumn: "margin_pct" },
          { columns: { project_id: "PRJ-Civic-01", milestone_date: "2026-02-15", planned_cost: 410000, actual_cost: 395000, variance: 15000, billing_status: "Billed", margin_pct: 22.1 } },
          { columns: { project_id: "PRJ-HC-Med", milestone_date: "2026-02-20", planned_cost: 150000, actual_cost: 142000, variance: 8000, billing_status: "Pending", margin_pct: 0 }, highlightColumn: "margin_pct" },
          { columns: { project_id: "PRJ-Tower-3", milestone_date: "2026-03-01", planned_cost: 520000, actual_cost: 518000, variance: -2000, billing_status: "Billed", margin_pct: 19.4 } },
          { columns: { project_id: "PRJ-Bridge", milestone_date: "2026-03-05", planned_cost: 280000, actual_cost: 265000, variance: 15000, billing_status: "Billed", margin_pct: 21.7 } },
        ],
        highlightColumn: "margin_pct",
        totalMissing: 312,
      },
      prediction: {
        targetColumns: ["margin_pct", "variance", "actual_cost"],
        defaultTarget: "margin_pct",
        inputFields: [
          { key: "project_id", defaultValue: "PRJ-NewBuild" },
          { key: "planned_cost", defaultValue: "350000" },
          { key: "team_size", defaultValue: "12" },
          { key: "vertical", defaultValue: "Civil" },
          { key: "contract_type", defaultValue: "Fixed Fee" },
          { key: "duration_months", defaultValue: "18" },
        ],
        predictedValue: 17.8,
        predictedLabel: "Healthy",
        outputLevels: [
          { level: "CRITICAL", range: "0 – 8%" },
          { level: "AT RISK", range: "8 – 12%" },
          { level: "HEALTHY", range: "12 – 20%" },
          { level: "STRONG", range: "20 – 35%" },
        ],
      },
      forecast: {
        targetColumns: ["portfolio_margin", "backlog_months", "cash_runway"],
        defaultTarget: "portfolio_margin",
        chartData: [
          { date: "2026-04", value: 17.9 },
          { date: "2026-05", value: 17.4 },
          { date: "2026-06", value: 16.8 },
          { date: "2026-07", value: 17.2 },
          { date: "2026-08", value: 18.1 },
        ],
        insightText: "Portfolio margin is projected to dip to 16.8% in June before recovering. This correlates with 3 large civil projects completing fee-heavy phases. Recommend front-loading billing on T&M contracts to maintain cash position.",
      },
    },
    botConfig: {
      greeting: "Hello Alex! I'm Datonix AI, your AEC decision intelligence assistant. I can help analyze project margins, resource utilization, backlog health, and cash flow. Select a dataset and ask me anything.",
      suggestedPrompts: [
        "Show portfolio margin trends by vertical",
        "Which projects are at risk of margin erosion?",
        "Compare resource utilization across teams",
        "Analyze WIP aging and billing lag",
        "Forecast cash runway for next 90 days",
        "Identify underbilled T&M contracts",
      ],
      datasets: [
        { value: "financials", label: "project_financials_q4.csv" },
        { value: "resources", label: "resource_utilization.xlsx" },
        { value: "pipeline", label: "pipeline_backlog.json" },
      ],
      chatHistory: [
        { id: "1", title: "Project Atlas margin review", pinned: true },
        { id: "2", title: "Civil team utilization analysis", pinned: false },
        { id: "3", title: "Cash runway projection", pinned: false },
      ],
      mockResponses: {
        "margin": "Based on your portfolio data, 3 projects are trending below the 8% minimum margin threshold:\n\n| Project | Current Margin | Trend |\n|---------|---------------|-------|\n| Atlas | 11.2% | ↓ Declining |\n| Nexus | 7.8% | ↓ Critical |\n| Solaris | 9.1% | → Flat |\n\nRecommendation: Immediate scope renegotiation on Atlas and Nexus. Combined exposure: $485K.",
        "resource": "Resource utilization analysis across verticals:\n\n• Civil: 130% (⚠️ OVERLOADED — 14 staff)\n• Commercial: 88% (✅ Optimal)\n• Healthcare: 62% (⚡ Underutilized — 8 staff)\n• Residential: 91% (✅ Optimal)\n\nAction: Cross-assign 2 structural engineers from civil to healthcare to balance load and capture $240K in available healthcare project revenue.",
        "default": "Based on your query, I analyzed the AEC portfolio data. The dataset shows significant variance in project performance across verticals. Civil projects lead in margin (22.4% avg) but face resource strain at 130% utilization. Healthcare shows growth opportunity with 38% capacity available.",
      },
    },
    administration: {
      users: [
        { name: "Alex Chen", role: "Managing Principal", status: "Active", lastLogin: "Now" },
        { name: "Priya Sharma", role: "CFO", status: "Active", lastLogin: "1h ago" },
        { name: "Marcus Lee", role: "Project Manager", status: "Active", lastLogin: "3h ago" },
        { name: "Dana Wright", role: "Resource Manager", status: "Active", lastLogin: "Yesterday" },
        { name: "Tom Haines", role: "BD Director", status: "Inactive", lastLogin: "5 days ago" },
      ],
      integrations: ["Deltek Vantagepoint", "HubSpot", "QuickBooks", "Float", "Procore", "ADP"],
      plan: "Enterprise AEC",
      dataQuality: 94.2,
    },
  },

  // ═══════════════════════════════════════════════════
  // MANUFACTURING PLANT MANAGER
  // ═══════════════════════════════════════════════════
  mfg_plant_manager: {
    dashboard: {
      stats: [
        { label: "OEE Score", value: "72%", change: "-5%", trend: "down" },
        { label: "Energy Cost/Unit", value: "£4.18", change: "+8%", trend: "down" },
        { label: "Scrap Rate", value: "3.2%", change: "+0.8%", trend: "down" },
        { label: "On-Time Delivery", value: "88%", change: "-4%", trend: "down" },
      ],
      chartTitle: "OEE Trend vs Target",
      chartKeys: ["oee", "target"],
      chartKeyLabels: ["OEE", "Target"],
      chartData: [
        { month: "Jan", oee: 78, target: 80 },
        { month: "Feb", oee: 79, target: 80 },
        { month: "Mar", oee: 81, target: 80 },
        { month: "Apr", oee: 77, target: 80 },
        { month: "May", oee: 75, target: 80 },
        { month: "Jun", oee: 76, target: 80 },
        { month: "Jul", oee: 80, target: 80 },
        { month: "Aug", oee: 74, target: 80 },
        { month: "Sep", oee: 73, target: 80 },
        { month: "Oct", oee: 72, target: 80 },
        { month: "Nov", oee: 71, target: 80 },
        { month: "Dec", oee: 72, target: 80 },
      ],
      risks: [
        { severity: "High", label: "Machine 4 bearing anomaly — predictive failure within 48h" },
        { severity: "High", label: "Scrap spike on Line B — correlated with Operator Shift C" },
        { severity: "Med", label: "Critical component SKU-2241 below safety stock threshold" },
        { severity: "Med", label: "Delivery risk on Order #8814 above 70%" },
        { severity: "Low", label: "Energy cost per unit trending 12% above budget" },
      ],
      actions: [
        { severity: "High", label: "Schedule maintenance for Machine 4 within 48 hours" },
        { severity: "High", label: "Reassign Operator A from Line C to Line B immediately" },
        { severity: "Med", label: "Reprioritise Order 1134 — higher margin, lower delay risk" },
      ],
    },
    dataSources: {
      connected: [
        { name: "SAP Business One", type: "ERP", status: "Active", records: "2.1M", lastSync: "2m ago" },
        { name: "MES Gateway", type: "Manufacturing Execution", status: "Active", records: "890K", lastSync: "Real-time" },
        { name: "IoT Sensor Array", type: "Machine Telemetry", status: "Active", records: "14.6M", lastSync: "Real-time" },
        { name: "Sage Payroll", type: "HR/Payroll", status: "Active", records: "12K", lastSync: "Daily" },
        { name: "Warehouse WMS", type: "Inventory", status: "Warning", records: "340K", lastSync: "4h ago" },
        { name: "Supplier EDI Hub", type: "Procurement", status: "Active", records: "56K", lastSync: "1h ago" },
      ],
      datasets: [
        { id: "1", name: "machine_telemetry_jan.csv", rows: 248000, columns: 7, uploadDate: "2026-03-12", status: "Ready" },
        { id: "2", name: "production_orders.xlsx", rows: 14200, columns: 11, uploadDate: "2026-03-14", status: "Ready" },
        { id: "3", name: "iot_sensor_feed.json", rows: 890000, columns: 22, uploadDate: "2026-03-15", status: "Processing" },
        { id: "4", name: "scrap_analysis.csv", rows: 5400, columns: 8, uploadDate: "2026-03-10", status: "Ready" },
        { id: "5", name: "wms_sync_error.csv", rows: 0, columns: 0, uploadDate: "2026-03-16", status: "Error" },
      ],
    },
    reports: {
      available: [
        { name: "OEE Diagnostic Report", category: "Operations", lastRun: "Today", status: "Alert" },
        { name: "Predictive Maintenance Schedule", category: "Maintenance", lastRun: "Today", status: "Ready" },
        { name: "Scrap Cost Dashboard", category: "Quality", lastRun: "1h ago", status: "Alert" },
        { name: "Energy Cost vs Output", category: "Financial", lastRun: "Yesterday", status: "Ready" },
        { name: "Supplier Risk Scorecard", category: "Procurement", lastRun: "Today", status: "Ready" },
        { name: "Labor Productivity Report", category: "Workforce", lastRun: "Today", status: "Ready" },
        { name: "Production Schedule Optimizer", category: "Operations", lastRun: "3h ago", status: "Ready" },
      ],
      recentInsights: [
        "Machine 4 bearing anomaly detected — 73% probability of failure within 48 hours",
        "Line B scrap 68% above network average — correlated with Shift C handover process",
        "Switching batch priority to Order 1134 would improve margin by £12,400 this week",
      ],
      reportContent: {
        "OEE Diagnostic Report": {
          summary: "Overall Equipment Effectiveness has declined to 72%, falling below the 80% target for the third consecutive month. Primary contributors: Machine 4 availability at 68% and Line B quality rate at 91.2%.",
          keyMetrics: [{ label: "Current OEE", value: "72%" }, { label: "Availability", value: "78%" }, { label: "Performance Rate", value: "94%" }, { label: "Quality Rate", value: "97.8%" }],
          sections: ["OEE Breakdown by Machine", "Downtime Root Cause Analysis", "Quality Loss Pareto", "Improvement Roadmap"],
        },
        "Scrap Cost Dashboard": {
          summary: "Total scrap cost this month: £42,800, up 24% from last month. Line B accounts for 58% of scrap events, with Shift C showing 3x the defect rate of Shift A. Material waste concentrated in component SKU-4412.",
          keyMetrics: [{ label: "Monthly Scrap Cost", value: "£42,800" }, { label: "Scrap Rate", value: "3.2%" }, { label: "Worst Line", value: "Line B (58%)" }],
          sections: ["Scrap by Production Line", "Shift-Level Analysis", "SKU Defect Concentration", "Cost Recovery Options"],
        },
      },
    },
    decisionIntelligence: {
      agents: [
        { name: "Maintenance Agent", status: "Active", trigger: "Vibration anomaly detected", lastFired: "30m ago", confidence: 91 },
        { name: "Inventory Protection Agent", status: "Active", trigger: "Component below safety stock", lastFired: "1h ago", confidence: 88 },
        { name: "Margin Guard Agent", status: "Active", trigger: "Order margin < threshold", lastFired: "4h ago", confidence: 83 },
        { name: "Delivery Risk Agent", status: "Active", trigger: "Delivery risk > 70%", lastFired: "2h ago", confidence: 76 },
      ],
      decisions: [
        { pillar: "Operations", question: "Should Machine 4 be taken offline now?", recommendation: "Yes — 73% failure probability, schedule within 48h", confidence: 91, urgency: "High" },
        { pillar: "Quality", question: "Is Line B scrap rate systemic or isolated?", recommendation: "Systemic — Shift C handover process needs review", confidence: 83, urgency: "High" },
        { pillar: "Inventory", question: "Should SKU-2241 be emergency reordered?", recommendation: "Yes — 3 days to stockout, supplier lead time 5 days", confidence: 88, urgency: "Med" },
        { pillar: "Production", question: "Should we reprioritise Order 1134?", recommendation: "Yes — £12,400 margin improvement, risk-adjusted", confidence: 76, urgency: "Med" },
      ],
      inferences: [
        {
          title: "Machine 4 bearing degradation pattern",
          confidence: 91,
          snippet: "Vibration signature matches pre-failure profile — 73% failure probability within 48h",
          impact: "High",
          explanation: {
            summary: "IoT vibration sensors on Machine 4 have detected a bearing degradation signature matching the pre-failure profile observed in 3 previous incidents. Predicted failure window: 24-72 hours.",
            methodology: "Fast Fourier Transform (FFT) analysis applied to real-time vibration data from IoT sensors. Pattern matching against historical failure database of 847 events across the machine fleet.",
            keyFindings: [
              "Vibration amplitude increased 340% in the 2.5kHz band over 72 hours.",
              "Temperature delta between bearing housing and ambient exceeded 12°C.",
              "Pattern matches 3 previous Machine 4 failures with 91% similarity.",
              "Estimated repair cost if planned: £2,400. If unplanned: £18,000 + 3 days downtime.",
            ],
            dataPoints: "14.6M sensor readings analyzed. 847 historical failure events in the reference database.",
            businessImplications: [
              "Schedule planned maintenance within 48 hours to avoid catastrophic failure.",
              "Pre-order replacement bearing assembly (lead time: 4 hours from local supplier).",
              "Shift Machine 4 workload to Machines 2 and 5 during maintenance window.",
              "Update predictive maintenance thresholds based on this new data point.",
            ],
            limitations: "Vibration analysis provides probabilistic, not deterministic, predictions. Actual failure timing can vary. External factors (load changes, ambient temperature) may accelerate or delay onset.",
          },
        },
        {
          title: "Shift C scrap rate anomaly on Line B",
          confidence: 83,
          snippet: "Shift C produces 68% more scrap than Shifts A and B — handover process identified as root cause",
          impact: "High",
          explanation: {
            summary: "Statistical analysis reveals Shift C on Line B has a defect rate 3x higher than Shifts A and B. The anomaly correlates with the shift handover process, specifically parameter drift during changeovers.",
            methodology: "Statistical process control (SPC) analysis of 90 days of production data. Defect rates analyzed by shift, operator, time-of-day, and raw material batch to isolate contributing factors.",
            keyFindings: [
              "Shift C defect rate: 4.8% vs. Shift A: 1.2% and Shift B: 1.6%.",
              "78% of Shift C defects occur in the first 45 minutes after handover.",
              "Machine parameters drift by 5-8% during shift change without recalibration.",
              "Monthly cost impact: £24,800 in additional scrap from Shift C alone.",
            ],
            dataPoints: "5,400 scrap events analyzed across 3 shifts over 90 days. 890K MES data points.",
            businessImplications: [
              "Implement mandatory machine recalibration checklist at each shift handover.",
              "Reassign experienced Operator A to supervise Shift C for 2-week training period.",
              "Install automated parameter verification sensors on Line B.",
              "Review shift scheduling to ensure adequate overlap time (currently 5 min, recommend 15 min).",
            ],
            limitations: "Raw material batch variation may account for up to 15% of the observed difference. Further controlled experiment recommended to isolate the handover effect specifically.",
          },
        },
        {
          title: "Energy cost optimization opportunity",
          confidence: 72,
          snippet: "Off-peak production scheduling could reduce energy cost per unit by 8-12%",
          impact: "Med",
          explanation: {
            summary: "Energy cost analysis reveals significant pricing variation between peak and off-peak tariff periods. Shifting 30% of non-urgent production to off-peak hours could save £3,200/month.",
            methodology: "Energy consumption data from smart meters cross-referenced with production schedules and utility tariff structures. Cost optimization model applied to identify shiftable workloads.",
            keyFindings: [
              "Peak tariff (8am-6pm): £0.28/kWh. Off-peak (10pm-6am): £0.14/kWh.",
              "42% of current production runs during peak hours are non-time-sensitive.",
              "Estimated annual savings: £38,400 with 30% load shifting.",
              "No capital expenditure required — scheduling change only.",
            ],
            dataPoints: "12 months of energy billing data. Production schedule records for 180 working days.",
            businessImplications: [
              "Reschedule non-urgent batch processing to 10pm-6am slot.",
              "Negotiate better off-peak rates with energy supplier.",
              "Install energy monitoring dashboard for real-time cost visibility.",
              "Consider on-site energy storage for further peak shaving.",
            ],
            limitations: "Labor cost differential for night shifts not included in savings calculation. Staff willingness to work off-peak hours needs assessment. Some processes may have technical constraints preventing schedule changes.",
          },
        },
      ],
      insightActions: [
        { id: "1", title: "Schedule Machine 4 maintenance — bearing failure imminent", status: "New", assignee: "Unassigned" },
        { id: "2", title: "Implement Shift C handover recalibration checklist", status: "New", assignee: "Unassigned" },
        { id: "3", title: "Reassign Operator A to Line B for Shift C training", status: "In Progress", assignee: "Raj P." },
        { id: "4", title: "Emergency reorder SKU-2241 from backup supplier", status: "Resolved", assignee: "Ben H." },
      ],
      insightRecommendations: [
        { priority: "High", summary: "Install automated parameter verification on Line B to prevent shift handover drift" },
        { priority: "Med", summary: "Shift 30% of non-urgent production to off-peak energy tariff hours" },
        { priority: "Low", summary: "Negotiate improved off-peak energy rates with supplier" },
      ],
      missingValues: {
        columns: ["machine_id", "timestamp", "engine_speed", "engine_load", "vibration", "temperature", "output_rate"],
        rows: [
          { columns: { machine_id: "MCH-004", timestamp: "2026-01-16T17:50:54", engine_speed: 1834.5, engine_load: 0, vibration: 3.691, temperature: 0, output_rate: 94 }, highlightColumn: "temperature" },
          { columns: { machine_id: "MCH-004", timestamp: "2026-01-16T17:50:43", engine_speed: 1910, engine_load: 0, vibration: 8.33, temperature: 0, output_rate: 91 }, highlightColumn: "temperature" },
          { columns: { machine_id: "MCH-004", timestamp: "2026-01-16T17:50:33", engine_speed: 1727.5, engine_load: 0, vibration: 9.904, temperature: 0, output_rate: 88 } },
          { columns: { machine_id: "MCH-002", timestamp: "2026-01-16T17:49:43", engine_speed: 1570, engine_load: 100, vibration: 9.948, temperature: 0, output_rate: 96 }, highlightColumn: "temperature" },
          { columns: { machine_id: "MCH-005", timestamp: "2026-01-16T17:46:43", engine_speed: 1854.5, engine_load: 0, vibration: 11.668, temperature: 72, output_rate: 93 } },
          { columns: { machine_id: "MCH-001", timestamp: "2026-01-16T17:46:03", engine_speed: 1748, engine_load: 0, vibration: 10.882, temperature: 68, output_rate: 97 } },
          { columns: { machine_id: "MCH-003", timestamp: "2026-01-16T17:45:52", engine_speed: 1861, engine_load: 0, vibration: 11.504, temperature: 71, output_rate: 0 }, highlightColumn: "output_rate" },
          { columns: { machine_id: "MCH-004", timestamp: "2026-01-16T17:45:42", engine_speed: 1769, engine_load: 0, vibration: 10.913, temperature: 0, output_rate: 89 }, highlightColumn: "temperature" },
        ],
        highlightColumn: "temperature",
        totalMissing: 500,
      },
      prediction: {
        targetColumns: ["engine_speed", "vibration", "output_rate"],
        defaultTarget: "engine_speed",
        inputFields: [
          { key: "machine_id", defaultValue: "MCH-004" },
          { key: "timestamp", defaultValue: "09/01/2026, 07:04 AM" },
          { key: "engine_load", defaultValue: "0" },
          { key: "vibration", defaultValue: "2.785" },
          { key: "temperature", defaultValue: "68" },
          { key: "output_rate", defaultValue: "92" },
        ],
        predictedValue: 1454.62,
        predictedLabel: "Medium",
        outputLevels: [
          { level: "LOW", range: "0 – 752" },
          { level: "MEDIUM", range: "752 – 1608" },
          { level: "HIGH", range: "1608 – 1837.5" },
          { level: "CRITICAL", range: "1837.5 – 2794.5" },
        ],
      },
      forecast: {
        targetColumns: ["engine_speed", "vibration", "oee_score"],
        defaultTarget: "engine_speed",
        chartData: [
          { date: "2026-01-24", value: 1411.0 },
          { date: "2026-01-25", value: 1411.1 },
          { date: "2026-01-26", value: 1411.0 },
          { date: "2026-01-27", value: 1411.05 },
          { date: "2026-01-28", value: 1411.1 },
        ],
        insightText: "Engine speed forecast indicates stable operation around 1411 RPM over the next 5 days. However, vibration trend analysis suggests Machine 4 may require maintenance intervention before January 28th to prevent performance degradation.",
      },
    },
    botConfig: {
      greeting: "Hello Sarah! I'm Datonix AI, your manufacturing intelligence assistant. I can help analyze OEE, machine health, scrap rates, and production optimization. Select a dataset and ask me anything.",
      suggestedPrompts: [
        "Show OEE breakdown by machine",
        "Predict Machine 4 failure timeline",
        "Analyze scrap rate by shift and line",
        "Compare energy cost across production periods",
        "Optimize production schedule for Order 1134",
        "Show inventory levels for critical SKUs",
      ],
      datasets: [
        { value: "telemetry", label: "machine_telemetry_jan.csv" },
        { value: "orders", label: "production_orders.xlsx" },
        { value: "sensors", label: "iot_sensor_feed.json" },
      ],
      chatHistory: [
        { id: "1", title: "Machine 4 vibration analysis", pinned: true },
        { id: "2", title: "Line B scrap investigation", pinned: false },
        { id: "3", title: "Energy cost optimization", pinned: false },
      ],
      mockResponses: {
        "oee": "OEE breakdown for current month:\n\n| Machine | Availability | Performance | Quality | OEE |\n|---------|-------------|-------------|---------|-----|\n| MCH-001 | 94% | 96% | 99.1% | 89.4% |\n| MCH-002 | 91% | 95% | 98.8% | 85.4% |\n| MCH-003 | 88% | 93% | 97.2% | 79.5% |\n| MCH-004 | 68% | 89% | 96.4% | 58.3% |\n| MCH-005 | 92% | 94% | 98.6% | 85.2% |\n\n⚠️ Machine 4 is the primary OEE drag. Bearing maintenance would restore availability to ~92%, improving plant OEE to 78%.",
        "scrap": "Scrap analysis by shift on Line B:\n\n• Shift A: 1.2% defect rate (within target)\n• Shift B: 1.6% defect rate (within target)\n• Shift C: 4.8% defect rate (⚠️ 3x above target)\n\nRoot cause: Parameter drift during shift handover. 78% of defects occur in first 45 minutes after Shift C starts. Monthly impact: £24,800.",
        "default": "Based on your query, I analyzed the manufacturing telemetry data. The plant is operating at 72% OEE, below the 80% target. Primary drivers: Machine 4 availability (68%) and Line B quality issues (Shift C). Two actionable improvements could recover 8+ OEE points.",
      },
    },
    administration: {
      users: [
        { name: "Sarah Okafor", role: "Plant Manager", status: "Active", lastLogin: "Now" },
        { name: "Raj Patel", role: "Operations Manager", status: "Active", lastLogin: "45m ago" },
        { name: "Lisa Nguyen", role: "Quality Manager", status: "Active", lastLogin: "2h ago" },
        { name: "Ben Howard", role: "Supply Chain Manager", status: "Active", lastLogin: "1h ago" },
        { name: "Chloe Davis", role: "Production Supervisor", status: "Active", lastLogin: "30m ago" },
      ],
      integrations: ["SAP Business One", "MES Gateway", "IoT Sensors", "Sage Payroll", "WMS", "Supplier EDI"],
      plan: "Enterprise Manufacturing",
      dataQuality: 97.8,
    },
  },

  // ═══════════════════════════════════════════════════
  // RETAIL OPS HEAD
  // ═══════════════════════════════════════════════════
  retail_ops_head: {
    dashboard: {
      stats: [
        { label: "Network Shrink Rate", value: "2.8%", change: "+0.4%", trend: "down" },
        { label: "Store Performance (RAG)", value: "14 Red", change: "+3", trend: "down" },
        { label: "Inventory Accuracy", value: "91.3%", change: "-2.1%", trend: "down" },
        { label: "Avg Transaction Value", value: "£47.20", change: "+£2.10", trend: "up" },
      ],
      chartTitle: "Network Shrink Rate vs Benchmark",
      chartKeys: ["shrink", "benchmark"],
      chartKeyLabels: ["Shrink Rate", "Benchmark"],
      chartData: [
        { month: "Jan", shrink: 2.1, benchmark: 2.0 },
        { month: "Feb", shrink: 2.0, benchmark: 2.0 },
        { month: "Mar", shrink: 2.2, benchmark: 2.0 },
        { month: "Apr", shrink: 2.3, benchmark: 2.0 },
        { month: "May", shrink: 2.4, benchmark: 2.0 },
        { month: "Jun", shrink: 2.3, benchmark: 2.0 },
        { month: "Jul", shrink: 2.5, benchmark: 2.0 },
        { month: "Aug", shrink: 2.6, benchmark: 2.0 },
        { month: "Sep", shrink: 2.7, benchmark: 2.0 },
        { month: "Oct", shrink: 2.8, benchmark: 2.0 },
        { month: "Nov", shrink: 2.9, benchmark: 2.0 },
        { month: "Dec", shrink: 2.8, benchmark: 2.0 },
      ],
      risks: [
        { severity: "High", label: "Store 14 shrink 18% above network average — LP gaps suspected" },
        { severity: "High", label: "Return abuse increasing in North Region — 3 stores flagged" },
        { severity: "Med", label: "Dead stock >90 days rising in Footwear — £84K exposure" },
        { severity: "Med", label: "Staffing gap of 12% across 8 stores this weekend" },
        { severity: "Low", label: "Marketing spend ROI declining in East Region" },
      ],
      actions: [
        { severity: "High", label: "Investigate LP gaps at Store 14 — deploy area manager" },
        { severity: "High", label: "Audit return policy at Stores 8, 12, 21 — abuse pattern detected" },
        { severity: "Med", label: "Approve discount recommendation for Footwear dead stock" },
      ],
    },
    dataSources: {
      connected: [
        { name: "EPOS / POS System", type: "Point of Sale", status: "Active", records: "4.8M", lastSync: "Real-time" },
        { name: "Inventory WMS", type: "Stock Management", status: "Active", records: "1.1M", lastSync: "15m ago" },
        { name: "HR Scheduling System", type: "Workforce", status: "Active", records: "28K", lastSync: "1h ago" },
        { name: "E-commerce Platform", type: "Online Sales", status: "Active", records: "620K", lastSync: "5m ago" },
        { name: "Loss Prevention CCTV API", type: "Security", status: "Warning", records: "N/A", lastSync: "3h ago" },
        { name: "Supplier Portal", type: "Procurement", status: "Active", records: "190K", lastSync: "4h ago" },
      ],
      datasets: [
        { id: "1", name: "epos_transactions_q4.csv", rows: 482000, columns: 16, uploadDate: "2026-03-12", status: "Ready" },
        { id: "2", name: "inventory_snapshot.xlsx", rows: 34200, columns: 12, uploadDate: "2026-03-14", status: "Ready" },
        { id: "3", name: "returns_analysis.json", rows: 18400, columns: 9, uploadDate: "2026-03-15", status: "Processing" },
        { id: "4", name: "staff_schedules.csv", rows: 2800, columns: 8, uploadDate: "2026-03-10", status: "Ready" },
        { id: "5", name: "cctv_api_export.csv", rows: 0, columns: 0, uploadDate: "2026-03-16", status: "Error" },
      ],
    },
    reports: {
      available: [
        { name: "Store Profitability Heatmap", category: "Financial", lastRun: "Today", status: "Alert" },
        { name: "Shrink Trend by SKU & Store", category: "Loss Prevention", lastRun: "Today", status: "Alert" },
        { name: "Return Abuse Detector", category: "Fraud", lastRun: "2h ago", status: "Alert" },
        { name: "Inventory Aging Report", category: "Inventory", lastRun: "Yesterday", status: "Ready" },
        { name: "Staff vs Sales Correlation", category: "Workforce", lastRun: "Today", status: "Ready" },
        { name: "Dead Stock Liquidation Planner", category: "Inventory", lastRun: "Today", status: "Ready" },
        { name: "Regional Manager Scorecard", category: "Operations", lastRun: "Today", status: "Ready" },
      ],
      recentInsights: [
        "Store 14 shrink trending 18% above network — weekend external theft concentrated in Accessories",
        "72% of return abuse concentrated in 3 SKUs across North Region — policy audit needed",
        "Footwear dead stock at 94 days — £84K at risk; discount to 40% off recommended this week",
      ],
      reportContent: {
        "Store Profitability Heatmap": {
          summary: "Network-wide profitability analysis reveals 14 stores in 'Red' status, concentrated in the North and East regions. Store 14 has the lowest profitability at -2.3% due to shrink losses exceeding £180K annually.",
          keyMetrics: [{ label: "Red Stores", value: "14" }, { label: "Network Margin", value: "6.8%" }, { label: "Worst Store", value: "Store 14 (-2.3%)" }],
          sections: ["Store RAG Status Map", "Regional Profitability Breakdown", "Shrink Impact on Margins", "Action Plan by Region"],
        },
        "Return Abuse Detector": {
          summary: "AI-powered return pattern analysis has flagged 847 suspicious transactions across 3 stores in the North Region. 72% are concentrated in 3 SKUs (premium headphones, designer bags, smart watches). Estimated annual exposure: £92K.",
          keyMetrics: [{ label: "Flagged Returns", value: "847" }, { label: "Stores Affected", value: "3" }, { label: "Annual Exposure", value: "£92K" }],
          sections: ["Suspicious Transaction Heatmap", "SKU-Level Return Analysis", "Customer Pattern Detection", "Policy Recommendations"],
        },
      },
    },
    decisionIntelligence: {
      agents: [
        { name: "Shrink Alert Agent", status: "Active", trigger: "Store shrink > 15% above network", lastFired: "1h ago", confidence: 89 },
        { name: "Stock Replenishment Agent", status: "Active", trigger: "SKU stock < safety level", lastFired: "20m ago", confidence: 94 },
        { name: "Return Abuse Detector", status: "Active", trigger: "Refund volume > threshold", lastFired: "3h ago", confidence: 81 },
        { name: "Staffing Optimiser", status: "Paused", trigger: "Projected sales vs staff ratio", lastFired: "2 days ago", confidence: 77 },
      ],
      decisions: [
        { pillar: "Loss Prevention", question: "Is Store 14 shrink structural or opportunistic?", recommendation: "Structural — repeat external theft, weekend pattern, LP gap", confidence: 89, urgency: "High" },
        { pillar: "Fraud Control", question: "Are North Region returns genuine?", recommendation: "No — 3 SKUs, 3 stores, coordinated pattern detected", confidence: 81, urgency: "High" },
        { pillar: "Inventory", question: "Should Footwear dead stock be discounted?", recommendation: "Yes — 40% discount recovers £50K, clears shelf for Q1", confidence: 94, urgency: "Med" },
        { pillar: "Workforce", question: "Is weekend staffing adequate for this week?", recommendation: "No — 12% gap across 8 stores during peak hours", confidence: 77, urgency: "Med" },
      ],
      inferences: [
        {
          title: "Structured shrink pattern at Store 14",
          confidence: 89,
          snippet: "Weekend external theft concentrated in Accessories department — LP coverage gap identified",
          impact: "High",
          explanation: {
            summary: "Store 14 exhibits a structured shrink pattern with losses 18% above the network average. Analysis reveals weekend external theft concentrated in the Accessories department during LP coverage gaps between 2-5pm.",
            methodology: "Exception-based reporting (EBR) combined with EPOS transaction analysis and CCTV timestamp correlation. Shrink data aggregated across 52 weeks and compared against network benchmarks.",
            keyFindings: [
              "Store 14 annual shrink: £180K vs. network average £152K.",
              "82% of shrink events occur on weekends between 2pm-5pm.",
              "Accessories department accounts for 64% of total shrink (vs. 18% network avg).",
              "LP officer coverage drops to 0 between 2pm-5pm on Saturdays due to break scheduling.",
            ],
            dataPoints: "4.8M EPOS transactions analyzed. 52 weeks of shrink data across 42 stores.",
            businessImplications: [
              "Deploy area manager to Store 14 for immediate weekend LP coverage.",
              "Implement electronic article surveillance (EAS) tagging for Accessories > £30.",
              "Adjust LP break schedules to maintain coverage during peak theft windows.",
              "Consider covert CCTV upgrade in Accessories department.",
            ],
            limitations: "Internal theft not fully ruled out — CCTV coverage in Accessories has blind spots. Some shrink may be attributable to administrative errors (mis-scans, write-off discrepancies).",
          },
        },
        {
          title: "Coordinated return abuse in North Region",
          confidence: 81,
          snippet: "3 SKUs, 3 stores, repeated pattern — coordinated fraud ring suspected",
          impact: "High",
          explanation: {
            summary: "Return pattern analysis has identified a suspected coordinated fraud operation across 3 North Region stores, targeting 3 high-value SKUs with return-and-rebuy cycles. Estimated annual exposure: £92K.",
            methodology: "AI-powered anomaly detection on return transactions. Customer ID clustering, receipt-free return frequency analysis, and cross-store pattern matching over 6-month window.",
            keyFindings: [
              "847 suspicious returns flagged across Stores 8, 12, and 21.",
              "3 SKUs targeted: Premium headphones (£299), Designer bags (£450), Smart watches (£349).",
              "14 unique customer IDs appear in returns at all 3 stores within 30 days.",
              "Average return-to-purchase ratio for flagged customers: 4.2x (vs. normal: 0.3x).",
            ],
            dataPoints: "620K e-commerce + EPOS return records analyzed. 6 months of cross-store customer data.",
            businessImplications: [
              "Implement mandatory ID verification for returns > £100 at flagged stores.",
              "Share suspected customer profiles with LP team for monitoring.",
              "Review and tighten receipt-free return policy (currently unlimited, recommend max 2/month).",
              "Consider requiring manager approval for sequential returns of same SKU.",
            ],
            limitations: "Customer ID matching relies on loyalty card data — customers without loyalty cards may not be tracked. False positive rate estimated at 8% based on historical audit.",
          },
        },
        {
          title: "Dead stock liquidation opportunity in Footwear",
          confidence: 94,
          snippet: "£84K in Footwear inventory aged 90+ days — 40% discount would recover £50K and free shelf space",
          impact: "Med",
          explanation: {
            summary: "Footwear inventory aging analysis shows £84K in dead stock aged over 90 days across 28 stores. A 40% markdown campaign would recover an estimated £50K while freeing premium shelf space for incoming Q1 collections.",
            methodology: "Inventory aging analysis using WMS data. Price elasticity modeling applied to historical markdown performance data to optimize discount depth.",
            keyFindings: [
              "312 SKUs aged > 90 days in Footwear category, total value £84K at cost.",
              "Historical markdown performance: 40% discount clears 78% of dead stock within 2 weeks.",
              "Current sell-through rate at full price: 2.1% per week (vs. category avg 8.4%).",
              "Shelf space opportunity cost: estimated £120K in lost Q1 revenue if not cleared.",
            ],
            dataPoints: "1.1M inventory records analyzed. 24 months of markdown performance history.",
            businessImplications: [
              "Launch 40% off Footwear clearance this week — estimated £50K recovery.",
              "Redirect cleared shelf space to incoming Spring/Summer collection.",
              "Review Footwear buying strategy — 23% of initial buy became dead stock (target: <10%).",
              "Implement 60-day aging alerts to trigger markdowns earlier in future.",
            ],
            limitations: "Price elasticity model assumes consistent customer response. Seasonal factors, weather, and competitor pricing may affect actual clearance rate. Some dead stock may have zero demand even at 40% off.",
          },
        },
      ],
      insightActions: [
        { id: "1", title: "Deploy area manager to Store 14 for weekend LP coverage", status: "New", assignee: "Unassigned" },
        { id: "2", title: "Implement ID verification for returns > £100 at North stores", status: "New", assignee: "Unassigned" },
        { id: "3", title: "Launch Footwear 40% clearance campaign", status: "In Progress", assignee: "Mei Z." },
        { id: "4", title: "Adjust weekend staffing schedules across 8 stores", status: "Resolved", assignee: "Connor O." },
      ],
      insightRecommendations: [
        { priority: "High", summary: "Deploy LP resources to Store 14 weekends 2-5pm to close coverage gap" },
        { priority: "Med", summary: "Implement receipt-free return cap of 2/month across North Region" },
        { priority: "Low", summary: "Set up automated 60-day inventory aging alerts for all categories" },
      ],
      missingValues: {
        columns: ["store_id", "transaction_date", "sku", "quantity", "revenue", "shrink_flag", "staff_count"],
        rows: [
          { columns: { store_id: "STR-014", transaction_date: "2026-01-16", sku: "ACC-4412", quantity: 12, revenue: 3588, shrink_flag: 1, staff_count: 0 }, highlightColumn: "staff_count" },
          { columns: { store_id: "STR-014", transaction_date: "2026-01-17", sku: "ACC-4413", quantity: 8, revenue: 2392, shrink_flag: 1, staff_count: 0 }, highlightColumn: "staff_count" },
          { columns: { store_id: "STR-008", transaction_date: "2026-01-16", sku: "ELC-2201", quantity: 3, revenue: 897, shrink_flag: 0, staff_count: 4 } },
          { columns: { store_id: "STR-012", transaction_date: "2026-01-16", sku: "FTW-1104", quantity: 0, revenue: 0, shrink_flag: 0, staff_count: 3 }, highlightColumn: "quantity" },
          { columns: { store_id: "STR-021", transaction_date: "2026-01-17", sku: "ACC-4412", quantity: 15, revenue: 4485, shrink_flag: 1, staff_count: 5 } },
          { columns: { store_id: "STR-003", transaction_date: "2026-01-17", sku: "FTW-1102", quantity: 6, revenue: 0, shrink_flag: 0, staff_count: 6 }, highlightColumn: "revenue" },
          { columns: { store_id: "STR-014", transaction_date: "2026-01-18", sku: "ACC-4414", quantity: 10, revenue: 2990, shrink_flag: 1, staff_count: 0 }, highlightColumn: "staff_count" },
          { columns: { store_id: "STR-027", transaction_date: "2026-01-18", sku: "ELC-2205", quantity: 4, revenue: 1196, shrink_flag: 0, staff_count: 7 } },
        ],
        highlightColumn: "staff_count",
        totalMissing: 724,
      },
      prediction: {
        targetColumns: ["shrink_flag", "revenue", "staff_count"],
        defaultTarget: "shrink_flag",
        inputFields: [
          { key: "store_id", defaultValue: "STR-014" },
          { key: "day_of_week", defaultValue: "Saturday" },
          { key: "department", defaultValue: "Accessories" },
          { key: "staff_on_duty", defaultValue: "3" },
          { key: "lp_coverage", defaultValue: "No" },
          { key: "avg_transaction_value", defaultValue: "47.20" },
        ],
        predictedValue: 0.82,
        predictedLabel: "High Risk",
        outputLevels: [
          { level: "LOW RISK", range: "0 – 0.25" },
          { level: "MODERATE", range: "0.25 – 0.50" },
          { level: "ELEVATED", range: "0.50 – 0.75" },
          { level: "HIGH RISK", range: "0.75 – 1.0" },
        ],
      },
      forecast: {
        targetColumns: ["shrink_rate", "revenue", "footfall"],
        defaultTarget: "shrink_rate",
        chartData: [
          { date: "2026-04", value: 2.9 },
          { date: "2026-05", value: 3.0 },
          { date: "2026-06", value: 2.7 },
          { date: "2026-07", value: 2.6 },
          { date: "2026-08", value: 2.4 },
        ],
        insightText: "Network shrink rate is projected to peak at 3.0% in May before declining. This aligns with the seasonal pattern of increased footfall and external theft during warmer months. LP intervention at Store 14 is expected to contribute a 0.3% network reduction if implemented by April.",
      },
    },
    botConfig: {
      greeting: "Hello James! I'm Datonix AI, your retail operations intelligence assistant. I can help analyze store performance, shrink patterns, inventory health, and workforce optimization. Select a dataset and ask me anything.",
      suggestedPrompts: [
        "Show shrink trends by store and department",
        "Identify return abuse patterns across stores",
        "Analyze dead stock aging by category",
        "Compare staff-to-sales ratios across regions",
        "Predict weekend shrink risk for Store 14",
        "Generate Footwear clearance recommendation",
      ],
      datasets: [
        { value: "epos", label: "epos_transactions_q4.csv" },
        { value: "inventory", label: "inventory_snapshot.xlsx" },
        { value: "returns", label: "returns_analysis.json" },
      ],
      chatHistory: [
        { id: "1", title: "Store 14 shrink investigation", pinned: true },
        { id: "2", title: "Return abuse pattern analysis", pinned: false },
        { id: "3", title: "Footwear dead stock review", pinned: false },
      ],
      mockResponses: {
        "shrink": "Shrink analysis by store (top 5 highest):\n\n| Store | Shrink Rate | vs Network | Primary Dept |\n|-------|------------|------------|-------------|\n| Store 14 | 3.3% | +18% | Accessories |\n| Store 21 | 3.0% | +7% | Electronics |\n| Store 8 | 2.9% | +4% | Accessories |\n| Store 12 | 2.8% | 0% | Footwear |\n| Store 5 | 2.7% | -4% | General |\n\n⚠️ Store 14 requires immediate LP intervention. Weekend pattern (Sat 2-5pm) with no LP coverage.",
        "return": "Return abuse analysis — North Region:\n\n• 847 suspicious returns flagged\n• 3 SKUs targeted: Headphones (£299), Bags (£450), Watches (£349)\n• 14 customer IDs appear across all 3 stores\n• Estimated annual exposure: £92K\n\nRecommendation: Implement ID verification for returns > £100. Cap receipt-free returns at 2/month.",
        "default": "Based on your query, I analyzed the retail operations data. The network is showing elevated shrink at 2.8% (target: 2.0%), with Store 14 as the primary outlier. Return abuse in North Region adds £92K annual exposure. Footwear dead stock at £84K needs clearance action this week.",
      },
    },
    administration: {
      users: [
        { name: "James Whitfield", role: "Head of Retail Operations", status: "Active", lastLogin: "Now" },
        { name: "Aisha Brown", role: "Loss Prevention Manager", status: "Active", lastLogin: "30m ago" },
        { name: "Connor O'Brien", role: "Regional Manager North", status: "Active", lastLogin: "1h ago" },
        { name: "Mei Zhang", role: "Inventory Manager", status: "Active", lastLogin: "45m ago" },
        { name: "Fiona Clarke", role: "E-commerce Manager", status: "Active", lastLogin: "2h ago" },
      ],
      integrations: ["EPOS System", "Inventory WMS", "HR Scheduling", "E-commerce", "CCTV API", "Supplier Portal"],
      plan: "Enterprise Retail",
      dataQuality: 91.3,
    },
  },
};

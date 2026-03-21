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

export const roleData: Record<RoleKey, {
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
  };
  reports: {
    available: { name: string; category: string; lastRun: string; status: string }[];
    recentInsights: string[];
  };
  decisionIntelligence: {
    agents: { name: string; status: string; trigger: string; lastFired: string; confidence: number }[];
    decisions: { pillar: string; question: string; recommendation: string; confidence: number; urgency: string }[];
  };
  administration: {
    users: { name: string; role: string; status: string; lastLogin: string }[];
    integrations: string[];
    plan: string;
    dataQuality: number;
  };
}> = {
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

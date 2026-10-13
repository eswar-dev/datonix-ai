import { RAW } from "./rawData";
import type {
  MfgKpi,
  MfgOrgNode,
  MfgRole,
  MfgScopeId,
  MfgSite,
  MfgSiteId,
  MfgTrigger,
} from "./types";

export type { MfgKpi, MfgOrgNode, MfgRole, MfgScopeId, MfgSite, MfgSiteId, MfgTrigger };

export const DEFAULT_TWIN_PROMPT =
  "Riverside Fabrication Group is a multi-site discrete manufacturing group with 3 plants: Birmingham (UK, 34 staff, GBP, precision machining & assembly), Katowice (Poland, 22 staff, EUR, welded structures & sub-assembly), and Coventry (UK, 14 staff, GBP, finishing & logistics hub). Maintenance technicians and select suppliers are shared across sites. Group reporting currency is GBP.";

export const SITE_TABS = RAW.STW_TABS.map(([id, label]) => ({ id, label }));

export const SITES: MfgSite[] = (Object.keys(RAW.SITE_DATA) as MfgSiteId[]).map((id) => {
  const s = RAW.SITE_DATA[id];
  return {
    id,
    name: s.name,
    full: s.full,
    code: s.code,
    flag: s.flag,
    status: s.status,
    coverage: s.coverage,
    currency: id === "katowice" ? "EUR" : "GBP",
    overview: s.overview as MfgSite["overview"],
    workforce: s.workforce as MfgSite["workforce"],
    production: s.production as MfgSite["production"],
    machinery: s.machinery as MfgSite["machinery"],
    systems: s.systems as MfgSite["systems"],
    systemsPain: s.systemsPain,
    inventory: s.inventory as MfgSite["inventory"],
    financials: s.financials as MfgSite["financials"],
    supplychain: s.supplychain as MfgSite["supplychain"],
    maintenance: s.maintenance as MfgSite["maintenance"],
    lifecycle: s.lifecycle as MfgSite["lifecycle"],
  };
});

export const SITE_BY_ID = Object.fromEntries(SITES.map((s) => [s.id, s])) as Record<MfgSiteId, MfgSite>;

export const ORG_TREE = RAW.ORG_TREE as unknown as MfgOrgNode[];
export const DEC_ROLES = RAW.DEC_ROLES as unknown as MfgRole[];
export const DEC_SCOPES = RAW.DEC_SCOPES as unknown as [MfgScopeId, string][];
export const ROLE_KPIS = RAW.ROLE_KPIS as unknown as Record<string, Record<string, MfgKpi[]>>;
export const TRIGGERS = RAW.TRIGGERS_LIB as unknown as MfgTrigger[];
export const DEC_DOMAINS = RAW.DEC_DOMAINS as unknown as string[];
export const DOMAIN_OVERVIEW = RAW.DOMAIN_OVERVIEW as unknown as {
  icon: string;
  name: string;
  kpis: string;
}[];

export const TWINS = [
  {
    id: "riverside",
    name: "Riverside Fabrication Group",
    subtitle: "Discrete Mfg · UK · Poland",
    status: "Live",
    sites: 3,
    staff: 70,
    workOrders: 19,
    active: true,
  },
  {
    id: "nordic",
    name: "Nordic Metalworks",
    subtitle: "Sheet Metal · Finland · SEK/EUR",
    status: "Inactive",
    sites: 2,
    staff: 41,
    workOrders: 12,
    active: false,
  },
];

export const CONNECTORS = [
  { source: "E2 MFG", connector: "ERP Connector", target: "AR / AP / GL", sites: "BHX", coverage: 96, lastSync: "2 min ago", status: "Live" },
  { source: "Ridder iQ", connector: "ERP Connector", target: "Production & Resources", sites: "KTW", coverage: 74, lastSync: "1 hr ago", status: "Partial" },
  { source: "Deacom", connector: "ERP Connector", target: "Inventory & Logistics", sites: "COV", coverage: 0, lastSync: "Never", status: "Not Connected" },
  { source: "MES / APS", connector: "Shop-Floor Connector", target: "Quality / SPC", sites: "All", coverage: 91, lastSync: "4 min ago", status: "Live" },
];

export const PEOPLE = [
  { name: "Marcus Klein", title: "Senior Maintenance Technician", sites: ["Birmingham", "Katowice"], shared: true, util: 95, note: "CNC + robotics certified", spark: [60, 75, 82, 70, 91, 88, 95], accent: "teal" as const },
  { name: "Aleksandra Nowak", title: "Quality Inspector, Lead", sites: ["Katowice"], shared: false, util: 84, note: "SPC + ISO 9001 lead auditor", spark: [50, 65, 72, 68, 80, 77, 84], accent: "blue" as const },
  { name: "Denise Okafor", title: "CNC Setter/Operator", sites: ["Birmingham"], shared: false, util: 94, note: "5-axis machining centre", spark: [70, 85, 90, 78, 92, 88, 94], accent: "teal" as const },
  { name: "Tomasz Wiśniewski", title: "Welding Technician", sites: ["Katowice"], shared: false, util: 79, note: "MIG/TIG certified", spark: [55, 60, 68, 71, 65, 74, 79], accent: "blue" as const },
  { name: "Priya Chandran", title: "Supply Chain Analyst", sites: ["Birmingham", "Coventry"], shared: true, util: 71, note: "Group-level buying support", spark: [45, 52, 58, 63, 60, 67, 71], accent: "purple" as const },
  { name: "Liam O'Sullivan", title: "Paint Technician", sites: ["Birmingham"], shared: false, util: 76, note: "Powder coat line", spark: [60, 58, 64, 70, 68, 73, 76], accent: "teal" as const },
];

export const SKILL_MATRIX = [
  { name: "Marcus Klein", shared: true, sites: ["BHX", "KTW"], skills: [3, 2, 1, 5, 0, 5] },
  { name: "Denise Okafor", shared: false, sites: ["BHX"], skills: [5, 1, 2, 3, 0, 1] },
  { name: "Aleksandra Nowak", shared: false, sites: ["KTW"], skills: [1, 0, 5, 0, 0, 0] },
  { name: "Tomasz Wiśniewski", shared: false, sites: ["KTW"], skills: [2, 5, 1, 0, 0, 2] },
  { name: "Liam O'Sullivan", shared: false, sites: ["BHX"], skills: [1, 0, 2, 0, 5, 0] },
  { name: "Priya Chandran", shared: true, sites: ["BHX", "COV"], skills: [0, 0, 1, 0, 0, 0] },
];

export const SKILL_COLUMNS = ["CNC Machining", "Welding", "Quality / SPC", "Robotics", "Paint Line", "Maintenance"];

export const INQUIRIES = [
  { customer: "Ashford Rail Components", subject: "Delivery date query — PO 44192", site: "Birmingham", raised: "2 days ago", status: "Open" },
  { customer: "Nordbau GmbH", subject: "Cert pack for batch KTW-0819", site: "Katowice", raised: "3 days ago", status: "Open" },
  { customer: "Selwood Hydraulics", subject: "Concession request — surface finish", site: "Birmingham", raised: "1 week ago", status: "In Review" },
  { customer: "Marchetti Automazione", subject: "New RFQ — bracket assembly", site: "Coventry", raised: "Today", status: "New" },
];

export const WORK_ORDERS = [
  { id: "WO-2298", customer: "Ashford Rail", site: "Birmingham", stage: "Machining", due: "19 Sep", status: "On Track" },
  { id: "WO-2301", customer: "Nordbau GmbH", site: "Katowice", stage: "Welding", due: "22 Sep", status: "At Risk" },
  { id: "WO-2305", customer: "Selwood Hydraulics", site: "Birmingham", stage: "Quality Hold", due: "18 Sep", status: "Blocked" },
  { id: "WO-2309", customer: "Marchetti Automazione", site: "Coventry", stage: "Planning", due: "30 Sep", status: "New" },
];

export const TIMESHEETS = [
  { name: "Denise Okafor", site: "Birmingham", week: "W/C 08 Sep", hours: "42.5", status: "Pending" },
  { name: "Tomasz Wiśniewski", site: "Katowice", week: "W/C 08 Sep", hours: "40.0", status: "Pending" },
  { name: "Marcus Klein", site: "Birmingham / Katowice", week: "W/C 08 Sep", hours: "45.0", status: "Pending" },
];

export const AGENTS = [
  { name: "Downtime Prediction Agent", status: "Active", desc: "Watches vibration, temperature and cycle-time sensor feeds across all CNC and press assets; flags likely failures 5–14 days ahead.", stat: "142 predictions · 92% precision", scope: "Birmingham + Katowice" },
  { name: "Schedule Risk Sentinel", status: "Active", desc: "Cross-references order book, material lead times and machine capacity to flag OTIF risk before it hits the shop floor.", stat: "38 risks flagged this month", scope: "All sites" },
  { name: "COPQ Erosion Monitor", status: "Active", desc: "Tracks scrap, rework and warranty cost against the quality budget and traces spikes back to shift, machine or supplier batch.", stat: "£71k in flagged root causes", scope: "All sites" },
  { name: "Resource Overload Agent", status: "Active", desc: "Watches shared-resource calendars (Marcus Klein, Priya Chandran) for overlapping commitments across sites and proposes re-sequencing.", stat: "6 conflicts pre-empted", scope: "Cross-site" },
  { name: "FX Risk Monitor", status: "Pending", desc: "Would monitor EUR/GBP exposure on Katowice steel and aluminium contracts and suggest forward-cover thresholds.", stat: "Awaiting CFO sign-off", scope: "Group Finance" },
  { name: "Skill Gap Predictor", status: "Pending", desc: "Would compare the Skill Matrix against the 12-month order book to flag training gaps before they become bottlenecks.", stat: "Awaiting Group Ops sign-off", scope: "People & Resources" },
];

export const SUPPLIERS = [
  { name: "Ashbourne Steel Stockholders", category: "Steel sheet & bar", site: "Birmingham", otif: "96%", variance: "±2 days", status: "Good" },
  { name: "Meridian Coatings Supply", category: "Powder coat media", site: "Birmingham", otif: "88%", variance: "±4 days", status: "Watch" },
  { name: "Hutmen Regional Supply", category: "Steel & consumables", site: "Katowice", otif: "81%", variance: "±8 days", status: "Under Review" },
  { name: "Coventry Onboarding (TBD)", category: "Steel & consumables", site: "Coventry", otif: "—", variance: "—", status: "Onboarding" },
];

export function siteTagVariant(site: string): "blue" | "amber" | "purple" | "default" {
  const s = site.toLowerCase();
  if (s.includes("birm") || s === "bhx") return "blue";
  if (s.includes("kato") || s === "ktw") return "amber";
  if (s.includes("cove") || s === "cov") return "purple";
  return "default";
}

// ─── Phase 2: Dashboard data ─────────────────────────────────────────────────
export const SITE_COMPARISON = [
  { site: "Birmingham", id: "birmingham", otif: 93, oee: 79, rft: 95, copq: 108, headcount: 34, openWOs: 11, alerts: 2, trend: [70, 74, 79, 82, 87, 90, 93] },
  { site: "Katowice",   id: "katowice",   otif: 87, oee: 71, rft: 92, copq: 61,  headcount: 22, openWOs: 6,  alerts: 3, trend: [65, 68, 72, 75, 79, 84, 87] },
  { site: "Coventry",   id: "coventry",   otif: 96, oee: 82, rft: 97, copq: 15,  headcount: 14, openWOs: 2,  alerts: 0, trend: [88, 90, 92, 93, 94, 95, 96] },
];

export const MY_APPROVALS = [
  { id: "a1", type: "Timesheet", person: "Denise Okafor", site: "Birmingham", detail: "W/C 08 Sep · 42.5 hrs", status: "Pending" },
  { id: "a2", type: "Timesheet", person: "Marcus Klein", site: "BHX + KTW", detail: "W/C 08 Sep · 45.0 hrs", status: "Pending" },
  { id: "a3", type: "Skill review", person: "Denise Okafor", site: "Birmingham", detail: "CNC 5-axis · Level 5 claimed", status: "Pending" },
  { id: "a4", type: "Routing sign-off", person: "System", site: "Birmingham", detail: "Routing R-0044 · Ashford Rail bracket", status: "Pending" },
  { id: "a5", type: "Timesheet", person: "Tomasz Wiśniewski", site: "Katowice", detail: "W/C 08 Sep · 40.0 hrs", status: "Pending" },
];

export const MY_WORK_ORDERS = [
  { id: "WO-2298", customer: "Ashford Rail", site: "Birmingham", stage: "Machining", due: "19 Sep", status: "On Track", assigned: "CNC Cell 3" },
  { id: "WO-2305", customer: "Selwood Hydraulics", site: "Birmingham", stage: "Quality Hold", due: "18 Sep", status: "Blocked", assigned: "QA Bench" },
  { id: "WO-2309", customer: "Marchetti Automazione", site: "Coventry", stage: "Planning", due: "30 Sep", status: "New", assigned: "Assembly Bay" },
];

// ─── Phase 3: Enquiry data ────────────────────────────────────────────────────
export const ENQUIRY_TYPES = ["RFQ", "Delivery query", "Quality concession", "Certificate request", "General"] as const;

// ─── Phase 4: Routing data ────────────────────────────────────────────────────
export interface RoutingStep {
  step: number;
  op: string;
  cell: string;
  std: number;
  notes?: string;
}

export const ROUTING_STEPS_BY_SITE: Record<MfgSiteId, RoutingStep[]> = {
  birmingham: [
    { step: 1, op: "Goods-In & Material Check", cell: "Inspection Bay", std: 0.5, notes: "Verify cert packs against PO spec" },
    { step: 2, op: "CNC Machining", cell: "Cell 3 (5-axis)", std: 4.5, notes: "Tolerance ±0.1 mm — ISO 2768 medium" },
    { step: 3, op: "Deburr & Clean", cell: "Bench", std: 0.75 },
    { step: 4, op: "Quality Inspection (CMM)", cell: "CMM Bay", std: 1.0, notes: "First-article inspection — ISO 9001" },
    { step: 5, op: "Powder Coat", cell: "Coat Line", std: 2.0, notes: "RAL 7016 · 60–80 µm DFT" },
    { step: 6, op: "Final Visual Inspection", cell: "QA Bench", std: 0.5 },
    { step: 7, op: "Pack & Despatch", cell: "Goods-Out", std: 0.25, notes: "Ashford Rail packing spec" },
  ],
  katowice: [
    { step: 1, op: "Goods-In & Material Check", cell: "Inspection Bay", std: 0.5, notes: "Steel cert verification" },
    { step: 2, op: "Cut & Prep", cell: "Cutting Cell", std: 1.5, notes: "Plasma cut to profile" },
    { step: 3, op: "MIG Welding", cell: "Weld Bay A", std: 5.0, notes: "EN ISO 15614-1 qualified procedure" },
    { step: 4, op: "NDT Inspection", cell: "NDT Station", std: 1.5, notes: "Visual + dye-penetrant" },
    { step: 5, op: "Stress Relieve / Shot Blast", cell: "Shot Blast Bay", std: 2.0 },
    { step: 6, op: "Sub-Assembly", cell: "Sub-Assembly Area", std: 2.5 },
    { step: 7, op: "Final Quality Check", cell: "QA Bench", std: 0.75 },
    { step: 8, op: "Pack & Despatch", cell: "Goods-Out", std: 0.5 },
  ],
  coventry: [
    { step: 1, op: "Goods-In (sub-assemblies)", cell: "Goods-In", std: 0.5 },
    { step: 2, op: "Pre-treatment & Clean", cell: "Pre-treat Bay", std: 1.0 },
    { step: 3, op: "Paint Line", cell: "Paint Line 1", std: 3.0, notes: "Two-pack epoxy — 120 µm DFT" },
    { step: 4, op: "Assembly", cell: "Assembly Bay", std: 2.5, notes: "Torque spec sheet ref TS-COV-04" },
    { step: 5, op: "Quality & Despatch Check", cell: "QA + Goods-Out", std: 0.75 },
    { step: 6, op: "Logistics & Pack", cell: "Logistics Bay", std: 0.5 },
  ],
};

export const PRODUCTION_LINES: Record<MfgSiteId, string[]> = {
  birmingham: ["Cell 1 (CNC)", "Cell 2 (CNC)", "Cell 3 (CNC)", "Press Line", "Coat Line"],
  katowice:   ["Weld Bay A", "Weld Bay B", "Sub-Assembly", "NDT Station", "Shot Blast"],
  coventry:   ["Paint Line 1", "Assembly Bay", "Logistics Bay"],
};

export const PART_FAMILIES = ["Precision machined bracket", "Welded structural frame", "Sheet metal enclosure", "Assembly kit", "Hydraulic manifold"];

// ─── Phase 5: Skill approval data ────────────────────────────────────────────
export const SKILL_REVIEWS = [
  { id: "sr1", person: "Denise Okafor", skill: "CNC 5-axis Machining", claimed: 5, current: 4, evidence: "External course cert — City & Guilds L4", date: "12 Sep 2026", approver: "Site Mgr Birmingham", status: "Pending" },
  { id: "sr2", person: "Tomasz Wiśniewski", skill: "Robotics Programming", claimed: 3, current: 0, evidence: "On-the-job assessment by Marcus Klein", date: "8 Sep 2026", approver: "Aleksandra Nowak", status: "Pending" },
  { id: "sr3", person: "Liam O'Sullivan", skill: "Quality / SPC", claimed: 2, current: 1, evidence: "Internal training completion — Datonix Academy", date: "1 Sep 2026", approver: "Aleksandra Nowak", status: "Approved" },
];

export const SKILL_METRICS = { tracked: 6, avgRating: 2.8, pendingReviews: 2, certified: 4, coveragePct: 74 };

// ─── Phase 6: Timesheet / shift data ─────────────────────────────────────────
export const TIMESHEET_ENTRIES = [
  { id: "ts1", name: "Denise Okafor", site: "Birmingham", week: "W/C 08 Sep", hours: "42.5", overtime: "2.5", status: "Pending", shift: "Days" },
  { id: "ts2", name: "Tomasz Wiśniewski", site: "Katowice", week: "W/C 08 Sep", hours: "40.0", overtime: "0", status: "Pending", shift: "Days" },
  { id: "ts3", name: "Marcus Klein", site: "BHX + KTW", week: "W/C 08 Sep", hours: "45.0", overtime: "5.0", status: "Pending", shift: "Shared" },
  { id: "ts4", name: "Aleksandra Nowak", site: "Katowice", week: "W/C 08 Sep", hours: "40.0", overtime: "0", status: "Approved", shift: "Days" },
  { id: "ts5", name: "Liam O'Sullivan", site: "Birmingham", week: "W/C 08 Sep", hours: "38.5", overtime: "0", status: "Approved", shift: "Lates" },
  { id: "ts6", name: "Priya Chandran", site: "BHX + COV", week: "W/C 08 Sep", hours: "37.5", overtime: "0", status: "Approved", shift: "Days" },
];

export const SHIFT_SCHEDULE: Record<MfgSiteId, { shift: string; time: string; headcount: number; lead: string }[]> = {
  birmingham: [
    { shift: "Days", time: "06:00–14:00", headcount: 19, lead: "Denise Okafor" },
    { shift: "Lates", time: "14:00–22:00", headcount: 12, lead: "Liam O'Sullivan" },
    { shift: "Weekend On-Call", time: "—", headcount: 3, lead: "Marcus Klein" },
  ],
  katowice: [
    { shift: "Days", time: "06:00–14:00", headcount: 14, lead: "Tomasz Wiśniewski" },
    { shift: "Lates", time: "14:00–22:00", headcount: 8, lead: "Aleksandra Nowak" },
  ],
  coventry: [
    { shift: "Days", time: "07:00–15:30", headcount: 10, lead: "Site Supervisor" },
    { shift: "Part-time", time: "09:00–13:00", headcount: 4, lead: "—" },
  ],
};

// ─── Phase 7: Billing & Accounting data ──────────────────────────────────────
export const INVOICES_AR = [
  { id: "INV-1842", wo: "WO-2298", customer: "Ashford Rail Components", site: "Birmingham", amount: 42800, due: "15 Sep", daysOS: 5, status: "Overdue" },
  { id: "INV-1839", wo: "WO-2295", customer: "Nordbau GmbH", site: "Katowice", amount: 18200, due: "22 Sep", daysOS: -2, status: "Due soon" },
  { id: "INV-1851", wo: "WO-2305", customer: "Selwood Hydraulics", site: "Birmingham", amount: 76500, due: "30 Sep", daysOS: -12, status: "Current" },
  { id: "INV-1855", wo: "WO-2309", customer: "Marchetti Automazione", site: "Coventry", amount: 31200, due: "15 Oct", daysOS: -25, status: "Current" },
  { id: "INV-1830", wo: "WO-2280", customer: "Kalinowski Industries", site: "Katowice", amount: 9800, due: "10 Sep", daysOS: 10, status: "Overdue" },
];

export const PAYABLES_AP = [
  { id: "AP-0881", supplier: "Ashbourne Steel Stockholders", category: "Steel", site: "Birmingham", amount: 84200, due: "20 Sep", status: "Due soon" },
  { id: "AP-0882", supplier: "Meridian Coatings Supply", category: "Paint media", site: "Birmingham", amount: 12400, due: "25 Sep", status: "Pending" },
  { id: "AP-0883", supplier: "Hutmen Regional Supply", category: "Steel", site: "Katowice", amount: 38700, due: "18 Sep", status: "Overdue" },
  { id: "AP-0884", supplier: "National Grid (BHX)", category: "Energy", site: "Birmingham", amount: 18900, due: "28 Sep", status: "Pending" },
  { id: "AP-0885", supplier: "Tauron Energy (KTW)", category: "Energy", site: "Katowice", amount: 9400, due: "28 Sep", status: "Pending" },
];

export const GL_ENTRIES = [
  { ref: "JNL-5501", date: "30 Sep", entity: "Birmingham", debit: "Cost of Sales", credit: "Inventory", amount: 84200, status: "Posted" },
  { ref: "JNL-5502", date: "30 Sep", entity: "Katowice", debit: "Cost of Sales", credit: "Accounts Payable", amount: 38700, status: "Posted" },
  { ref: "JNL-5503", date: "30 Sep", entity: "Group", debit: "Revenue", credit: "Accounts Receivable", amount: 178700, status: "Posted" },
  { ref: "JNL-5504", date: "30 Sep", entity: "Coventry", debit: "Payroll Expense", credit: "Bank", amount: 28400, status: "Pending" },
];

export const PAYROLL_SUMMARY = [
  { site: "Birmingham", headcount: 34, grossPay: 84200, currency: "GBP", period: "Sep 2026", status: "Pending" },
  { site: "Katowice", headcount: 22, grossPay: 41000, currency: "EUR", period: "Sep 2026", status: "Pending" },
  { site: "Coventry", headcount: 14, grossPay: 28400, currency: "GBP", period: "Sep 2026", status: "Pending" },
];

// ─── Phase 8: Agent decision data ────────────────────────────────────────────
export const AGENT_DECISIONS = [
  {
    id: "ad1", agent: "Downtime Prediction Agent", site: "Birmingham", scope: "Birmingham + Katowice",
    confidence: 92, urgency: "high" as const,
    recommendation: "CNC Cell 3 spindle bearing showing wear signature — schedule PM in next maintenance window (Tue 23 Sep, 06:00–08:00) before predicted failure.",
    evidence: ["Vibration sensor ↑34% over 14 days", "Thermal drift +2°C on bearing housing", "Cycle-time variance +8% vs baseline"],
    impact: "£19,600 cost avoidance vs reactive repair",
    action: "Approve & schedule PM",
    status: "Pending" as const,
  },
  {
    id: "ad2", agent: "Schedule Risk Sentinel", site: "Group", scope: "All sites",
    confidence: 87, urgency: "medium" as const,
    recommendation: "WO-2301 (Nordbau GmbH) at risk of missing 22 Sep due date — Katowice weld cell at 94% capacity. Recommend partial re-route 2 sub-assemblies to Birmingham.",
    evidence: ["Katowice capacity utilisation 94%", "Material lead time: +2 days vs original estimate", "WO-2301 currently at Welding step 3 of 8"],
    impact: "Prevent £12,400 late-delivery penalty",
    action: "Approve re-route",
    status: "Pending" as const,
  },
  {
    id: "ad3", agent: "COPQ Erosion Monitor", site: "Katowice", scope: "All sites",
    confidence: 78, urgency: "medium" as const,
    recommendation: "Porosity defect spike traced to shielding gas batch KG-0821 — flow-rate calibration drifted 12%. Recalibrate before next weld run.",
    evidence: ["RFT rate dropped 2.8% this week", "3 non-conformances traced to Weld Bay A", "Gas flow log shows ±15% variance vs spec"],
    impact: "Recover £8,200 scrap cost this month",
    action: "Approve recalibration",
    status: "Pending" as const,
  },
  {
    id: "ad4", agent: "Resource Overload Agent", site: "Group", scope: "Cross-site",
    confidence: 95, urgency: "high" as const,
    recommendation: "Marcus Klein has overlapping commitments: Birmingham Cell 3 breakdown 23 Sep AND Katowice PM slot same day. Re-sequence Katowice PM to 26 Sep.",
    evidence: ["BHX breakdown ticket raised 12 Sep", "KTW PM schedule shows 23 Sep", "No alternative robotics-certified technician available"],
    impact: "Prevent 4-hr Katowice production loss",
    action: "Approve re-sequence",
    status: "Approved" as const,
  },
];

export const AGENT_NETWORK_NODES = [
  { id: "bhx-down", label: "Downtime Prediction", site: "Birmingham", status: "Active", connections: ["group-res"] },
  { id: "bhx-copq", label: "COPQ Monitor", site: "Birmingham", status: "Active", connections: ["group-orch"] },
  { id: "ktw-sched", label: "Schedule Risk Sentinel", site: "Katowice", status: "Active", connections: ["group-orch", "group-res"] },
  { id: "ktw-copq", label: "COPQ Monitor", site: "Katowice", status: "Active", connections: ["group-orch"] },
  { id: "cov-sched", label: "Schedule Sentinel", site: "Coventry", status: "Active", connections: ["group-orch"] },
  { id: "group-orch", label: "Group Orchestrator", site: "Group", status: "Active", connections: ["bhx-down", "bhx-copq", "ktw-sched", "ktw-copq", "cov-sched", "group-res", "group-fx"] },
  { id: "group-res", label: "Resource Overload Agent", site: "Group", status: "Active", connections: ["group-orch"] },
  { id: "group-fx", label: "FX Risk Monitor", site: "Group", status: "Pending", connections: ["group-orch"] },
  { id: "group-skill", label: "Skill Gap Predictor", site: "Group", status: "Pending", connections: ["group-orch"] },
];

// ─── Phase 9: Report catalogue ────────────────────────────────────────────────
export const REPORT_CATALOGUE = [
  { id: "r1", name: "OTIF Trend Report", category: "Production", period: "Rolling 8-week", lastRun: "Today 08:00", status: "Ready" },
  { id: "r2", name: "OEE Analysis", category: "Production", period: "MTD", lastRun: "Today 08:00", status: "Ready" },
  { id: "r3", name: "Work Order Completion", category: "Production", period: "Sep 2026", lastRun: "Yesterday", status: "Ready" },
  { id: "r4", name: "Production vs Target Variance", category: "Production", period: "Q3 2026", lastRun: "Yesterday", status: "Ready" },
  { id: "r5", name: "Right First Time (RFT) Analysis", category: "Quality", period: "MTD", lastRun: "Today 08:00", status: "Ready" },
  { id: "r6", name: "Scrap & Rework Cost (COPQ)", category: "Quality", period: "MTD", lastRun: "Today 08:00", status: "Ready" },
  { id: "r7", name: "Non-Conformance Log", category: "Quality", period: "Sep 2026", lastRun: "2 hours ago", status: "Ready" },
  { id: "r8", name: "Supplier Quality Scorecard", category: "Quality", period: "Q3 2026", lastRun: "Yesterday", status: "Ready" },
  { id: "r9", name: "Headcount & Utilisation", category: "People", period: "Sep 2026", lastRun: "Today 08:00", status: "Ready" },
  { id: "r10", name: "Overtime Analysis", category: "People", period: "W/C 08 Sep", lastRun: "Today 08:00", status: "Ready" },
  { id: "r11", name: "Skill Gap Report", category: "People", period: "Sep 2026", lastRun: "Yesterday", status: "Alert" },
  { id: "r12", name: "Timesheet Summary", category: "People", period: "W/C 08 Sep", lastRun: "Today 08:00", status: "Ready" },
  { id: "r13", name: "AR Ageing Report", category: "Finance", period: "As at today", lastRun: "Today 08:00", status: "Ready" },
  { id: "r14", name: "AP Due Report", category: "Finance", period: "Next 30 days", lastRun: "Today 08:00", status: "Ready" },
  { id: "r15", name: "Site P&L Summary", category: "Finance", period: "MTD Sep 2026", lastRun: "Yesterday", status: "Ready" },
  { id: "r16", name: "FX Exposure Report", category: "Finance", period: "Sep 2026", lastRun: "Yesterday", status: "Ready" },
  { id: "r17", name: "ISO 9001 Compliance Status", category: "Compliance", period: "Sep 2026", lastRun: "Yesterday", status: "Ready" },
  { id: "r18", name: "HSE Incident Log", category: "Compliance", period: "YTD 2026", lastRun: "Today 08:00", status: "Ready" },
  { id: "r19", name: "Audit Readiness Checklist", category: "Compliance", period: "Mar 2027 audit", lastRun: "Last week", status: "Alert" },
  { id: "r20", name: "Board Pack", category: "Executive", period: "Sep 2026", lastRun: "Yesterday", status: "Ready" },
];

export const REPORT_PREVIEW: Record<string, { headers: string[]; rows: string[][] }> = {
  r1: { headers: ["Week", "Birmingham", "Katowice", "Coventry", "Group"], rows: [["W1", "70%", "65%", "88%", "74%"], ["W2", "74%", "68%", "90%", "77%"], ["W3", "79%", "72%", "92%", "81%"], ["W4", "82%", "75%", "93%", "83%"], ["W5", "87%", "79%", "94%", "87%"], ["W6", "90%", "84%", "95%", "90%"], ["W7", "93%", "87%", "96%", "92%"], ["W8", "93%", "87%", "96%", "92%"]] },
  r5: { headers: ["Site", "RFT %", "Defects", "Scrap £", "Target"], rows: [["Birmingham", "95%", "4", "£8,200", "98%"], ["Katowice", "92%", "7", "£21,400", "98%"], ["Coventry", "97%", "1", "£2,100", "98%"]] },
  r9: { headers: ["Site", "Headcount", "Avg Util %", "OT %", "Open Reqs"], rows: [["Birmingham", "34", "87%", "8%", "2"], ["Katowice", "22", "91%", "12%", "1"], ["Coventry", "14", "79%", "0%", "0"]] },
  r13: { headers: ["Invoice", "Customer", "Amount", "Due", "Days O/S", "Status"], rows: [["INV-1842", "Ashford Rail", "£42,800", "15 Sep", "+5", "Overdue"], ["INV-1839", "Nordbau GmbH", "£18,200", "22 Sep", "-2", "Due soon"], ["INV-1851", "Selwood Hydraulics", "£76,500", "30 Sep", "-12", "Current"]] },
};

// ─── Phase 10: Compliance data ────────────────────────────────────────────────
export const COMPLIANCE_RULES = [
  { id: "c1", code: "ISO9001-4.1", framework: "ISO 9001", requirement: "Understanding the organisation and its context", status: "Compliant", sites: "All", lastChecked: "Sep 2026", deviation: null },
  { id: "c2", code: "ISO9001-8.5", framework: "ISO 9001", requirement: "Production and service provision controls", status: "Compliant", sites: "All", lastChecked: "Sep 2026", deviation: null },
  { id: "c3", code: "ISO9001-9.1", framework: "ISO 9001", requirement: "Monitoring, measurement and analysis", status: "Compliant", sites: "All", lastChecked: "Sep 2026", deviation: null },
  { id: "c4", code: "HSE-PUWER-6", framework: "UK HSE / PUWER", requirement: "Inspection of work equipment", status: "Gap", sites: "Birmingham", lastChecked: "Aug 2026", deviation: "CNC Cell 3 press overdue formal PUWER inspection by 14 days. Schedule before 30 Oct 2026." },
  { id: "c5", code: "HSE-COSHH-7", framework: "UK HSE / COSHH", requirement: "COSHH assessment for hazardous substances", status: "Compliant", sites: "Birmingham + Coventry", lastChecked: "Sep 2026", deviation: null },
  { id: "c6", code: "CE-MD-2006", framework: "EU Machinery Directive", requirement: "CE marking for machinery placed on EU market", status: "Compliant", sites: "Katowice", lastChecked: "Sep 2026", deviation: null },
  { id: "c7", code: "PIP-KTW-1", framework: "Poland PIP (Labour)", requirement: "State Labour Inspectorate compliance", status: "Review due", sites: "Katowice", lastChecked: "Jun 2026", deviation: "Annual PIP review due — schedule before Dec 2026." },
  { id: "c8", code: "ISO14001-6.1", framework: "ISO 14001", requirement: "Actions to address environmental risks", status: "In Progress", sites: "Coventry", lastChecked: "Aug 2026", deviation: "ISO 14001 certification in progress at Coventry — expected Q1 2027." },
  { id: "c9", code: "GDPR-ART30", framework: "GDPR", requirement: "Records of processing activities", status: "Compliant", sites: "All", lastChecked: "Sep 2026", deviation: null },
  { id: "c10", code: "ISO9001-10.2", framework: "ISO 9001", requirement: "Nonconformity and corrective action", status: "Gap", sites: "Katowice", lastChecked: "Sep 2026", deviation: "3 open NCRs older than 30 days without corrective action plan closure." },
];

export const COMPLIANCE_FRAMEWORKS = ["ISO 9001", "ISO 14001", "UK HSE / PUWER", "UK HSE / COSHH", "EU Machinery Directive", "Poland PIP (Labour)", "GDPR"];

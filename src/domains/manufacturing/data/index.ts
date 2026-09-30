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

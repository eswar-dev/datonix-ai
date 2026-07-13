export type ConnectorStatus = "Live" | "Partial" | "Pending";

export interface ConnectorMapping {
  id: string;
  source: string;
  connector: string;
  targetModule: string;
  status: ConnectorStatus;
  entities: string;
  lastSync: string;
  coverage: string;
  recordsMapped: number;
}

/** Connector mappings aligned with Claude artifact reference */
export const connectors: ConnectorMapping[] = [
  {
    id: "qb",
    source: "QuickBooks",
    connector: "Acctg Connector",
    targetModule: "AR / AP / GL",
    status: "Live",
    entities: "MA · ME",
    lastSync: "2 min ago",
    coverage: "94%",
    recordsMapped: 12400,
  },
  {
    id: "ajera",
    source: "Ajera",
    connector: "Project Connector",
    targetModule: "Projects & Resources",
    status: "Partial",
    entities: "MA",
    lastSync: "1 hr ago",
    coverage: "68%",
    recordsMapped: 28600,
  },
  {
    id: "hris",
    source: "HRIS / Payroll",
    connector: "Rate Card Connector",
    targetModule: "Rate Cards",
    status: "Partial",
    entities: "MA · ME · MC",
    lastSync: "3 hr ago",
    coverage: "72%",
    recordsMapped: 6200,
  },
  {
    id: "excel",
    source: "Excel / CSV",
    connector: "File Connector",
    targetModule: "Timesheets",
    status: "Live",
    entities: "All",
    lastSync: "1 hr ago",
    coverage: "100%",
    recordsMapped: 8400,
  },
];

export const dataFlowStages = [
  {
    id: "sources",
    title: "Source Systems",
    items: ["QuickBooks", "Ajera", "HRIS / Payroll", "Excel / CSV"],
  },
  {
    id: "connectors",
    title: "Connectors",
    items: ["Acctg Connector", "Project Connector", "Rate Card Connector", "File Connector"],
  },
  {
    id: "modules",
    title: "Datonix Modules",
    items: ["AR / AP / GL", "Projects & Resources", "Rate Cards", "Timesheets"],
  },
];

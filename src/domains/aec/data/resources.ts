import type { ResourceType } from "./orgChart";

export type UtilizationStatus = "Over" | "Good" | "Bench" | "At Risk";

export interface ResourceRecord {
  id: string;
  /** Backend UUID when available */
  resourceId?: string;
  name: string;
  type: ResourceType;
  entity: string;
  entityId?: string;
  designation: string;
  department: string;
  costRate: string;
  billRate: string;
  utilization: number;
  status: UtilizationStatus;
  projects: string[];
}

export const resourceSummary = {
  inHouse: 71,
  contractors: 8,
  freelancers: 4,
  avgUtilization: 73,
  capacityRisk: 2,
  benchCount: 6,
};

export const resources: ResourceRecord[] = [
  { id: "EMP-001", name: "Priya Sharma", type: "IN-HOUSE", entity: "MA", designation: "Sr. Architect", department: "Architecture", costRate: "£65/h", billRate: "£110/h", utilization: 94, status: "Over", projects: ["Kings Cross Tower"] },
  { id: "EMP-002", name: "James Okafor", type: "IN-HOUSE", entity: "MA", designation: "Project Manager", department: "PM", costRate: "£70/h", billRate: "£125/h", utilization: 82, status: "Good", projects: ["Kings Cross Tower"] },
  { id: "EMP-003", name: "Marcus Klein", type: "CONTRACTOR", entity: "ME", designation: "Structural Eng.", department: "Engineering", costRate: "£480/day", billRate: "£810/day", utilization: 55, status: "Bench", projects: ["Kings Cross Tower"] },
  { id: "EMP-004", name: "Layla Patel", type: "IN-HOUSE", entity: "MA", designation: "Design Engineer", department: "Architecture", costRate: "£58/h", billRate: "£95/h", utilization: 80, status: "Good", projects: ["Camden Housing"] },
  { id: "FRE-002", name: "Daniel Voss", type: "FREELANCER", entity: "MA", designation: "BIM Consultant", department: "Architecture", costRate: "£72/h", billRate: "£140/h", utilization: 48, status: "Bench", projects: ["Kings Cross Tower"] },
  { id: "EMP-005", name: "Sarah Mitchell", type: "IN-HOUSE", entity: "MA", designation: "Director", department: "Architecture", costRate: "£95/h", billRate: "£165/h", utilization: 78, status: "Good", projects: ["Kings Cross Tower", "Camden Housing"] },
  { id: "EMP-006", name: "David Chen", type: "IN-HOUSE", entity: "MG", designation: "CEO", department: "Leadership", costRate: "—", billRate: "—", utilization: 45, status: "Good", projects: ["Group"] },
  { id: "EMP-007", name: "Victoria Hayes", type: "IN-HOUSE", entity: "MA", designation: "Ops Director", department: "Operations", costRate: "£88/h", billRate: "£150/h", utilization: 91, status: "Over", projects: ["Multiple"] },
];

export const utilizationHeatmap = {
  weeks: ["W24", "W25", "W26", "W27", "W28", "W29", "W30", "W31"],
  rows: [
    { name: "P. Sharma", values: [94, 100, 98, 85, 70, 72, 55, 60] },
    { name: "J. Okafor", values: [82, 80, 78, 65, 75, 80, 75, 60] },
    { name: "M. Klein", values: [55, 60, 40, 38, 35, 30, 28, 25] },
    { name: "L. Patel", values: [71, 68, 80, 85, 90, 88, 75, 70] },
    { name: "D. Voss", values: [48, 52, 45, 40, 38, 35, 30, 28] },
    { name: "V. Hayes", values: [88, 91, 95, 92, 88, 85, 80, 78] },
  ],
};

export interface CrossEntityAllocation {
  resource: string;
  type: ResourceType;
  homeEntity: string;
  allocatedTo: string;
  allocationPct: number;
  costSplitHome: number;
  costSplitHost: number;
}

export const crossEntityAllocations: CrossEntityAllocation[] = [
  { resource: "Priya Sharma", type: "IN-HOUSE", homeEntity: "MA", allocatedTo: "ME — Kings Cross structural", allocationPct: 20, costSplitHome: 80, costSplitHost: 20 },
  { resource: "Marcus Klein", type: "CONTRACTOR", homeEntity: "ME", allocatedTo: "MA — Kings Cross peer review", allocationPct: 60, costSplitHome: 40, costSplitHost: 60 },
  { resource: "Daniel Voss", type: "FREELANCER", homeEntity: "MA", allocatedTo: "MC — Dubai Marina BIM", allocationPct: 35, costSplitHome: 65, costSplitHost: 35 },
];

export interface RateCardRow {
  id: string;
  role: string;
  entity: string;
  type: "IN-HOUSE" | "CONTRACTOR" | "FREELANCER";
  costRate: string;
  billRate: string;
  effectiveFrom: string;
  status: "Active" | "Pending" | "Expired";
}

export interface RateRevision {
  id: string;
  date: string;
  author: string;
  summary: string;
  changes: number;
}

export const inHouseRateCards: RateCardRow[] = [
  { id: "rh-1", role: "Director", entity: "MA", type: "IN-HOUSE", costRate: "£95/hr", billRate: "£165/hr", effectiveFrom: "2026-01-01", status: "Active" },
  { id: "rh-2", role: "Sr. Architect", entity: "MA", type: "IN-HOUSE", costRate: "£65/hr", billRate: "£110/hr", effectiveFrom: "2026-01-01", status: "Active" },
  { id: "rh-3", role: "Project Manager", entity: "MA", type: "IN-HOUSE", costRate: "£70/hr", billRate: "£125/hr", effectiveFrom: "2026-01-01", status: "Active" },
  { id: "rh-4", role: "Design Engineer", entity: "MA", type: "IN-HOUSE", costRate: "£58/hr", billRate: "£95/hr", effectiveFrom: "2026-01-01", status: "Active" },
  { id: "rh-5", role: "Structural Engineer", entity: "ME", type: "IN-HOUSE", costRate: "£72/hr", billRate: "£120/hr", effectiveFrom: "2026-01-01", status: "Active" },
];

export const contractorRateCards: RateCardRow[] = [
  { id: "rc-1", role: "Structural Engineer", entity: "ME", type: "CONTRACTOR", costRate: "£480/day", billRate: "£810/day", effectiveFrom: "2025-09-01", status: "Active" },
  { id: "rc-2", role: "MEP Consultant", entity: "MA", type: "CONTRACTOR", costRate: "£580/day", billRate: "£920/day", effectiveFrom: "2025-11-15", status: "Active" },
  { id: "rc-3", role: "BIM Consultant", entity: "MA", type: "FREELANCER", costRate: "£72/hr", billRate: "£140/hr", effectiveFrom: "2026-02-01", status: "Active" },
  { id: "rc-4", role: "Site Supervisor", entity: "MC", type: "CONTRACTOR", costRate: "AED 2,400/day", billRate: "AED 3,800/day", effectiveFrom: "2025-12-01", status: "Active" },
];

export const pendingRevisions = 2;

export const marcusKleinExpiry = {
  name: "Marcus Klein",
  role: "Structural Engineer (Contractor)",
  daysRemaining: 42,
  contractEnd: "2026-08-01",
};

export const rateRevisions: RateRevision[] = [
  { id: "rev-1", date: "2026-03-01", author: "Victoria Hayes", summary: "MA architecture rates +3% annual uplift", changes: 4 },
  { id: "rev-2", date: "2026-01-15", author: "David Chen", summary: "ME contractor framework renewal", changes: 2 },
  { id: "rev-3", date: "2025-11-01", author: "Sarah Mitchell", summary: "Freelancer BIM rate card introduced", changes: 1 },
  { id: "rev-4", date: "2025-09-01", author: "Victoria Hayes", summary: "Klein & Partners structural day rate update", changes: 1 },
];

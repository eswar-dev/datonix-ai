import { meridianMetrics } from "./meridian";

export interface FxRate {
  pair: string;
  rate: number;
  change24h: number;
  trend: "up" | "down" | "flat";
}

export interface ProjectFxImpact {
  project: string;
  entity: string;
  currency: string;
  exposureGbp: number;
  fxImpactGbp: number;
  marginImpactPct: number;
}

export const fxRates: FxRate[] = [
  { pair: "GBP/USD", rate: 1.274, change24h: 0.002, trend: "up" },
  { pair: "GBP/AED", rate: 4.682, change24h: -0.008, trend: "down" },
  { pair: "GBP/EUR", rate: 1.168, change24h: 0.001, trend: "flat" },
  { pair: "USD/AED", rate: 3.673, change24h: -0.003, trend: "down" },
];

export const fxSummary = {
  exposureGbp: 218_000,
  fxPnlGbp: -14_000,
  reportingCurrency: "GBP",
  groupRevenueGbp: meridianMetrics.financial.groupRevenueGbp,
};

export const projectFxImpacts: ProjectFxImpact[] = [
  { project: "Dubai Marina Dev.", entity: "MC", currency: "AED", exposureGbp: 142_000, fxImpactGbp: -9_800, marginImpactPct: -1.2 },
  { project: "Kings Cross Tower", entity: "MA", currency: "GBP", exposureGbp: 48_000, fxImpactGbp: 0, marginImpactPct: 0 },
  { project: "Abu Dhabi Civic", entity: "MC", currency: "AED", exposureGbp: 76_000, fxImpactGbp: -4_200, marginImpactPct: -0.8 },
  { project: "Camden Housing", entity: "MA", currency: "GBP", exposureGbp: 28_000, fxImpactGbp: 0, marginImpactPct: 0 },
];

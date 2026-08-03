import type { EntityStatus } from "./meridian";

export interface LayerSummary {
  id: "org" | "resource" | "financial" | "operational";
  title: string;
  subtitle: string;
  metrics: { label: string; value: string }[];
  linkTo: string;
  linkLabel: string;
}

export interface EntityTreeNode {
  id: string;
  name: string;
  code?: string;
  staffCount?: number;
  status?: EntityStatus;
  children?: EntityTreeNode[];
}

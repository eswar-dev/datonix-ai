import type { Inquiry } from "./inquiries";
import type { ProjectEntity } from "./projects";

/** Maps inquiry IDs to canonical project IDs for pipeline → WBS flow */
export const inquiryToProjectId: Record<string, string> = {
  "inq-holborn": "prj-kings-cross",
  "inq-city": "prj-camden-phase2",
  "inq-dubai": "prj-dubai-marina",
  "inq-meridian-homes": "prj-camden",
  "inq-northgate": "prj-northgate-hub",
  "inq-northbridge": "prj-kings-cross-extension",
  "inq-harbour": "prj-harbour-health",
  "inq-al-noor": "prj-abu-dhabi-civic",
  "hz-inq-1": "hz-prj-bridge",
  "hz-inq-2": "hz-prj-bridge",
};

export function resolveProjectIdFromInquiry(inquiry: Inquiry): string {
  return inquiryToProjectId[inquiry.id] ?? slugToProjectId(inquiry.projectName);
}

export function slugToProjectId(name: string): string {
  return `prj-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

export function billingTypeForInquiry(inquiry: Inquiry): "Lump Sum" | "Milestone" | "T&M" {
  if (inquiry.client === "Holborn Partners" || inquiry.projectType === "Commercial") return "Lump Sum";
  if (inquiry.entity === "MC" || inquiry.projectType === "Mixed Use") return "T&M";
  return "Milestone";
}

export function currencyForEntity(entity: ProjectEntity | Inquiry["entity"]): string {
  return entity === "MC" || entity === "MC+MA" ? "AED" : "GBP";
}

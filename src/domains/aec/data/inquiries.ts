export type InquiryStage =
  | "Inquiry"
  | "Qualification"
  | "Proposal"
  | "Negotiation"
  | "Won"
  | "Lost";
/** Organization code from twin API (e.g. MG, MA). */
export type InquiryEntity = string;

export interface Inquiry {
  id: string;
  client: string;
  projectName: string;
  entity: InquiryEntity;
  /** Organization UUID from backend (needed for create/convert) */
  entityId?: string;
  projectType: string;
  stage: InquiryStage;
  /** Human-readable stage from artifact (e.g. "Proposal Due") */
  stageLabel: string;
  score: number;
  valueGbp: number;
  valueDisplay: string;
  contact: string;
  receivedDate: string;
  suggestedAction: string;
}

export const inquiryMetrics = (inquiries: Inquiry[]) => ({
  activeInquiries: inquiries.filter((i) => i.stage !== "Won" && i.stage !== "Lost").length,
  proposals: inquiries.filter((i) => i.stage === "Proposal" || i.stageLabel.includes("Proposal")).length,
  pipelineGbp: inquiries.reduce((s, i) => s + i.valueGbp, 0),
  winRatePct: 62,
});

/** Canonical opportunities from Claude artifact reference */
export const inquiries: Inquiry[] = [
  {
    id: "inq-holborn",
    client: "Holborn Partners",
    projectName: "Kings Cross Tower",
    entity: "MA",
    projectType: "Commercial",
    stage: "Proposal",
    stageLabel: "Proposal Due",
    score: 94,
    valueGbp: 220_000,
    valueDisplay: "£220K",
    contact: "Sarah Mitchell",
    receivedDate: "2026-02-18",
    suggestedAction: "Generate Proposal",
  },
  {
    id: "inq-city",
    client: "City Council",
    projectName: "Camden Housing Phase 2",
    entity: "MA",
    projectType: "Urban Planning",
    stage: "Negotiation",
    stageLabel: "Reviewing RFP",
    score: 88,
    valueGbp: 340_000,
    valueDisplay: "£340K",
    contact: "James Okafor",
    receivedDate: "2026-01-30",
    suggestedAction: "Convert",
  },
  {
    id: "inq-dubai",
    client: "Dubai Dev. Authority",
    projectName: "Dubai Marina Dev.",
    entity: "MC",
    projectType: "Mixed Use",
    stage: "Proposal",
    stageLabel: "Proposal Sent",
    score: 79,
    valueGbp: 240_000,
    valueDisplay: "AED 1.2M",
    contact: "Fatima Al-Rashid",
    receivedDate: "2026-03-01",
    suggestedAction: "Follow Up",
  },
  {
    id: "inq-meridian-homes",
    client: "Meridian Homes",
    projectName: "Camden Housing",
    entity: "MA",
    projectType: "Residential",
    stage: "Qualification",
    stageLabel: "Qualification",
    score: 72,
    valueGbp: 185_000,
    valueDisplay: "£185K",
    contact: "Priya Sharma",
    receivedDate: "2026-03-10",
    suggestedAction: "Score",
  },
  {
    id: "inq-northgate",
    client: "Northgate Developments",
    projectName: "Riverside Logistics Hub",
    entity: "ME",
    projectType: "Industrial",
    stage: "Inquiry",
    stageLabel: "New Inquiry",
    score: 65,
    valueGbp: 95_000,
    valueDisplay: "£95K",
    contact: "Marcus Klein",
    receivedDate: "2026-02-22",
    suggestedAction: "Review",
  },
  {
    id: "inq-northbridge",
    client: "Northbridge Estates",
    projectName: "Kings Cross Tower Extension",
    entity: "MA",
    projectType: "Commercial",
    stage: "Proposal",
    stageLabel: "Proposal Due",
    score: 91,
    valueGbp: 480_000,
    valueDisplay: "£480K",
    contact: "David Chen",
    receivedDate: "2026-02-05",
    suggestedAction: "Generate Proposal",
  },
  {
    id: "inq-harbour",
    client: "Harbour Health Trust",
    projectName: "St. Mary's Wing Refurbishment",
    entity: "ME",
    projectType: "Healthcare",
    stage: "Inquiry",
    stageLabel: "New Inquiry",
    score: 72,
    valueGbp: 310_000,
    valueDisplay: "£310K",
    contact: "Emma Walsh",
    receivedDate: "2026-03-12",
    suggestedAction: "Review",
  },
  {
    id: "inq-al-noor",
    client: "Al Noor Holdings",
    projectName: "Abu Dhabi Civic Centre",
    entity: "MC",
    projectType: "Civic",
    stage: "Qualification",
    stageLabel: "Qualification",
    score: 85,
    valueGbp: 950_000,
    valueDisplay: "£950K",
    contact: "Omar Hassan",
    receivedDate: "2026-01-15",
    suggestedAction: "Follow Up",
  },
];

export const proposalTemplate = (inquiry: Inquiry) => ({
  title: `Proposal — ${inquiry.projectName}`,
  client: inquiry.client,
  entity: inquiry.entity,
  type: inquiry.projectType,
  value: inquiry.valueDisplay,
  sections: [
    "Executive Summary",
    "Scope of Services",
    "Team & Qualifications",
    "Fee Proposal & Schedule",
    "Terms & Assumptions",
  ],
  summary: `Datonix ${inquiry.entity} proposes ${inquiry.projectType.toLowerCase()} services for ${inquiry.client}. Estimated fee ${inquiry.valueDisplay} based on ${inquiry.stageLabel.toLowerCase()} scope.`,
});

export const quotationTemplate = (inquiry: Inquiry) => ({
  title: `Quotation — ${inquiry.projectName}`,
  reference: `QT-${inquiry.entity}-${inquiry.id.slice(-4).toUpperCase()}`,
  client: inquiry.client,
  entity: inquiry.entity,
  validUntil: "2026-04-30",
  lineItems: [
    { description: "Professional fees — concept & design", amount: Math.round(inquiry.valueGbp * 0.55), unit: "Lump sum" },
    { description: "Disbursements & surveys", amount: Math.round(inquiry.valueGbp * 0.15), unit: "Estimate" },
    { description: "Project management & coordination", amount: Math.round(inquiry.valueGbp * 0.3), unit: "Lump sum" },
  ],
  total: inquiry.valueGbp,
  currency: inquiry.entity === "MC" ? "AED" : "GBP",
  terms: "Fees exclusive of VAT. Quotation valid 30 days. Subject to scope confirmation.",
});

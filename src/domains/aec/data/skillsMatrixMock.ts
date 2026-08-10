export type SkillRating = 1 | 2 | 3 | 4 | 5;

export interface SkillCategorySkillRow {
  name: string;
  resources: number;
  available: number;
  utilPct: number;
}

export interface SkillCategoryCard {
  id: string;
  title: string;
  entityCode: string;
  accent: "accent" | "blue" | "amber";
  skills: SkillCategorySkillRow[];
}

export interface SkillColumnGroup {
  id: string;
  label: string;
  columns: string[];
}

export interface SkillMatrixPerson {
  id: string;
  name: string;
  role: string;
  employmentType: "IN-HOUSE" | "CONTRACTOR" | "FREELANCER";
  entity: string;
  /** Map of skill column key → rating, or undefined if N/A */
  ratings: Record<string, SkillRating | null>;
}

export const skillRatingLegend: { rating: SkillRating; label: string }[] = [
  { rating: 5, label: "Expert" },
  { rating: 4, label: "Adv." },
  { rating: 3, label: "Prof." },
  { rating: 2, label: "Basic" },
  { rating: 1, label: "Beginner" },
];

export const skillCategoryCards: SkillCategoryCard[] = [
  {
    id: "architecture",
    title: "Architecture Skills",
    entityCode: "MA",
    accent: "accent",
    skills: [
      { name: "Architect", resources: 12, available: 3, utilPct: 88 },
      { name: "BIM Engineer", resources: 8, available: 2, utilPct: 82 },
      { name: "Drafting Engineer", resources: 10, available: 4, utilPct: 71 },
      { name: "Planner", resources: 6, available: 2, utilPct: 78 },
    ],
  },
  {
    id: "engineering",
    title: "Engineering Skills",
    entityCode: "ME",
    accent: "blue",
    skills: [
      { name: "Mechanical Eng.", resources: 5, available: 2, utilPct: 68 },
      { name: "Electrical Eng.", resources: 4, available: 1, utilPct: 75 },
      { name: "Structural Eng.", resources: 6, available: 3, utilPct: 55 },
      { name: "Civil Engineer", resources: 3, available: 1, utilPct: 70 },
    ],
  },
  {
    id: "construction",
    title: "Construction Skills",
    entityCode: "MC",
    accent: "amber",
    skills: [
      { name: "Site Manager", resources: 5, available: 1, utilPct: 90 },
      { name: "Qty. Surveyor", resources: 4, available: 2, utilPct: 65 },
      { name: "Foreman", resources: 7, available: 3, utilPct: 72 },
      { name: "H&S Manager", resources: 2, available: 1, utilPct: 60 },
    ],
  },
];

export const skillColumnGroups: SkillColumnGroup[] = [
  {
    id: "architecture",
    label: "Architecture",
    columns: ["Concept", "BIM", "Drafting", "Planning"],
  },
  {
    id: "engineering",
    label: "Engineering",
    columns: ["Structural", "Mechanical", "Civil"],
  },
  {
    id: "construction",
    label: "Construction",
    columns: ["Site Mgmt", "QS"],
  },
  {
    id: "pm",
    label: "PM / Soft",
    columns: ["Scheduling", "Risk", "Client"],
  },
];

export const skillMatrixPeople: SkillMatrixPerson[] = [
  {
    id: "p1",
    name: "P. Sharma",
    role: "Sr Architect",
    employmentType: "IN-HOUSE",
    entity: "MA",
    ratings: {
      Concept: 5,
      BIM: 4,
      Drafting: 4,
      Planning: 5,
      Structural: 2,
      Mechanical: 1,
      Civil: 1,
      "Site Mgmt": null,
      QS: null,
      Scheduling: 4,
      Risk: 4,
      Client: 5,
    },
  },
  {
    id: "p2",
    name: "J. Okafor",
    role: "Project Manager",
    employmentType: "IN-HOUSE",
    entity: "MA",
    ratings: {
      Concept: 3,
      BIM: 2,
      Drafting: 2,
      Planning: 4,
      Structural: 2,
      Mechanical: 2,
      Civil: 2,
      "Site Mgmt": 3,
      QS: 2,
      Scheduling: 5,
      Risk: 5,
      Client: 5,
    },
  },
  {
    id: "p3",
    name: "M. Klein",
    role: "Structural Eng.",
    employmentType: "CONTRACTOR",
    entity: "ME",
    ratings: {
      Concept: 2,
      BIM: 3,
      Drafting: 3,
      Planning: 2,
      Structural: 5,
      Mechanical: 4,
      Civil: 4,
      "Site Mgmt": 2,
      QS: 1,
      Scheduling: 3,
      Risk: 4,
      Client: 3,
    },
  },
  {
    id: "p4",
    name: "L. Patel",
    role: "Design Engineer",
    employmentType: "IN-HOUSE",
    entity: "MA",
    ratings: {
      Concept: 4,
      BIM: 5,
      Drafting: 5,
      Planning: 3,
      Structural: 2,
      Mechanical: 2,
      Civil: 1,
      "Site Mgmt": null,
      QS: null,
      Scheduling: 3,
      Risk: 2,
      Client: 3,
    },
  },
  {
    id: "p5",
    name: "D. Voss",
    role: "BIM Consultant",
    employmentType: "FREELANCER",
    entity: "MA",
    ratings: {
      Concept: 3,
      BIM: 5,
      Drafting: 4,
      Planning: 2,
      Structural: 3,
      Mechanical: 2,
      Civil: 2,
      "Site Mgmt": null,
      QS: null,
      Scheduling: 2,
      Risk: 2,
      Client: 3,
    },
  },
  {
    id: "p6",
    name: "N. Farouk",
    role: "Qty. Surveyor",
    employmentType: "CONTRACTOR",
    entity: "MC",
    ratings: {
      Concept: 1,
      BIM: 2,
      Drafting: 2,
      Planning: 3,
      Structural: 2,
      Mechanical: 1,
      Civil: 3,
      "Site Mgmt": 4,
      QS: 5,
      Scheduling: 3,
      Risk: 3,
      Client: 4,
    },
  },
];

export function ratingBadgeClass(rating: number): string {
  if (rating >= 5) return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
  if (rating >= 4) return "bg-teal-500/15 text-teal-700 border-teal-500/30";
  if (rating >= 3) return "bg-sky-500/15 text-sky-700 border-sky-500/30";
  if (rating >= 2) return "bg-amber-500/15 text-amber-700 border-amber-500/30";
  return "bg-rose-500/15 text-rose-700 border-rose-500/30";
}

export interface EntitySkillRow {
  name: string;
  resources: number;
  available: number;
  util: number;
}

export interface EntitySkillTable {
  entity: string;
  skills: EntitySkillRow[];
}

export interface IndividualSkillRating {
  name: string;
  entity: string;
  role: string;
  skills: { name: string; rating: number }[];
}

export const skillsMatrix: EntitySkillTable[] = [
  {
    entity: "Architecture (MA)",
    skills: [
      { name: "Architect", resources: 12, available: 3, util: 88 },
      { name: "BIM Engineer", resources: 8, available: 4, util: 72 },
      { name: "Drafting Engineer", resources: 6, available: 2, util: 76 },
      { name: "Planner", resources: 4, available: 1, util: 91 },
    ],
  },
  {
    entity: "Engineering (ME)",
    skills: [
      { name: "Mechanical Eng.", resources: 5, available: 2, util: 61 },
      { name: "Electrical Eng.", resources: 4, available: 1, util: 74 },
      { name: "Structural Eng.", resources: 6, available: 3, util: 55 },
    ],
  },
  {
    entity: "Construction (MC)",
    skills: [
      { name: "Site Manager", resources: 5, available: 1, util: 90 },
      { name: "Qty. Surveyor", resources: 4, available: 2, util: 68 },
      { name: "Foreman", resources: 3, available: 0, util: 95 },
    ],
  },
];

export const individualRatings: IndividualSkillRating[] = [
  {
    name: "Priya Sharma",
    entity: "MA",
    role: "Sr. Architect",
    skills: [
      { name: "Design", rating: 5 },
      { name: "BIM", rating: 4 },
      { name: "Client Mgmt", rating: 4 },
      { name: "Planning", rating: 3 },
    ],
  },
  {
    name: "James Okafor",
    entity: "MA",
    role: "Project Manager",
    skills: [
      { name: "PM", rating: 5 },
      { name: "Cost Control", rating: 4 },
      { name: "Risk Mgmt", rating: 4 },
      { name: "BIM", rating: 3 },
    ],
  },
  {
    name: "Marcus Klein",
    entity: "ME",
    role: "Structural Eng.",
    skills: [
      { name: "Structural", rating: 5 },
      { name: "Peer Review", rating: 5 },
      { name: "BIM", rating: 3 },
      { name: "Site", rating: 2 },
    ],
  },
  {
    name: "Layla Patel",
    entity: "MA",
    role: "Design Engineer",
    skills: [
      { name: "Design", rating: 4 },
      { name: "BIM", rating: 5 },
      { name: "Drafting", rating: 4 },
      { name: "Coordination", rating: 3 },
    ],
  },
];

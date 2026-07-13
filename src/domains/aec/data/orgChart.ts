export type ResourceType = "IN-HOUSE" | "CONTRACTOR" | "FREELANCER";

export interface OrgMember {
  id: string;
  initials: string;
  name: string;
  type: ResourceType;
  title: string;
  entity: string;
  reportsTo?: string;
  children?: OrgMember[];
  email?: string;
  costRate: string;
  billRate: string;
  utilization: number;
  allocation: string;
  projects: string[];
}

export const orgChartRoot: OrgMember = {
  id: "dc",
  initials: "DC",
  name: "David Chen",
  type: "IN-HOUSE",
  title: "CEO / Managing Director",
  entity: "MG",
  email: "david.chen@meridianarchitects.com",
  costRate: "—",
  billRate: "—",
  utilization: 45,
  allocation: "Group leadership",
  projects: ["Meridian Group"],
  children: [
    {
      id: "sm",
      initials: "SM",
      name: "Sarah Mitchell",
      type: "IN-HOUSE",
      title: "Director — Architecture",
      entity: "MA",
      reportsTo: "dc",
      costRate: "£95/hr",
      billRate: "£165/hr",
      utilization: 78,
      allocation: "Kings Cross Tower (40%)",
      projects: ["Kings Cross Tower", "Camden Housing"],
      children: [
        {
          id: "jo",
          initials: "JO",
          name: "James Okafor",
          type: "IN-HOUSE",
          title: "Team Lead — Project Management",
          entity: "MA",
          reportsTo: "sm",
          costRate: "£70/hr",
          billRate: "£125/hr",
          utilization: 82,
          allocation: "Kings Cross Tower (60%)",
          projects: ["Kings Cross Tower"],
        },
        {
          id: "ps",
          initials: "PS",
          name: "Priya Sharma",
          type: "IN-HOUSE",
          title: "Sr. Architect",
          entity: "MA",
          reportsTo: "sm",
          costRate: "£65/hr",
          billRate: "£110/hr",
          utilization: 94,
          allocation: "Kings Cross Tower (80%)",
          projects: ["Kings Cross Tower", "Holborn Retrofit"],
        },
        {
          id: "lp",
          initials: "LP",
          name: "Layla Patel",
          type: "IN-HOUSE",
          title: "Design Engineer",
          entity: "MA",
          reportsTo: "sm",
          costRate: "£58/hr",
          billRate: "£95/hr",
          utilization: 80,
          allocation: "Camden Housing (50%)",
          projects: ["Camden Housing"],
        },
      ],
    },
    {
      id: "mk",
      initials: "MK",
      name: "Marcus Klein",
      type: "CONTRACTOR",
      title: "Director — Engineering",
      entity: "ME",
      reportsTo: "dc",
      costRate: "£480/day",
      billRate: "£810/day",
      utilization: 55,
      allocation: "Structural peer review (bench)",
      projects: ["Kings Cross Tower"],
      children: [],
    },
    {
      id: "dv",
      initials: "DV",
      name: "Daniel Voss",
      type: "FREELANCER",
      title: "BIM Consultant",
      entity: "MA",
      reportsTo: "dc",
      costRate: "£72/hr",
      billRate: "£140/hr",
      utilization: 48,
      allocation: "Ad-hoc BIM support",
      projects: ["Kings Cross Tower"],
    },
  ],
};

export function flattenOrgMembers(root: OrgMember): OrgMember[] {
  const list: OrgMember[] = [];
  const walk = (node: OrgMember) => {
    const { children, ...member } = node;
    list.push({ ...member, children: undefined });
    children?.forEach(walk);
  };
  walk(root);
  return list;
}

export const orgMemberCount = 83;

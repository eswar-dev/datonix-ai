export interface WbsPhase {
  id: string;
  name: string;
  status: "Complete" | "In Progress" | "Not Started";
  progress: number;
  budgetGbp: number;
  spentGbp: number;
  tasks: { id: string; name: string; progress: number; children?: string[] }[];
}

export interface Milestone {
  id: string;
  name: string;
  phase: string;
  plannedDate: string;
  actualDate: string | null;
  varianceDays: number;
  status: "Complete" | "On Track" | "At Risk" | "Overdue";
}

export interface WbsProject {
  id: string;
  name: string;
  phases: WbsPhase[];
  milestones: Milestone[];
  riskSignal: {
    severity: "High" | "Medium" | "Low";
    title: string;
    message: string;
    recommendation: string;
  };
}

/** WBS structure from Claude artifact — Kings Cross Tower default */
export const wbsProjects: WbsProject[] = [
  {
    id: "prj-kings-cross",
    name: "Kings Cross Tower",
    riskSignal: {
      severity: "High",
      title: "AI Risk Signal — Schedule Risk",
      message:
        "Phase 3 · Planning Submission at 64% with Concept Design +3d variance. Critical path slippage on planning drawings package.",
      recommendation:
        "Add 1 structural engineer from ME for 4 weeks. Escalate planning submission review to weekly cadence with Holborn Partners.",
    },
    phases: [
      {
        id: "ph-1",
        name: "Phase 1 · Site Investigation",
        status: "Complete",
        progress: 100,
        budgetGbp: 32_000,
        spentGbp: 31_000,
        tasks: [
          { id: "t-1-1", name: "1.1 Topographical Survey", progress: 100 },
          { id: "t-1-2", name: "1.2 Ground Investigation", progress: 100 },
        ],
      },
      {
        id: "ph-2",
        name: "Phase 2 · Concept Design",
        status: "Complete",
        progress: 100,
        budgetGbp: 48_000,
        spentGbp: 47_200,
        tasks: [
          { id: "t-2-1", name: "2.1 Design Brief", progress: 100 },
          { id: "t-2-2", name: "2.2 Massing Studies", progress: 100 },
          { id: "t-2-3", name: "2.3 Concept Drawings (BIM)", progress: 100 },
        ],
      },
      {
        id: "ph-3",
        name: "Phase 3 · Planning Submission",
        status: "In Progress",
        progress: 64,
        budgetGbp: 72_000,
        spentGbp: 46_000,
        tasks: [
          {
            id: "t-3-1",
            name: "3.1 Planning Drawings",
            progress: 64,
            children: ["3.1.1 Elevations", "3.1.2 Floor Plans", "3.1.3 Site Layout"],
          },
          { id: "t-3-2", name: "3.2 Design & Access Statement", progress: 0 },
          { id: "t-3-3", name: "3.3 LPA Submission", progress: 0 },
        ],
      },
      {
        id: "ph-4",
        name: "Phase 4 · Technical Design",
        status: "Not Started",
        progress: 0,
        budgetGbp: 96_000,
        spentGbp: 0,
        tasks: [],
      },
      {
        id: "ph-5",
        name: "Phase 5 · Construction",
        status: "Not Started",
        progress: 0,
        budgetGbp: 62_000,
        spentGbp: 0,
        tasks: [],
      },
    ],
    milestones: [
      { id: "ms-1", name: "Site Survey", phase: "Phase 1", plannedDate: "02 May", actualDate: "01 May", varianceDays: -1, status: "Complete" },
      { id: "ms-2", name: "Concept Design", phase: "Phase 2", plannedDate: "25 May", actualDate: "28 May", varianceDays: 3, status: "At Risk" },
      { id: "ms-3", name: "Planning Submission", phase: "Phase 3", plannedDate: "30 Jun", actualDate: null, varianceDays: 0, status: "On Track" },
      { id: "ms-4", name: "Technical Design", phase: "Phase 4", plannedDate: "15 Aug", actualDate: null, varianceDays: 0, status: "On Track" },
    ],
  },
  {
    id: "prj-camden",
    name: "Camden Housing",
    riskSignal: {
      severity: "Medium",
      title: "AI Risk Signal — Margin Pressure",
      message: "Phase 2 scope creep — 3 change requests unpriced. Margin forecast 22% vs 24% target.",
      recommendation: "Issue change order notices before proceeding with additional residential units.",
    },
    phases: [
      {
        id: "ch-1",
        name: "Phase 1 · Feasibility",
        status: "Complete",
        progress: 100,
        budgetGbp: 18_000,
        spentGbp: 17_500,
        tasks: [{ id: "ch-t1", name: "Site survey & feasibility", progress: 100 }],
      },
      {
        id: "ch-2",
        name: "Phase 2 · Design Development",
        status: "In Progress",
        progress: 38,
        budgetGbp: 67_000,
        spentGbp: 28_000,
        tasks: [{ id: "ch-t2", name: "Unit layouts & DD package", progress: 38 }],
      },
    ],
    milestones: [
      { id: "ch-ms-1", name: "Feasibility report", phase: "Phase 1", plannedDate: "2026-01-10", actualDate: "2026-01-10", varianceDays: 0, status: "Complete" },
      { id: "ch-ms-2", name: "DD package", phase: "Phase 2", plannedDate: "2026-06-15", actualDate: null, varianceDays: 0, status: "On Track" },
    ],
  },
  {
    id: "prj-dubai-marina",
    name: "Dubai Marina Dev.",
    riskSignal: {
      severity: "Medium",
      title: "AI Risk Signal — FX Exposure",
      message: "Cross-entity MA+MC delivery with AED billing — FX variance on Q2 forecast.",
      recommendation: "Hedge 50% of AED exposure before next milestone billing cycle.",
    },
    phases: [
      { id: "dm-1", name: "Phase 1 · Master Planning", status: "In Progress", progress: 22, budgetGbp: 180_000, spentGbp: 42_000, tasks: [{ id: "dm-t1", name: "Master plan & massing", progress: 22 }] },
      { id: "dm-2", name: "Phase 2 · Detailed Design", status: "Not Started", progress: 0, budgetGbp: 420_000, spentGbp: 0, tasks: [] },
    ],
    milestones: [
      { id: "dm-ms-1", name: "Master plan approval", phase: "Phase 1", plannedDate: "2026-05-01", actualDate: null, varianceDays: 0, status: "On Track" },
    ],
  },
  {
    id: "prj-holborn-retrofit",
    name: "Holborn Retrofit",
    riskSignal: {
      severity: "Low",
      title: "AI Risk Signal — Early Stage",
      message: "Design review phase — within budget and schedule.",
      recommendation: "Continue T&M billing with weekly client sign-off.",
    },
    phases: [
      { id: "hr-1", name: "Phase 1 · Design Review", status: "In Progress", progress: 20, budgetGbp: 28_000, spentGbp: 5_600, tasks: [{ id: "hr-t1", name: "Existing conditions survey", progress: 20 }] },
    ],
    milestones: [
      { id: "hr-ms-1", name: "Design review complete", phase: "Phase 1", plannedDate: "2026-05-15", actualDate: null, varianceDays: 0, status: "On Track" },
    ],
  },
  {
    id: "prj-kings-cross-extension",
    name: "Kings Cross Tower Extension",
    riskSignal: {
      severity: "Low",
      title: "AI Risk Signal — Mobilisation",
      message: "Early mobilisation — team ramp-up in progress.",
      recommendation: "Align WBS with parent Kings Cross Tower deliverables.",
    },
    phases: [
      { id: "kce-1", name: "Phase 1 · Mobilisation", status: "In Progress", progress: 8, budgetGbp: 48_000, spentGbp: 3_800, tasks: [{ id: "kce-t1", name: "Team mobilisation", progress: 8 }] },
    ],
    milestones: [
      { id: "kce-ms-1", name: "Kick-off", phase: "Phase 1", plannedDate: "2026-04-01", actualDate: "2026-04-01", varianceDays: 0, status: "Complete" },
    ],
  },
  {
    id: "prj-camden-phase2",
    name: "Camden Housing Phase 2",
    riskSignal: {
      severity: "Medium",
      title: "AI Risk Signal — Margin Pressure",
      message: "Urban planning scope under negotiation — margin forecast 18% vs 24% target.",
      recommendation: "Confirm RFP scope boundaries before design mobilisation.",
    },
    phases: [
      { id: "cp2-1", name: "Phase 1 · RFP Response", status: "In Progress", progress: 12, budgetGbp: 40_000, spentGbp: 4_800, tasks: [{ id: "cp2-t1", name: "Planning strategy", progress: 12 }] },
    ],
    milestones: [
      { id: "cp2-ms-1", name: "RFP submission", phase: "Phase 1", plannedDate: "2026-04-25", actualDate: null, varianceDays: 0, status: "On Track" },
    ],
  },
];

export const defaultWbsProjectId = "prj-kings-cross";

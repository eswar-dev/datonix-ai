import type { Inquiry } from "@/domains/aec/data/inquiries";
import type { Project } from "@/domains/aec/data/projects";
import type { WbsProject } from "@/domains/aec/data/wbs";

const PREFIX = "datonix-aec-pipeline-v1";

export function isApiTwinId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export interface PipelineCache {
  inquiries: Inquiry[];
  inquiryMetrics: {
    activeInquiries: number;
    proposals: number;
    pipelineGbp: number;
    winRatePct: number;
  } | null;
  projects: Project[];
  wbsByProjectId: Record<string, WbsProject>;
  proposalsByInquiryId: Record<string, unknown>;
  quotationsByInquiryId: Record<string, unknown>;
  profitabilityByProjectId: Record<string, unknown>;
  updatedAt: string;
}

function emptyCache(): PipelineCache {
  return {
    inquiries: [],
    inquiryMetrics: null,
    projects: [],
    wbsByProjectId: {},
    proposalsByInquiryId: {},
    quotationsByInquiryId: {},
    profitabilityByProjectId: {},
    updatedAt: new Date().toISOString(),
  };
}

function key(twinId: string) {
  return `${PREFIX}:${twinId}`;
}

export function loadPipelineCache(twinId: string): PipelineCache {
  if (typeof localStorage === "undefined" || !twinId) return emptyCache();
  try {
    const raw = localStorage.getItem(key(twinId));
    if (!raw) return emptyCache();
    return { ...emptyCache(), ...(JSON.parse(raw) as PipelineCache) };
  } catch {
    return emptyCache();
  }
}

export function savePipelineCache(twinId: string, partial: Partial<PipelineCache>) {
  if (typeof localStorage === "undefined" || !twinId) return;
  const prev = loadPipelineCache(twinId);
  const next: PipelineCache = {
    ...prev,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(key(twinId), JSON.stringify(next));
}

export function cacheProposal(twinId: string, inquiryId: string, proposal: unknown) {
  const prev = loadPipelineCache(twinId);
  savePipelineCache(twinId, {
    proposalsByInquiryId: { ...prev.proposalsByInquiryId, [inquiryId]: proposal },
  });
}

export function cacheQuotation(twinId: string, inquiryId: string, quotation: unknown) {
  const prev = loadPipelineCache(twinId);
  savePipelineCache(twinId, {
    quotationsByInquiryId: { ...prev.quotationsByInquiryId, [inquiryId]: quotation },
  });
}

export function cacheWbs(twinId: string, projectId: string, wbs: WbsProject) {
  const prev = loadPipelineCache(twinId);
  savePipelineCache(twinId, {
    wbsByProjectId: { ...prev.wbsByProjectId, [projectId]: wbs },
  });
}

export function cacheProfitability(twinId: string, projectId: string, data: unknown) {
  const prev = loadPipelineCache(twinId);
  savePipelineCache(twinId, {
    profitabilityByProjectId: { ...prev.profitabilityByProjectId, [projectId]: data },
  });
}

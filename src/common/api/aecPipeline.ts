import { apiJson, type ApiInit } from "./client";

function twinBase(twinId: string) {
  return `/api/v1/aec/twins/${twinId}`;
}

function jsonInit(body: unknown, init: ApiInit = {}): ApiInit {
  return {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers as HeadersInit | undefined) },
    body: JSON.stringify(body ?? {}),
  };
}

/** Unwrap `{ success, data }` envelopes from AEC APIs. */
export function unwrapAecData<T = unknown>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in raw) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

export async function aecListInquiries(
  twinId: string,
  query: Record<string, string> = {},
  init: ApiInit = {}
) {
  const qs = new URLSearchParams({ page: "1", pageSize: "200", ...query });
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/inquiries?${qs}`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecInquiryMetrics(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/inquiries/metrics`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecCreateInquiry(
  twinId: string,
  body: Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/inquiries`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecUpdateInquiry(
  twinId: string,
  inquiryId: string,
  body: Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/inquiries/${inquiryId}`, {
    ...init,
    method: "PATCH",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecUpdateInquiryStage(
  twinId: string,
  inquiryId: string,
  stage: string,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/inquiries/${inquiryId}/stage`, {
    ...init,
    method: "PATCH",
    ...jsonInit({ stage: stage.toLowerCase() }),
  });
  return unwrapAecData(raw);
}

export async function aecDeleteInquiry(twinId: string, inquiryId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/inquiries/${inquiryId}`, {
    ...init,
    method: "DELETE",
  });
  return unwrapAecData(raw);
}

export async function aecGenerateProposal(
  twinId: string,
  inquiryId: string,
  body: Record<string, unknown> = {},
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/inquiries/${inquiryId}/proposal`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecGenerateQuotation(
  twinId: string,
  inquiryId: string,
  body: Record<string, unknown> = {},
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/inquiries/${inquiryId}/quotation`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecConvertInquiry(
  twinId: string,
  inquiryId: string,
  body: Record<string, unknown> = {},
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/inquiries/${inquiryId}/convert`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecListProjects(
  twinId: string,
  query: Record<string, string> = {},
  init: ApiInit = {}
) {
  const qs = new URLSearchParams({ page: "1", pageSize: "200", ...query });
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/projects?${qs}`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecCreateProject(
  twinId: string,
  body: Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/projects`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecUpdateProject(
  twinId: string,
  projectId: string,
  body: Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/projects/${projectId}`, {
    ...init,
    method: "PATCH",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecProjectRecommendations(
  twinId: string,
  query: Record<string, string> = {},
  init: ApiInit = {}
) {
  const qs = new URLSearchParams(query);
  const path = qs.toString()
    ? `${twinBase(twinId)}/projects/recommendations?${qs}`
    : `${twinBase(twinId)}/projects/recommendations`;
  const raw = await apiJson<unknown>(path, { ...init, method: "GET" });
  return unwrapAecData(raw);
}

export async function aecGetWbs(twinId: string, projectId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/projects/${projectId}/wbs`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecGenerateWbs(
  twinId: string,
  projectId: string,
  body: Record<string, unknown> = {},
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/projects/${projectId}/wbs/generate`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecApproveWbs(
  twinId: string,
  projectId: string,
  body: Record<string, unknown> = {},
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/projects/${projectId}/wbs/approve`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecProjectProfitability(
  twinId: string,
  projectId: string,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/projects/${projectId}/profitability`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecUpdateProjectProfitability(
  twinId: string,
  projectId: string,
  body: Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/projects/${projectId}/profitability`, {
    ...init,
    method: "PATCH",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecProjectProfitabilityAudit(
  twinId: string,
  projectId: string,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/projects/${projectId}/profitability/audit`,
    { ...init, method: "GET" }
  );
  return unwrapAecData(raw);
}

export async function aecUpdateWbsPhase(
  twinId: string,
  projectId: string,
  phaseId: string,
  body: Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/projects/${projectId}/wbs/phases/${phaseId}`,
    { ...init, method: "PATCH", ...jsonInit(body) }
  );
  return unwrapAecData(raw);
}

export async function aecUpdateWbsTask(
  twinId: string,
  projectId: string,
  taskId: string,
  body: Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/projects/${projectId}/wbs/tasks/${taskId}`,
    { ...init, method: "PATCH", ...jsonInit(body) }
  );
  return unwrapAecData(raw);
}

export async function aecUpdateWbsMilestone(
  twinId: string,
  projectId: string,
  milestoneId: string,
  body: Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/projects/${projectId}/wbs/milestones/${milestoneId}`,
    { ...init, method: "PATCH", ...jsonInit(body) }
  );
  return unwrapAecData(raw);
}

export async function aecCompliance(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/compliance`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

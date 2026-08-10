import { apiJson, type ApiInit } from "./client";
import { unwrapAecData } from "./aecPipeline";

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

export async function aecListResources(
  twinId: string,
  query: Record<string, string> = {},
  init: ApiInit = {}
) {
  const qs = new URLSearchParams(query);
  const path = qs.toString()
    ? `${twinBase(twinId)}/resources?${qs}`
    : `${twinBase(twinId)}/resources`;
  const raw = await apiJson<unknown>(path, { ...init, method: "GET" });
  return unwrapAecData(raw);
}

export async function aecResourceSummary(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/resources/summary`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecCreateResource(
  twinId: string,
  body: Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/resources`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecResourceUtilization(
  twinId: string,
  query: Record<string, string> = {},
  init: ApiInit = {}
) {
  const qs = new URLSearchParams({ weeks: "8", ...query });
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/resources/utilization?${qs}`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecResourceAllocations(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/resources/allocations`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecSkillsMatrix(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/resources/skills`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecRateCards(
  twinId: string,
  query: Record<string, string> = {},
  init: ApiInit = {}
) {
  const qs = new URLSearchParams(query);
  const path = qs.toString()
    ? `${twinBase(twinId)}/rate-cards?${qs}`
    : `${twinBase(twinId)}/rate-cards`;
  const raw = await apiJson<unknown>(path, { ...init, method: "GET" });
  return unwrapAecData(raw);
}

export async function aecOrgChart(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/resources/org-chart`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecApproveRateCard(
  twinId: string,
  rateCardId: string,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/rate-cards/${rateCardId}/approve`, {
    ...init,
    method: "POST",
    ...jsonInit({}),
  });
  return unwrapAecData(raw);
}

export async function aecRateCardPendingRevisions(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/rate-cards/pending-revisions`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecRateCardHistory(
  twinId: string,
  resourceId: string,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/resources/${resourceId}/rate-cards/history`,
    { ...init, method: "GET" }
  );
  return unwrapAecData(raw);
}

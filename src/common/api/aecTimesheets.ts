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

export async function aecTimesheetSummary(
  twinId: string,
  weekStart: string,
  init: ApiInit = {}
) {
  const qs = new URLSearchParams({ weekStart });
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/timesheets/summary?${qs}`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecListTimesheets(
  twinId: string,
  query: { weekStart: string; status?: string },
  init: ApiInit = {}
) {
  const qs = new URLSearchParams({ weekStart: query.weekStart });
  if (query.status) qs.set("status", query.status);
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/timesheets?${qs}`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecMyTimesheet(
  twinId: string,
  query: { weekStart: string; resourceId: string },
  init: ApiInit = {}
) {
  const qs = new URLSearchParams({
    weekStart: query.weekStart,
    resourceId: query.resourceId,
  });
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/timesheets/mine?${qs}`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecGetTimesheet(twinId: string, timesheetId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/timesheets/${timesheetId}`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecSaveTimesheet(
  twinId: string,
  body: Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/timesheets`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecSubmitTimesheet(
  twinId: string,
  timesheetId: string,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/timesheets/${timesheetId}/submit`, {
    ...init,
    method: "POST",
    ...jsonInit({}),
  });
  return unwrapAecData(raw);
}

export async function aecApproveTimesheets(
  twinId: string,
  ids: string[],
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/timesheets/approve`, {
    ...init,
    method: "POST",
    ...jsonInit({ ids }),
  });
  return unwrapAecData(raw);
}

export async function aecExpenseCategories(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/expenses/categories`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecListExpenses(
  twinId: string,
  query: { status?: string } = {},
  init: ApiInit = {}
) {
  const qs = new URLSearchParams();
  if (query.status) qs.set("status", query.status);
  const path = qs.toString()
    ? `${twinBase(twinId)}/expenses?${qs}`
    : `${twinBase(twinId)}/expenses`;
  const raw = await apiJson<unknown>(path, { ...init, method: "GET" });
  return unwrapAecData(raw);
}

export async function aecCreateExpense(
  twinId: string,
  body: Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/expenses`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

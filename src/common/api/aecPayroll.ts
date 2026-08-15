import { apiJson, type ApiInit } from "./client";
import { unwrapAecData } from "./aecPipeline";

function twinBase(twinId: string) {
  return `/api/v1/aec/twins/${twinId}`;
}

function periodQs(period: string) {
  return new URLSearchParams({ period });
}

export async function aecPayrollAnalyticsSummary(twinId: string, period: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/payroll/analytics/summary?${periodQs(period)}`,
    { ...init, method: "GET" }
  );
  return unwrapAecData(raw);
}

export async function aecPayrollByEntity(twinId: string, period: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/payroll/analytics/by-entity?${periodQs(period)}`,
    { ...init, method: "GET" }
  );
  return unwrapAecData(raw);
}

export async function aecPayrollByDepartment(twinId: string, period: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/payroll/analytics/by-department?${periodQs(period)}`,
    { ...init, method: "GET" }
  );
  return unwrapAecData(raw);
}

export async function aecPayrollByProject(twinId: string, period: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/payroll/analytics/by-project?${periodQs(period)}`,
    { ...init, method: "GET" }
  );
  return unwrapAecData(raw);
}

export async function aecPayrollResources(
  twinId: string,
  period: string,
  query: { entityId?: string; rtype?: string } = {},
  init: ApiInit = {}
) {
  const qs = periodQs(period);
  if (query.entityId) qs.set("entityId", query.entityId);
  if (query.rtype) qs.set("rtype", query.rtype);
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/payroll/analytics/resources?${qs}`,
    { ...init, method: "GET" }
  );
  return unwrapAecData(raw);
}

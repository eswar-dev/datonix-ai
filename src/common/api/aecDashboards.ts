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

export type ApprovalType = "timesheet" | "expense" | "leave";
export type ApprovalAction = "approve" | "reject";

/** Unified approve/reject for timesheets, expenses, and leave. */
export async function aecApprovalAction(
  twinId: string,
  body: { id: string; type: ApprovalType; action: ApprovalAction; notes?: string },
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/dashboards/mine/approvals`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecMyDashboard(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/dashboards/mine`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecExecutiveDashboard(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/dashboards/executive`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecSubmitLeave(
  twinId: string,
  body: {
    startDate: string;
    endDate: string;
    leaveType?: string;
    days?: number;
    notes?: string;
    resourceId?: string;
  },
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/dashboards/mine/leave`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecListLeaveRequests(
  twinId: string,
  query: { scope?: "team" | "mine"; status?: string } = {},
  init: ApiInit = {}
) {
  const qs = new URLSearchParams();
  if (query.scope) qs.set("scope", query.scope);
  if (query.status) qs.set("status", query.status);
  const path = qs.toString()
    ? `${twinBase(twinId)}/leave/requests?${qs}`
    : `${twinBase(twinId)}/leave/requests`;
  const raw = await apiJson<unknown>(path, { ...init, method: "GET" });
  return unwrapAecData(raw);
}

export async function aecLeaveDecision(
  twinId: string,
  leaveId: string,
  body: { action: ApprovalAction; notes?: string },
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/leave/requests/${leaveId}/decision`,
    {
      ...init,
      method: "POST",
      ...jsonInit(body),
    }
  );
  return unwrapAecData(raw);
}

export async function aecHolidays(
  twinId: string,
  query: { year?: string; countryCode?: string; entityId?: string } = {},
  init: ApiInit = {}
) {
  const qs = new URLSearchParams();
  if (query.year) qs.set("year", query.year);
  if (query.countryCode) qs.set("countryCode", query.countryCode);
  if (query.entityId) qs.set("entityId", query.entityId);
  const path = qs.toString()
    ? `${twinBase(twinId)}/calendars/holidays?${qs}`
    : `${twinBase(twinId)}/calendars/holidays`;
  const raw = await apiJson<unknown>(path, { ...init, method: "GET" });
  return unwrapAecData(raw);
}

export async function aecReportsLibrary(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/reports`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecReportFilters(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/reports/filters`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecRunReport(
  twinId: string,
  reportHref: string,
  query: Record<string, string> = {},
  init: ApiInit = {}
) {
  const href = reportHref.replace(/^\//, "");
  const qs = new URLSearchParams(query);
  const path = qs.toString()
    ? `${twinBase(twinId)}/reports/${href}?${qs}`
    : `${twinBase(twinId)}/reports/${href}`;
  const raw = await apiJson<unknown>(path, { ...init, method: "GET" });
  return unwrapAecData(raw);
}

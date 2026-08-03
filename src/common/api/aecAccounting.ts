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

export async function aecAccountingSummary(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/accounting/summary`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecTaxRules(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/accounting/tax-rules`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecListInvoices(
  twinId: string,
  query: { status?: string } = {},
  init: ApiInit = {}
) {
  const qs = new URLSearchParams();
  if (query.status) qs.set("status", query.status);
  const path = qs.toString()
    ? `${twinBase(twinId)}/accounting/invoices?${qs}`
    : `${twinBase(twinId)}/accounting/invoices`;
  const raw = await apiJson<unknown>(path, { ...init, method: "GET" });
  return unwrapAecData(raw);
}

export async function aecCreateInvoice(
  twinId: string,
  body: Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/accounting/invoices`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecPreviewInvoice(
  twinId: string,
  body: Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/accounting/invoices/preview`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
  return unwrapAecData(raw);
}

export async function aecMarkInvoicePaid(
  twinId: string,
  invoiceId: string,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/accounting/invoices/${invoiceId}/mark-paid`,
    { ...init, method: "POST", ...jsonInit({}) }
  );
  return unwrapAecData(raw);
}

export async function aecChaseInvoice(twinId: string, invoiceId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/accounting/invoices/${invoiceId}/chase`,
    { ...init, method: "POST", ...jsonInit({}) }
  );
  return unwrapAecData(raw);
}

export async function aecEscalateInvoice(
  twinId: string,
  invoiceId: string,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(
    `${twinBase(twinId)}/accounting/invoices/${invoiceId}/escalate`,
    { ...init, method: "POST", ...jsonInit({}) }
  );
  return unwrapAecData(raw);
}

export async function aecListAp(
  twinId: string,
  query: { status?: string } = {},
  init: ApiInit = {}
) {
  const qs = new URLSearchParams();
  if (query.status) qs.set("status", query.status);
  const path = qs.toString()
    ? `${twinBase(twinId)}/accounting/ap?${qs}`
    : `${twinBase(twinId)}/accounting/ap`;
  const raw = await apiJson<unknown>(path, { ...init, method: "GET" });
  return unwrapAecData(raw);
}

export async function aecListGlJournals(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/accounting/gl/journals`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecPayroll(
  twinId: string,
  period: string,
  init: ApiInit = {}
) {
  const qs = new URLSearchParams({ period });
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/accounting/payroll?${qs}`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecProcessPayroll(
  twinId: string,
  period: string,
  init: ApiInit = {}
) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/accounting/payroll/process`, {
    ...init,
    method: "POST",
    ...jsonInit({ period }),
  });
  return unwrapAecData(raw);
}

export async function aecCurrencyIntelligence(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/accounting/currency`, {
    ...init,
    method: "GET",
  });
  return unwrapAecData(raw);
}

export async function aecRefreshCurrencyRates(twinId: string, init: ApiInit = {}) {
  const raw = await apiJson<unknown>(`${twinBase(twinId)}/accounting/currency/rates/refresh`, {
    ...init,
    method: "POST",
    ...jsonInit({}),
  });
  return unwrapAecData(raw);
}

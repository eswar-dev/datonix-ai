import { API_BASE_URL } from "@/const.js";
import { apiFetch, apiJson, type ApiInit } from "./client";

/** Normalize list responses from various backend shapes */
export function normalizeList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    for (const k of ["data", "results", "items", "tenants", "users", "organizations", "roles", "sessions"]) {
      const v = o[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

/** Django `/api/list_datasets` returns `{ status, data: [...] }` */
export function extractDatasetRows(raw: unknown): Record<string, unknown>[] {
  if (raw && typeof raw === "object" && "data" in raw && Array.isArray((raw as { data: unknown }).data)) {
    return (raw as { data: Record<string, unknown>[] }).data;
  }
  return normalizeList<Record<string, unknown>>(raw);
}

/** Read `raw[key]` when it is an array (e.g. `{ tenants: [...] }`). */
export function extractKeyedArray<T = Record<string, unknown>>(raw: unknown, key: string): T[] {
  if (raw && typeof raw === "object" && key in raw && Array.isArray((raw as Record<string, unknown>)[key])) {
    return (raw as Record<string, unknown>)[key] as T[];
  }
  return normalizeList<T>(raw);
}

export interface LoginResponse {
  status: string;
  user: {
    id: number;
    username: string;
    email: string;
    role?: string | string[] | null;
    tenant?: Record<string, unknown> | null;
    organization?: Record<string, unknown> | null;
  };
  accessToken: string;
  expiresIn?: number;
}

export async function authLogin(email: string, password: string) {
  return apiJson<LoginResponse>("/auth/login", {
    method: "POST",
    skipUserHeader: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchUserSessions(params: Record<string, string> = {}, init: ApiInit = {}) {
  const q = new URLSearchParams(params);
  const path = q.toString() ? `/auth/user-sessions?${q.toString()}` : "/auth/user-sessions";
  return apiJson<unknown>(path, { ...init, method: "GET" });
}

export function pickStr(o: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null && String(v) !== "") return String(v);
  }
  return fallback;
}

export function pickNum(o: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v !== "" && !Number.isNaN(Number(v))) return Number(v);
  }
  return fallback;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export async function fetchDashboard(role: string, init: ApiInit = {}) {
  const q = new URLSearchParams({ role });
  return apiJson<unknown>(`/api/v1/ai/dashboard?${q.toString()}`, {
    ...init,
    method: "GET",
  });
}

// ─── Datasets / upload ─────────────────────────────────────────────────────

export async function uploadFiles(userId: string, files: File[], init: ApiInit = {}) {
  const fd = new FormData();
  fd.append("user_id", userId);
  for (const f of files) fd.append("files", f);
  return apiFetch("/api/upload_file", {
    ...init,
    method: "POST",
    body: fd,
    userId,
    headers: new Headers(),
  }).then(async (res) => {
    const text = await res.text();
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return text;
    }
  });
}

/** POST `/api/select_datasets` with one or more `dataset_name` fields (multipart). Empty list clears selection. */
export async function selectDatasets(datasetNames: string[], init: ApiInit = {}) {
  const fd = new FormData();
  for (const name of datasetNames) {
    const n = String(name).trim();
    if (n) fd.append("dataset_name", n);
  }
  return apiFetch("/api/select_datasets", {
    ...init,
    method: "POST",
    body: fd,
    headers: new Headers(),
  }).then(async (res) => {
    const text = await res.text();
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return text;
    }
  });
}

export async function selectDataset(datasetName: string, init: ApiInit = {}) {
  return selectDatasets([datasetName], init);
}

export async function exportSelectedDatasets(init: ApiInit = {}) {
  return apiFetch("/api/export_selected_datasets", {
    ...init,
    method: "POST",
    headers: new Headers(),
  }).then(async (res) => {
    if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
    return res.blob();
  });
}

export async function deleteDataset(datasetId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/delete_dataset/${datasetId}`, { ...init, method: "DELETE" });
}

export async function listDatasets(init: ApiInit = {}) {
  return apiJson<unknown>("/api/list_datasets", { ...init, method: "GET" });
}

/** Some deployments mirror the curl that sends multipart on GET; try GET first, then POST form. */
export async function listDatasetsCompat(init: ApiInit = {}) {
  try {
    return await listDatasets(init);
  } catch {
    const fd = new FormData();
    fd.append("", "");
    const res = await apiFetch("/api/list_datasets", {
      ...init,
      method: "POST",
      body: fd,
      headers: new Headers(),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    try {
      return text ? JSON.parse(text) : [];
    } catch {
      return text;
    }
  }
}

/** GET `/api/dataset_status/<uuid>` — `{ status, records, error }` from Django. */
export interface DatasetStatusResponse {
  status: string;
  records: number;
  error: string | null;
}

export async function datasetStatus(datasetId: string, init: ApiInit = {}) {
  return apiJson<DatasetStatusResponse>(`/api/dataset_status/${datasetId}`, { ...init, method: "GET" });
}

export async function retryDataset(datasetId: string, init: ApiInit = {}) {
  return apiFetch(`/api/retry_dataset/${datasetId}`, {
    ...init,
    method: "POST",
    headers: new Headers(),
  }).then(async (res) => {
    const text = await res.text();
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return text;
    }
  });
}

export async function getSelectedDatasets(init: ApiInit = {}) {
  return apiJson<unknown>("/api/get_selected_datasets", { ...init, method: "GET" });
}

// ─── Admin (Django paths under same host) ─────────────────────────────────

export async function adminCreateUser(body: FormData | Record<string, string>, init: ApiInit = {}) {
  const payload =
    body instanceof FormData
      ? body
      : (() => {
          const fd = new FormData();
          Object.entries(body).forEach(([k, v]) => fd.append(k, v));
          return fd;
        })();
  return apiJson<unknown>("/admin/create_user", { ...init, method: "POST", body: payload, headers: new Headers() });
}

export async function adminSendOtp(body: FormData | Record<string, string>, init: ApiInit = {}) {
  const payload =
    body instanceof FormData
      ? body
      : (() => {
          const fd = new FormData();
          Object.entries(body).forEach(([k, v]) => fd.append(k, v));
          return fd;
        })();
  return apiJson<unknown>("/admin/send_otp", { ...init, method: "POST", body: payload, headers: new Headers() });
}

export async function adminVerifyOtp(body: FormData | Record<string, string>, init: ApiInit = {}) {
  const payload =
    body instanceof FormData
      ? body
      : (() => {
          const fd = new FormData();
          Object.entries(body).forEach(([k, v]) => fd.append(k, v));
          return fd;
        })();
  return apiJson<unknown>("/admin/otp_verification", { ...init, method: "POST", body: payload, headers: new Headers() });
}

export async function adminGetUsers(query?: Record<string, string>, init: ApiInit = {}) {
  const qs =
    query && Object.keys(query).length > 0 ? `?${new URLSearchParams(query).toString()}` : "";
  return apiJson<unknown>(`/admin/users/${qs}`, { ...init, method: "GET" });
}

export async function adminGetUser(uId: string | number, init: ApiInit = {}) {
  return apiJson<unknown>(`/admin/users/${uId}`, { ...init, method: "GET" });
}

export async function adminCreateTenants(body: FormData | Record<string, string>, init: ApiInit = {}) {
  const payload =
    body instanceof FormData
      ? body
      : (() => {
          const fd = new FormData();
          Object.entries(body).forEach(([k, v]) => fd.append(k, v));
          return fd;
        })();
  return apiJson<unknown>("/admin/create_tenants", { ...init, method: "POST", body: payload, headers: new Headers() });
}

export async function adminTenants(query?: Record<string, string>, init: ApiInit = {}) {
  const qs =
    query && Object.keys(query).length > 0 ? `?${new URLSearchParams(query).toString()}` : "";
  return apiJson<unknown>(`/admin/tenants${qs}`, { ...init, method: "GET" });
}

export async function adminTenantById(tId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/admin/tenants/${tId}`, { ...init, method: "GET" });
}

export async function adminUpdateTenant(
  tId: string,
  body: Record<string, string>,
  init: ApiInit = {}
) {
  const fd = new FormData();
  Object.entries(body).forEach(([k, v]) => fd.append(k, v));
  return apiJson<unknown>(`/admin/tenants/${tId}`, { ...init, method: "POST", body: fd, headers: new Headers() });
}

export async function adminCreateOrganizations(body: FormData | Record<string, string>, init: ApiInit = {}) {
  const payload =
    body instanceof FormData
      ? body
      : (() => {
          const fd = new FormData();
          Object.entries(body).forEach(([k, v]) => fd.append(k, v));
          return fd;
        })();
  return apiJson<unknown>("/admin/create_organizations", { ...init, method: "POST", body: payload, headers: new Headers() });
}

export async function adminOrganizations(query?: Record<string, string>, init: ApiInit = {}) {
  const qs =
    query && Object.keys(query).length > 0 ? `?${new URLSearchParams(query).toString()}` : "";
  return apiJson<unknown>(`/admin/organizations${qs}`, { ...init, method: "GET" });
}

export async function adminOrganizationById(oId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/admin/organizations/${oId}`, { ...init, method: "GET" });
}

export async function adminUpdateOrganization(oId: string, fd: FormData, init: ApiInit = {}) {
  return apiJson<unknown>(`/admin/organizations/${oId}`, { ...init, method: "POST", body: fd, headers: new Headers() });
}

export async function adminRoles(query?: Record<string, string>, init: ApiInit = {}) {
  const qs =
    query && Object.keys(query).length > 0 ? `?${new URLSearchParams(query).toString()}` : "";
  return apiJson<unknown>(`/admin/roles${qs}`, { ...init, method: "GET" });
}

export async function adminPostNewRole(fd: FormData, init: ApiInit = {}) {
  return apiJson<unknown>("/admin/roles", { ...init, method: "POST", body: fd, headers: new Headers() });
}

export async function adminRoleById(rId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/admin/roles/${rId}`, { ...init, method: "GET" });
}

export async function adminModifyRole(rId: string, body: FormData | Record<string, string>, init: ApiInit = {}) {
  const payload =
    body instanceof FormData
      ? body
      : (() => {
          const fd = new FormData();
          Object.entries(body).forEach(([k, v]) => fd.append(k, v));
          return fd;
        })();
  return apiJson<unknown>(`/admin/modify_role/${rId}`, { ...init, method: "POST", body: payload, headers: new Headers() });
}

export async function adminDeleteRole(rId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/admin/modify_role/${rId}`, { ...init, method: "DELETE" });
}

export async function adminDeleteTenant(tId: string | number, init: ApiInit = {}) {
  return apiJson<unknown>(`/admin/tenants/${tId}`, { ...init, method: "DELETE" });
}

export async function adminDeleteOrganization(oId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/admin/organizations/${oId}`, { ...init, method: "DELETE" });
}

export async function adminUpdateUser(uId: string | number, fd: FormData, init: ApiInit = {}) {
  return apiJson<unknown>(`/admin/users/${uId}`, { ...init, method: "POST", body: fd, headers: new Headers() });
}

export async function adminDeleteUser(uId: string | number, init: ApiInit = {}) {
  return apiJson<unknown>(`/admin/users/${uId}`, { ...init, method: "DELETE" });
}

export { API_BASE_URL };

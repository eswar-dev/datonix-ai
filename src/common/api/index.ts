import { API_BASE_URL } from "@/common/const.js";
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
    last_login?: string | null;
    role?: string | string[] | null;
    tenant?: Record<string, unknown> | null;
    organization?: Record<string, unknown> | null;
  };
  accessToken: string;
  expiresIn?: number;
}

function jsonInit(body: unknown, init: ApiInit = {}): ApiInit {
  return {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers as HeadersInit | undefined) },
    body: JSON.stringify(body),
  };
}

function formDataToRecord(fd: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const multi = new Map<string, string[]>();
  fd.forEach((value, key) => {
    const v = typeof value === "string" ? value : value.name;
    if (multi.has(key) || out[key] !== undefined) {
      const prev = multi.get(key) ?? (out[key] != null ? [String(out[key])] : []);
      prev.push(v);
      multi.set(key, prev);
      out[key] = prev;
    } else {
      out[key] = v;
    }
  });
  return out;
}

/** POST `/api/login` — shared auth for Administration + Enterprise Twin */
export async function authLogin(email: string, password: string) {
  return apiJson<LoginResponse>("/api/login", {
    method: "POST",
    skipUserHeader: true,
    ...jsonInit({ email, password }),
  });
}

/** POST `/api/logout` — server no-op; client still clears local session */
export async function authLogout(init: ApiInit = {}) {
  try {
    await apiJson<unknown>("/api/logout", { ...init, method: "POST", ...jsonInit({}) });
  } catch {
    /* ignore — token may already be invalid */
  }
}

export async function fetchUserSessions(params: Record<string, string> = {}, init: ApiInit = {}) {
  const q = new URLSearchParams(params);
  const path = q.toString() ? `/api/sessions?${q.toString()}` : "/api/sessions";
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

// ─── Admin (Django `/api/*` JSON APIs) ─────────────────────────────────────

export async function adminCreateUser(
  body: FormData | Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = body instanceof FormData ? formDataToRecord(body) : body;
  const payload = {
    username: raw.username,
    email: raw.email,
    password: raw.password,
    first_name: raw.first_name ?? "",
    last_name: raw.last_name ?? "",
    is_active: raw.is_active !== false && String(raw.status ?? "Active").toLowerCase() !== "inactive",
  };
  const created = await apiJson<{ id: number } & Record<string, unknown>>("/api/users", {
    ...init,
    method: "POST",
    ...jsonInit(payload),
  });

  const organizationId = raw.organization ?? raw.organization_id ?? raw.orgId;
  const roleRaw = raw.roles ?? raw.role ?? raw.user_role;
  if (created?.id != null && organizationId) {
    const role = Array.isArray(roleRaw)
      ? roleRaw.map(String)
      : String(roleRaw ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    if (role.length) {
      try {
        await adminCreateMembership(
          {
            user_id: created.id,
            organization_id: String(organizationId),
            role,
            access_level: /admin|manager/i.test(role.join(" ")) ? "org_admin" : "member",
          },
          init
        );
      } catch {
        /* user created; membership optional if roles not provisioned yet */
      }
    }
  }
  return created;
}

export async function adminSendOtp(body: FormData | Record<string, string>, init: ApiInit = {}) {
  const raw = body instanceof FormData ? formDataToRecord(body) : body;
  return apiJson<unknown>("/api/send_otp", { ...init, method: "POST", ...jsonInit({ email: raw.email }) });
}

export async function adminVerifyOtp(body: FormData | Record<string, string>, init: ApiInit = {}) {
  const raw = body instanceof FormData ? formDataToRecord(body) : body;
  return apiJson<unknown>("/api/otp_verification", {
    ...init,
    method: "POST",
    ...jsonInit({ email: raw.email, otp: raw.otp }),
  });
}

export async function adminGetUsers(query?: Record<string, string>, init: ApiInit = {}) {
  const qs =
    query && Object.keys(query).length > 0 ? `?${new URLSearchParams(query).toString()}` : "";
  return apiJson<unknown>(`/api/users${qs}`, { ...init, method: "GET" });
}

export async function adminGetUser(uId: string | number, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/users/${uId}`, { ...init, method: "GET" });
}

export async function adminCreateTenants(
  body: FormData | Record<string, string>,
  init: ApiInit = {}
) {
  const raw = body instanceof FormData ? formDataToRecord(body) : body;
  const payload = {
    name: raw.name ?? raw.tenant_name,
    type: raw.type ?? raw.tenant_type,
    timeout: Number(raw.timeout ?? raw.tenant_timeout ?? 30),
  };
  return apiJson<unknown>("/api/tenants", { ...init, method: "POST", ...jsonInit(payload) });
}

export async function adminTenants(query?: Record<string, string>, init: ApiInit = {}) {
  const qs =
    query && Object.keys(query).length > 0 ? `?${new URLSearchParams(query).toString()}` : "";
  return apiJson<unknown>(`/api/tenants${qs}`, { ...init, method: "GET" });
}

export async function adminTenantById(tId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/tenants/${tId}`, { ...init, method: "GET" });
}

export async function adminUpdateTenant(
  tId: string,
  body: Record<string, string>,
  init: ApiInit = {}
) {
  const payload = {
    name: body.name ?? body.tenant_name,
    type: body.type ?? body.tenant_type,
    timeout: Number(body.timeout ?? body.tenant_timeout ?? 30),
  };
  return apiJson<unknown>(`/api/tenants/${tId}`, { ...init, method: "POST", ...jsonInit(payload) });
}

export async function adminCreateOrganizations(
  body: FormData | Record<string, string>,
  init: ApiInit = {}
) {
  const raw = body instanceof FormData ? formDataToRecord(body) : body;
  const payload = {
    tenant_id: raw.tenant_id ?? raw.tenant,
    name: raw.name ?? raw.organization_name,
    code: raw.code ?? "",
    entity_type: raw.entity_type ?? "other",
    country_code: raw.country_code ?? "",
    currency_code: raw.currency_code ?? "",
    status: String(raw.status ?? "active").toLowerCase(),
    staff_count: Number(raw.staff_count ?? 0),
    parent_id: raw.parent_id || null,
  };
  return apiJson<unknown>("/api/organizations", { ...init, method: "POST", ...jsonInit(payload) });
}

export async function adminOrganizations(query?: Record<string, string>, init: ApiInit = {}) {
  const qs =
    query && Object.keys(query).length > 0 ? `?${new URLSearchParams(query).toString()}` : "";
  return apiJson<unknown>(`/api/organizations${qs}`, { ...init, method: "GET" });
}

export async function adminOrganizationById(oId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/organizations/${oId}`, { ...init, method: "GET" });
}

export async function adminUpdateOrganization(
  oId: string,
  body: FormData | Record<string, string>,
  init: ApiInit = {}
) {
  const raw = body instanceof FormData ? formDataToRecord(body) : body;
  const payload: Record<string, unknown> = {
    name: raw.name ?? raw.organization_name,
  };
  if (raw.status != null) payload.status = String(raw.status).toLowerCase();
  if (raw.code != null) payload.code = raw.code;
  if (raw.entity_type != null) payload.entity_type = raw.entity_type;
  if (raw.country_code != null) payload.country_code = raw.country_code;
  if (raw.currency_code != null) payload.currency_code = raw.currency_code;
  if (raw.staff_count != null) payload.staff_count = Number(raw.staff_count);
  if (raw.parent_id !== undefined) payload.parent_id = raw.parent_id || null;
  return apiJson<unknown>(`/api/organizations/${oId}`, { ...init, method: "POST", ...jsonInit(payload) });
}

export async function adminRoles(query?: Record<string, string>, init: ApiInit = {}) {
  const params = { ...query };
  if (params.o_id && !params.organization_id) {
    params.organization_id = params.o_id;
    delete params.o_id;
  }
  const qs =
    Object.keys(params).length > 0 ? `?${new URLSearchParams(params).toString()}` : "";
  return apiJson<unknown>(`/api/roles${qs}`, { ...init, method: "GET" });
}

export async function adminPostNewRole(body: FormData | Record<string, unknown>, init: ApiInit = {}) {
  const raw = body instanceof FormData ? formDataToRecord(body) : body;
  const permissions = Array.isArray(raw.permissions)
    ? raw.permissions.map(String)
    : raw.permissions != null
      ? [String(raw.permissions)]
      : [];
  const payload = {
    role: raw.role ?? raw.roles ?? raw.name,
    permissions,
    organization_id: raw.organization_id ?? raw.organization,
  };
  return apiJson<unknown>("/api/roles", { ...init, method: "POST", ...jsonInit(payload) });
}

export async function adminRoleById(rId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/roles/${rId}`, { ...init, method: "GET" });
}

export async function adminModifyRole(
  rId: string,
  body: FormData | Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = body instanceof FormData ? formDataToRecord(body) : body;
  const permissions = Array.isArray(raw.permissions)
    ? raw.permissions.map(String)
    : raw.permissions != null
      ? [String(raw.permissions)]
      : undefined;
  const payload: Record<string, unknown> = {};
  if (raw.role != null || raw.roles != null || raw.name != null) {
    payload.role = raw.role ?? raw.roles ?? raw.name;
  }
  if (permissions) payload.permissions = permissions;
  if (raw.organization_id != null || raw.organization != null) {
    payload.organization_id = raw.organization_id ?? raw.organization;
  }
  return apiJson<unknown>(`/api/roles/${rId}`, { ...init, method: "POST", ...jsonInit(payload) });
}

export async function adminDeleteRole(rId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/roles/${rId}`, { ...init, method: "DELETE" });
}

export async function adminDeleteTenant(tId: string | number, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/tenants/${tId}`, { ...init, method: "DELETE" });
}

export async function adminDeleteOrganization(oId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/organizations/${oId}`, { ...init, method: "DELETE" });
}

export async function adminUpdateUser(
  uId: string | number,
  body: FormData | Record<string, unknown>,
  init: ApiInit = {}
) {
  const raw = body instanceof FormData ? formDataToRecord(body) : body;
  const status = raw.status;
  const isActive =
    raw.is_active ??
    (status == null
      ? undefined
      : String(status).toLowerCase() === "true" ||
        String(status).toLowerCase() === "active");
  const payload: Record<string, unknown> = {};
  if (raw.username != null) payload.username = raw.username;
  if (raw.email != null) payload.email = raw.email;
  if (raw.password) payload.password = raw.password;
  if (raw.first_name != null) payload.first_name = raw.first_name;
  if (raw.last_name != null) payload.last_name = raw.last_name;
  if (isActive !== undefined) payload.is_active = Boolean(isActive);
  return apiJson<unknown>(`/api/users/${uId}`, { ...init, method: "POST", ...jsonInit(payload) });
}

export async function adminDeleteUser(uId: string | number, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/users/${uId}`, { ...init, method: "DELETE" });
}

export async function adminCreateMembership(
  body: {
    user_id: number | string;
    organization_id: string;
    role: string[];
    access_level?: string;
  },
  init: ApiInit = {}
) {
  return apiJson<unknown>("/api/memberships", { ...init, method: "POST", ...jsonInit(body) });
}

// ─── Enterprise Twin ───────────────────────────────────────────────────────

export interface TwinGenerateRequest {
  tenant_id: string;
  prompt: string;
}

export async function twinList(query?: Record<string, string>, init: ApiInit = {}) {
  const qs =
    query && Object.keys(query).length > 0 ? `?${new URLSearchParams(query).toString()}` : "";
  return apiJson<unknown>(`/api/twins${qs}`, { ...init, method: "GET" });
}

export async function twinGenerate(body: TwinGenerateRequest, init: ApiInit = {}) {
  return apiJson<unknown>("/api/twin/generate", { ...init, method: "POST", ...jsonInit(body) });
}

export async function twinGet(twinId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/twin/${twinId}`, { ...init, method: "GET" });
}

export async function twinDelete(twinId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/twin/${twinId}`, { ...init, method: "DELETE" });
}

export async function twinRegenerate(
  twinId: string,
  body: { prompt?: string } = {},
  init: ApiInit = {}
) {
  return apiJson<unknown>(`/api/twin/${twinId}/regenerate`, {
    ...init,
    method: "POST",
    ...jsonInit(body),
  });
}

export async function twinPublish(twinId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/twin/${twinId}/publish`, {
    ...init,
    method: "POST",
    ...jsonInit({}),
  });
}

export async function twinSummary(twinId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/twin/${twinId}/summary`, { ...init, method: "GET" });
}

export async function twinLayers(twinId: string, init: ApiInit = {}) {
  return apiJson<unknown>(`/api/twin/${twinId}/layers`, { ...init, method: "GET" });
}

export { API_BASE_URL };

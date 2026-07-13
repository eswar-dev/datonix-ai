import type { DomainId } from "@/domains/types";

const SUBDOMAIN_TO_DOMAIN: Record<string, DomainId> = {
  manufacturing: "manufacturing",
  retail: "retail",
  aec: "aec",
};

const DOMAIN_OVERRIDE_KEY = "datonix_domain_override";

function isDomainId(value: string | null): value is DomainId {
  return value === "manufacturing" || value === "retail" || value === "aec";
}

/**
 * Picks the vertical from the browser hostname — one build, one server.
 * Examples:
 *   retail.datonix.ai     → retail
 *   aec.datonix.ai        → aec
 *   manufacturing.datonix.ai (or localhost) → manufacturing
 *
 * Subdomain selection needs real DNS. When the app is served from a bare IP
 * (e.g. http://3.253.0.188:8080) the hostname has no usable subdomain, so use
 * an explicit override via `?domain=aec` (persisted) to force a vertical.
 */
export function getDomainFromHost(): DomainId {
  // 1) Explicit override via query param, e.g. ?domain=aec — persisted for later navigations.
  try {
    const param = new URLSearchParams(window.location.search).get("domain");
    if (isDomainId(param)) {
      window.localStorage.setItem(DOMAIN_OVERRIDE_KEY, param);
      return param;
    }
    const stored = window.localStorage.getItem(DOMAIN_OVERRIDE_KEY);
    if (isDomainId(stored)) return stored;
  } catch {
    /* localStorage unavailable — fall through to hostname detection */
  }

  // 2) Subdomain detection for real DNS deployments (aec.datonix.ai, etc.).
  const subdomain = window.location.hostname.toLowerCase().split(".")[0];
  return SUBDOMAIN_TO_DOMAIN[subdomain] ?? "manufacturing";
}

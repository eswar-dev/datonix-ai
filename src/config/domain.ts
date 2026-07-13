import type { DomainId } from "@/domains/types";

const SUBDOMAIN_TO_DOMAIN: Record<string, DomainId> = {
  manufacturing: "manufacturing",
  retail: "retail",
  aec: "aec",
};

/**
 * Picks the vertical from the browser hostname — one build, one server.
 * Examples:
 *   retail.datonix.ai     → retail
 *   aec.datonix.ai        → aec
 *   manufacturing.datonix.ai (or localhost) → manufacturing
 */
export function getDomainFromHost(): DomainId {
  const subdomain = window.location.hostname.toLowerCase().split(".")[0];
  return SUBDOMAIN_TO_DOMAIN[subdomain] ?? "manufacturing";
}

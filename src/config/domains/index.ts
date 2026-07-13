import { aecConfig } from "@/domains/aec/config";
import { manufacturingConfig } from "@/domains/manufacturing/config";
import { retailConfig } from "@/domains/retail/config";
import type { DomainConfig, DomainId } from "@/domains/types";

export const domainRegistry: Record<DomainId, DomainConfig> = {
  manufacturing: manufacturingConfig,
  retail: retailConfig,
  aec: aecConfig,
};

export function getDomainConfig(id: DomainId): DomainConfig {
  return domainRegistry[id];
}

import type { DomainConfig } from "@/domains/types";
import { manufacturingConfig } from "@/domains/manufacturing/config";
import { retailLoginConfig } from "./login";

/** Retail screens reuse manufacturing pages until retail-specific pages exist. */
export const retailConfig: DomainConfig = {
  ...manufacturingConfig,
  id: "retail",
  label: "Retail",
  login: retailLoginConfig,
};

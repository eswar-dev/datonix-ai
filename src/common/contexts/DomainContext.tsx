import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getDomainFromHost } from "@/config/domain";
import { getDomainConfig } from "@/config/domains";
import type { DomainConfig } from "@/domains/types";

const DomainContext = createContext<DomainConfig | undefined>(undefined);

export function DomainProvider({ children }: { children: ReactNode }) {
  const domain = useMemo(() => getDomainConfig(getDomainFromHost()), []);

  return <DomainContext.Provider value={domain}>{children}</DomainContext.Provider>;
}

export function useDomain() {
  const ctx = useContext(DomainContext);
  if (!ctx) throw new Error("useDomain must be used within DomainProvider");
  return ctx;
}

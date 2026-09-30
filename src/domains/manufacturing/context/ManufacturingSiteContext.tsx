import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { SITE_BY_ID, SITES, type MfgSite, type MfgSiteId } from "@/domains/manufacturing/data";

const STORAGE_KEY = "datonix_mfg_active_site";

function readSite(): MfgSiteId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && raw in SITE_BY_ID) return raw as MfgSiteId;
  } catch {
    /* ignore */
  }
  return "birmingham";
}

interface ManufacturingSiteContextValue {
  sites: MfgSite[];
  activeSiteId: MfgSiteId;
  activeSite: MfgSite;
  setActiveSiteId: (id: MfgSiteId) => void;
}

const ManufacturingSiteContext = createContext<ManufacturingSiteContextValue | undefined>(undefined);

export function ManufacturingSiteProvider({ children }: { children: ReactNode }) {
  const [activeSiteId, setId] = useState<MfgSiteId>(readSite);

  const setActiveSiteId = useCallback((id: MfgSiteId) => {
    setId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      sites: SITES,
      activeSiteId,
      activeSite: SITE_BY_ID[activeSiteId],
      setActiveSiteId,
    }),
    [activeSiteId, setActiveSiteId],
  );

  return (
    <ManufacturingSiteContext.Provider value={value}>{children}</ManufacturingSiteContext.Provider>
  );
}

export function useManufacturingSite() {
  const ctx = useContext(ManufacturingSiteContext);
  if (!ctx) throw new Error("useManufacturingSite must be used within ManufacturingSiteProvider");
  return ctx;
}

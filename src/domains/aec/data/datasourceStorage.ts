import type { ConnectorMapping } from "@/domains/aec/data/connectors";
import { connectors as defaultConnectors } from "@/domains/aec/data/connectors";

const STORAGE_KEY = "datonix_datasources";

export interface DatasourceDraft {
  id: string;
  source: string;
  connector: string;
  targetModule: string;
  status: ConnectorMapping["status"];
  entities: string;
  lastSync: string;
  coverage: string;
  recordsMapped: number;
  schedule?: string;
  createdAt: string;
}

function draftToConnector(d: DatasourceDraft): ConnectorMapping {
  return {
    id: d.id,
    source: d.source,
    connector: d.connector,
    targetModule: d.targetModule,
    status: d.status,
    entities: d.entities,
    lastSync: d.lastSync,
    coverage: d.coverage,
    recordsMapped: d.recordsMapped,
  };
}

function getCustomDrafts(twinId?: string): DatasourceDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, DatasourceDraft[]>;
    return parsed[twinId ?? "default"] ?? [];
  } catch {
    return [];
  }
}

function writeCustomDrafts(twinId: string | undefined, drafts: DatasourceDraft[]): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, DatasourceDraft[]>) : {};
    parsed[twinId ?? "default"] = drafts;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    /* ignore storage errors */
  }
}

export function loadStoredDatasources(twinId?: string): ConnectorMapping[] {
  const custom = getCustomDrafts(twinId).map(draftToConnector);
  return mergeConnectors(defaultConnectors, custom);
}

export function saveDatasource(twinId: string | undefined, draft: DatasourceDraft): void {
  const existing = getCustomDrafts(twinId);
  writeCustomDrafts(
    twinId,
    [...existing.filter((d) => d.id !== draft.id), draft],
  );
}

export function mergeConnectors(
  twinConnectors: ConnectorMapping[],
  stored: ConnectorMapping[],
): ConnectorMapping[] {
  const byId = new Map<string, ConnectorMapping>();
  for (const c of stored) byId.set(c.id, c);
  for (const c of twinConnectors) byId.set(c.id, c);
  return [...byId.values()];
}

export function syncDatasourceNow(twinId: string | undefined, id: string): ConnectorMapping[] {
  const list = loadStoredDatasources(twinId);
  const target = list.find((c) => c.id === id);
  if (!target) return list;

  const updatedConnector: ConnectorMapping = {
    ...target,
    lastSync: "Just now",
    status: "Live",
    coverage: `${Math.min(100, parseInt(target.coverage, 10) + 5 || 85)}%`,
  };

  const custom = getCustomDrafts(twinId);
  const isDefault = defaultConnectors.some((d) => d.id === id);
  if (isDefault) {
    writeCustomDrafts(twinId, [
      ...custom.filter((d) => d.id !== id),
      {
        ...updatedConnector,
        createdAt: new Date().toISOString(),
        schedule: "hourly",
      },
    ]);
  } else {
    writeCustomDrafts(
      twinId,
      custom.map((d) =>
        d.id === id
          ? {
              ...d,
              lastSync: updatedConnector.lastSync,
              status: updatedConnector.status,
              coverage: updatedConnector.coverage,
            }
          : d,
      ),
    );
  }

  return loadStoredDatasources(twinId);
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Database, Plus, RefreshCw } from "lucide-react";
import { cn } from "@/common/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import {
  AecButton,
  AecLivePill,
  AecPanel,
  AecProgress,
  AecTag,
} from "@/domains/aec/components/primitives";
import { dataFlowStages } from "@/domains/aec/data/connectors";
import {
  loadStoredDatasources,
  mergeConnectors,
  syncDatasourceNow,
} from "@/domains/aec/data/datasourceStorage";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import { toast } from "sonner";

const stageClasses = ["aec-flow-source", "aec-flow-connector", "aec-flow-module"];

export default function DataIngestion() {
  const { twinDetail, activeTwinId, loadTwinDetail, twinDetailLoading } = useAecApp();
  const [stored, setStored] = useState(() => loadStoredDatasources(activeTwinId));
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (activeTwinId && isApiTwinId(activeTwinId) && !twinDetail) {
      void loadTwinDetail(activeTwinId);
    }
  }, [activeTwinId, twinDetail, loadTwinDetail]);

  useEffect(() => {
    setStored(loadStoredDatasources(activeTwinId));
  }, [activeTwinId]);

  const connectors = useMemo(() => {
    const twinConnectors = twinDetail?.connectors ?? [];
    if (twinConnectors.length > 0) return mergeConnectors(twinConnectors, stored);
    return stored;
  }, [twinDetail?.connectors, stored]);

  const flowStages = useMemo(() => {
    const sources = [...new Set(connectors.map((c) => c.source))];
    const conns = [...new Set(connectors.map((c) => c.connector))];
    const modules = [...new Set(connectors.map((c) => c.targetModule))];
    if (sources.length === 0) return dataFlowStages;
    return [
      { id: "sources", title: "Source Systems", items: sources },
      { id: "connectors", title: "Connector Layer", items: conns },
      { id: "modules", title: "Datonix Modules", items: modules },
    ];
  }, [connectors]);

  const handleSync = useCallback(
    (id: string) => {
      setStored(syncDatasourceNow(activeTwinId, id));
      toast.success("Sync completed");
    },
    [activeTwinId],
  );

  const handleSyncAll = useCallback(async () => {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 800));
    setSyncing(false);
    toast.success("All connectors synced");
  }, []);

  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Data Ingestion"
        subtitle="Source systems → Generated connectors → Datonix modules"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {syncing && (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-[color:var(--page-accent)]" />
                <AecLivePill label="Syncing" />
              </div>
            )}
            <AecButton variant="outline" size="sm" onClick={handleSyncAll} disabled={syncing}>
              <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
              Sync All
            </AecButton>
            <Link to="/data-ingestion/add">
              <AecButton size="sm">
                <Plus className="h-3.5 w-3.5" />
                Add Datasource
              </AecButton>
            </Link>
          </div>
        }
      />

      {twinDetailLoading && isApiTwinId(activeTwinId ?? "") && (
        <p className="text-[11.5px] text-[color:var(--page-muted)]">Loading twin connectors…</p>
      )}

      <AecPanel
        title="Data Flow Map"
        icon={<Database className="h-3.5 w-3.5 text-[color:var(--page-blue)]" />}
        actions={syncing ? <AecLivePill label="Syncing" /> : null}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          {flowStages.map((stage, stageIdx) => (
            <div key={stage.id} className="flex flex-1 items-center gap-3">
              <div className="flex-1">
                <p className="mb-2 text-[9.5px] font-bold uppercase tracking-wide text-[color:var(--page-muted)]">
                  {stage.title}
                </p>
                <div className="flex flex-col gap-1.5">
                  {stage.items.map((item) => (
                    <div
                      key={item}
                      className={cn(
                        "rounded-md border px-2.5 py-2 text-center text-[11.5px] font-semibold",
                        stageClasses[stageIdx] ?? stageClasses[0],
                      )}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              {stageIdx < flowStages.length - 1 && (
                <ArrowRight className="hidden h-5 w-5 shrink-0 text-[color:var(--page-dim)] lg:block" />
              )}
            </div>
          ))}
        </div>
      </AecPanel>

      <AecPanel
        title="Connected Datasources"
        actions={
          <Link to="/data-ingestion/add">
            <AecButton variant="outline" size="sm">
              + Add Datasource
            </AecButton>
          </Link>
        }
      >
        <div className="tw overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[color:var(--page-border)] hover:bg-transparent">
                <TableHead className="text-[9.5px] uppercase tracking-wide text-[color:var(--page-muted)]">
                  Source
                </TableHead>
                <TableHead className="text-[9.5px] uppercase tracking-wide text-[color:var(--page-muted)]">
                  Connector
                </TableHead>
                <TableHead className="text-[9.5px] uppercase tracking-wide text-[color:var(--page-muted)]">
                  Target Module
                </TableHead>
                <TableHead className="text-[9.5px] uppercase tracking-wide text-[color:var(--page-muted)]">
                  Entities
                </TableHead>
                <TableHead className="text-[9.5px] uppercase tracking-wide text-[color:var(--page-muted)]">
                  Coverage
                </TableHead>
                <TableHead className="text-[9.5px] uppercase tracking-wide text-[color:var(--page-muted)]">
                  Last Sync
                </TableHead>
                <TableHead className="text-[9.5px] uppercase tracking-wide text-[color:var(--page-muted)]">
                  Status
                </TableHead>
                <TableHead className="text-right text-[9.5px] uppercase tracking-wide text-[color:var(--page-muted)]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connectors.length === 0 ? (
                <TableRow className="border-[color:var(--page-border)]">
                  <TableCell colSpan={8} className="py-10 text-center text-[color:var(--page-muted)]">
                    No datasources configured.{" "}
                    <Link
                      to="/data-ingestion/add"
                      className="font-medium text-[color:var(--page-accent)] hover:underline"
                    >
                      Add your first datasource
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                connectors.map((c) => {
                  const pct = parseInt(c.coverage, 10) || 0;
                  return (
                    <TableRow
                      key={c.id}
                      className="border-[color:var(--page-border)] hover:bg-[color:var(--page-row-hover)]"
                    >
                      <TableCell className="font-semibold text-[color:var(--page-text)]">
                        {c.source}
                      </TableCell>
                      <TableCell>
                        <AecTag variant="purple">{c.connector}</AecTag>
                      </TableCell>
                      <TableCell className="text-[color:var(--page-text)]">{c.targetModule}</TableCell>
                      <TableCell className="text-[color:var(--page-muted)]">{c.entities}</TableCell>
                      <TableCell>
                        <div className="w-20">
                          <AecProgress value={pct} />
                        </div>
                      </TableCell>
                      <TableCell className="text-[10.5px] text-[color:var(--page-muted)]">
                        {c.lastSync}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <AecButton variant="outline" size="xs" onClick={() => handleSync(c.id)}>
                          Sync
                        </AecButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </AecPanel>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, RefreshCw } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
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
import { dataFlowStages } from "@/domains/aec/data/connectors";
import {
  loadStoredDatasources,
  mergeConnectors,
  syncDatasourceNow,
} from "@/domains/aec/data/datasourceStorage";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import { toast } from "sonner";

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
    if (twinConnectors.length > 0) {
      return mergeConnectors(twinConnectors, stored);
    }
    return stored;
  }, [twinDetail?.connectors, stored]);

  const flowStages = useMemo(() => {
    const sources = [...new Set(connectors.map((c) => c.source))];
    const conns = [...new Set(connectors.map((c) => c.connector))];
    const modules = [...new Set(connectors.map((c) => c.targetModule))];
    if (sources.length === 0) return dataFlowStages;
    return [
      { id: "sources", title: "Source Systems", items: sources },
      { id: "connectors", title: "Connectors", items: conns },
      { id: "modules", title: "Datonix Modules", items: modules },
    ];
  }, [connectors]);

  const handleSync = useCallback(
    (id: string) => {
      const updated = syncDatasourceNow(activeTwinId, id);
      setStored(updated);
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
    <div className="space-y-6">
      <AecPageHeader
        title="Data Ingestion"
        subtitle="Source systems, connectors, and Datonix module mappings for the enterprise twin."
        breadcrumb={[
          { label: "Intelligence", href: "/enterprise-twin" },
          { label: "Data Ingestion" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {syncing && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-1.5 text-sm">
                <RefreshCw className="h-4 w-4 animate-spin text-accent" />
                <span className="text-muted-foreground">Syncing</span>
                <StatusBadge status="Live" />
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleSyncAll} disabled={syncing}>
              <RefreshCw className={cn("mr-1 h-4 w-4", syncing && "animate-spin")} />
              Sync All
            </Button>
            <Button size="sm" asChild>
              <Link to="/data-ingestion/add">
                <Plus className="mr-1 h-4 w-4" />
                Add Datasource
              </Link>
            </Button>
          </div>
        }
      />

      {twinDetailLoading && isApiTwinId(activeTwinId ?? "") && (
        <p className="text-sm text-muted-foreground">Loading twin connectors…</p>
      )}

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Data Flow</CardTitle>
          <p className="text-sm text-muted-foreground">
            Source Systems → Connectors → Datonix Modules
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:justify-between">
            {flowStages.map((stage, stageIdx) => (
              <div key={stage.id} className="flex flex-1 items-center gap-4">
                <div className="flex-1 rounded-lg border bg-card p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {stage.title}
                  </p>
                  <ul className="space-y-2">
                    {stage.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-md bg-muted/50 px-3 py-2 text-sm font-medium"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {stageIdx < flowStages.length - 1 && (
                  <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground lg:block" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Connected Datasources</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/data-ingestion/add">+ Add Datasource</Link>
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source System</TableHead>
                <TableHead>Connector</TableHead>
                <TableHead>Target Module</TableHead>
                <TableHead>Entities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connectors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    No datasources configured.{" "}
                    <Link to="/data-ingestion/add" className="font-medium text-accent hover:underline">
                      Add your first datasource
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                connectors.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.source}</TableCell>
                    <TableCell>{c.connector}</TableCell>
                    <TableCell>{c.targetModule}</TableCell>
                    <TableCell className="text-muted-foreground">{c.entities}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell>{c.coverage}</TableCell>
                    <TableCell className="text-muted-foreground">{c.lastSync}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleSync(c.id)}>
                        Sync now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

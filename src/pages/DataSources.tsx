import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Database, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { roleData } from "@/data/roleData";

const statusDot: Record<string, string> = {
  Active: "bg-emerald-400",
  Warning: "bg-amber-400",
  Error: "bg-red-400",
};

export default function DataSources() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  if (!user) return null;
  const data = roleData[user.role].dataSources;

  const filtered = data.connected.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalRecords = data.connected.reduce((acc, d) => {
    const num = d.records.replace(/[^0-9.]/g, "");
    const mult = d.records.includes("M") ? 1000000 : d.records.includes("K") ? 1000 : 1;
    return acc + parseFloat(num || "0") * mult;
  }, 0);

  const formatTotal = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Data Sources</h1>
          <p className="text-sm text-muted-foreground">{user.industry} Industry Integrations</p>
        </div>
        <Button className="rounded-button gap-2">
          <Plus className="h-4 w-4" /> Add New Source
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-card p-5 text-center">
          <p className="text-xs text-muted-foreground">Connected Sources</p>
          <p className="text-2xl font-semibold mt-1">{data.connected.length}</p>
        </Card>
        <Card className="rounded-card p-5 text-center">
          <p className="text-xs text-muted-foreground">Total Records</p>
          <p className="text-2xl font-semibold mt-1">{formatTotal(totalRecords)}</p>
        </Card>
        <Card className="rounded-card p-5 text-center">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-semibold mt-1">{data.connected.filter((d) => d.status === "Active").length}</p>
        </Card>
      </div>

      <Input
        placeholder="Search data sources…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm rounded-input"
      />

      {/* Source cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((src) => (
          <Card key={src.name} className="rounded-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Database className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{src.name}</p>
                  <Badge variant="secondary" className="text-[10px] mt-0.5">{src.type}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`h-2.5 w-2.5 rounded-full ${statusDot[src.status] || "bg-gray-400"}`} />
                <span className="text-[11px] text-muted-foreground">{src.status}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{src.records} records</span>
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> {src.lastSync}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

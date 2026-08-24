import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { ResourceTypeSelector } from "@/domains/aec/components/ResourceTypeSelector";
import { PipelineErrorBanner } from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import type { ResourceType } from "@/domains/aec/data/orgChart";
import { toast } from "sonner";

export default function AddResource() {
  const navigate = useNavigate();
  const { createResource, activeTwin, activeTwinId, loadTwinDetail, resourcesError } = useAecApp();
  const [type, setType] = useState<ResourceType>("IN-HOUSE");
  const [name, setName] = useState("");
  const [entity, setEntity] = useState(activeTwin.entities[0]?.code ?? "");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [costRate, setCostRate] = useState("");
  const [billRate, setBillRate] = useState("");
  const [contractExpiry, setContractExpiry] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTwinId && isApiTwinId(activeTwinId) && !activeTwin.entities.length) {
      void loadTwinDetail(activeTwinId);
    }
  }, [activeTwinId, activeTwin.entities.length, loadTwinDetail]);

  useEffect(() => {
    if (!entity && activeTwin.entities[0]?.code) {
      setEntity(activeTwin.entities[0].code);
    }
  }, [activeTwin.entities, entity]);

  const showExpiryWarning = type === "CONTRACTOR" || type === "FREELANCER";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !designation.trim()) {
      toast.error("Please enter name and designation");
      return;
    }
    if (!entity) {
      toast.error("Select an entity");
      return;
    }
    setSaving(true);
    try {
      await createResource({
        name: name.trim(),
        type,
        entity,
        designation: designation.trim(),
        department: department.trim() || "General",
        ...(costRate ? { costRate: Number(costRate) } : {}),
        ...(billRate ? { billRate: Number(billRate) } : {}),
        ...(showExpiryWarning && contractExpiry ? { contractExpiry } : {}),
      });
      toast.success(`${name} added`);
      navigate("/resources/planning");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add resource");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Add Resource"
        subtitle="Register in-house employees, contractors, or freelancers with rate details."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Add Resource" },
        ]}
      />

      <PipelineErrorBanner message={resourcesError ?? ""} />

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <div>
          <Label className="mb-3 block">Resource Type</Label>
          <ResourceTypeSelector value={type} onChange={setType} />
        </div>

        {showExpiryWarning && (
          <div className="flex gap-3 rounded-lg border border-warning/40 bg-warning/5 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
            <p className="text-sm text-muted-foreground">
              Contract resources require an expiry date. System will alert when within 60 days.
            </p>
          </div>
        )}

        <Card className="rounded-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resource Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Chen" />
            </div>
            <div className="space-y-2">
              <Label>Entity</Label>
              <Select value={entity || undefined} onValueChange={setEntity}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select entity" /></SelectTrigger>
                <SelectContent>
                  {activeTwin.entities.map((e) => (
                    <SelectItem key={e.id} value={e.code}>{e.code} — {e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title / Designation</Label>
              <Input id="title" required value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Sr. Architect" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept">Department</Label>
              <Input id="dept" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Architecture" />
            </div>
            {type === "IN-HOUSE" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost Rate (£/hr)</Label>
                  <Input id="cost" type="number" value={costRate} onChange={(e) => setCostRate(e.target.value)} placeholder="65" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bill">Bill Rate (£/hr)</Label>
                  <Input id="bill" type="number" value={billRate} onChange={(e) => setBillRate(e.target.value)} placeholder="110" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cost">
                    {type === "CONTRACTOR" ? "Day Rate (£)" : "Hourly Rate (£)"}
                  </Label>
                  <Input id="cost" type="number" value={costRate} onChange={(e) => setCostRate(e.target.value)} placeholder={type === "CONTRACTOR" ? "480" : "72"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry">Contract Expiry</Label>
                  <Input id="expiry" type="date" value={contractExpiry} onChange={(e) => setContractExpiry(e.target.value)} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
          Add Resource
        </Button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, AlertTriangle } from "lucide-react";
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
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import type { ResourceType } from "@/domains/aec/data/orgChart";
import { toast } from "sonner";

export default function AddResource() {
  const navigate = useNavigate();
  const { addResource, activeTwin } = useAecApp();
  const [type, setType] = useState<ResourceType>("IN-HOUSE");
  const [name, setName] = useState("");
  const [entity, setEntity] = useState(activeTwin.entities[0]?.code ?? "MA");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [costRate, setCostRate] = useState("");
  const [billRate, setBillRate] = useState("");
  const [contractExpiry, setContractExpiry] = useState("2026-08-01");

  const showExpiryWarning = type === "CONTRACTOR" || type === "FREELANCER";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !designation.trim()) {
      toast.error("Please enter name and designation");
      return;
    }
    addResource({
      name: name.trim(),
      type,
      entity,
      designation: designation.trim(),
      department: department.trim() || "General",
      costRate: costRate ? `£${costRate}${type === "CONTRACTOR" ? "/day" : "/hr"}` : "TBD",
      billRate: billRate ? `£${billRate}${type === "CONTRACTOR" ? "/day" : "/hr"}` : "TBD",
      projects: [],
    });
    toast.success(`${name} added to resource directory`);
    navigate("/resources/planning");
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Add Resource"
        subtitle="Register in-house employees, contractors, or freelancers with rate and allocation details."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Add Resource" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
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
          <CardHeader>
            <CardTitle className="text-base">Resource Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Chen" />
            </div>
            <div className="space-y-2">
              <Label>Entity</Label>
              <Select value={entity} onValueChange={setEntity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {activeTwin.entities.map((e) => (
                    <SelectItem key={e.code} value={e.code}>{e.code} — {e.name}</SelectItem>
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
                  <Input id="cost" value={costRate} onChange={(e) => setCostRate(e.target.value)} placeholder="65" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bill">Bill Rate (£/hr)</Label>
                  <Input id="bill" value={billRate} onChange={(e) => setBillRate(e.target.value)} placeholder="110" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cost">
                    {type === "CONTRACTOR" ? "Day Rate (£)" : "Hourly Rate (£)"}
                  </Label>
                  <Input id="cost" value={costRate} onChange={(e) => setCostRate(e.target.value)} placeholder={type === "CONTRACTOR" ? "480" : "72"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry">Contract Expiry</Label>
                  <Input id="expiry" type="date" value={contractExpiry} onChange={(e) => setContractExpiry(e.target.value)} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Button type="submit">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Resource
        </Button>
      </form>
    </div>
  );
}

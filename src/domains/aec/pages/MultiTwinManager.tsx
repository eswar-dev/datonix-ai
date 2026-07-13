import { useState } from "react";
import { GitBranchPlus, Plus } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Textarea } from "@/common/components/ui/textarea";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { useAecTwin } from "@/domains/aec/context/AecTwinContext";
import { twins } from "@/domains/aec/data/meridian";
import { toast } from "sonner";

export default function MultiTwinManager() {
  const { activeTwinId, switchTwin } = useAecTwin();
  const [createOpen, setCreateOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");

  const handleCreate = () => {
    setCreateOpen(false);
    setNewPrompt("");
    toast.success("Enterprise Twin creation queued — check back shortly");
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Multi-Twin Manager"
        subtitle="Manage multiple enterprise twins across groups and geographies."
        breadcrumb={[
          { label: "Intelligence", href: "/enterprise-twin" },
          { label: "Multi-Twin Manager" },
        ]}
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Enterprise Twin
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {twins.map((twin) => {
          const isActive = twin.id === activeTwinId;
          return (
            <Card
              key={twin.id}
              className={`rounded-card ${isActive ? "border-accent ring-1 ring-accent/20" : ""}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GitBranchPlus className="h-5 w-5 text-accent" />
                    <CardTitle className="text-base">{twin.name}</CardTitle>
                  </div>
                  <StatusBadge status={isActive ? "Live" : twin.status} />
                </div>
                <p className="text-sm text-muted-foreground">{twin.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-2xl font-semibold">{twin.staffCount}</p>
                    <p className="text-xs text-muted-foreground">Staff</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-2xl font-semibold">{twin.projectCount}</p>
                    <p className="text-xs text-muted-foreground">Projects</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {twin.entities.map((e) => (
                    <span key={e.id} className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                      {e.code} · {e.staffCount}
                    </span>
                  ))}
                </div>
                {!isActive && (
                  <Button variant="outline" className="w-full" onClick={() => switchTwin(twin.id)}>
                    Switch to this Twin
                  </Button>
                )}
                {isActive && (
                  <p className="text-center text-xs font-medium text-accent">Currently active twin</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Enterprise Twin</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Describe the organization to generate a new enterprise twin with four intelligence layers.
          </p>
          <Textarea
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="e.g. A multi-office engineering firm with 3 regional entities…"
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newPrompt.trim()}>
              Create Twin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

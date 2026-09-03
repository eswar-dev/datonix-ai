import { useState } from "react";
import { GitBranchPlus, Loader2, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
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
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import { DEFAULT_TWIN_PROMPT, useAecTwin } from "@/domains/aec/context/AecTwinContext";
import type { EnterpriseTwinSummary } from "@/domains/aec/api/twinMappers";

export default function MultiTwinManager() {
  const {
    activeTwinId,
    twins,
    twinsLoading,
    switchTwin,
    generateTwin,
    deleteTwin,
    isGenerating,
  } = useAecTwin();
  const [createOpen, setCreateOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [twinToDelete, setTwinToDelete] = useState<EnterpriseTwinSummary | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async () => {
    const prompt = newPrompt.trim();
    if (!prompt) return;
    setCreateOpen(false);
    await generateTwin(prompt);
    setNewPrompt("");
  };

  const handleConfirmDelete = async () => {
    if (!twinToDelete) return;
    setDeletingId(twinToDelete.id);
    const ok = await deleteTwin(twinToDelete.id);
    setDeletingId(null);
    if (ok) setTwinToDelete(null);
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Multi-Twin Manager"
        subtitle="Manage multiple enterprise twins across groups and geographies."
        breadcrumb={[
          { label: "Enterprise Ops", href: "/enterprise-twin" },
          { label: "Multi-Twin Manager" },
        ]}
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)} disabled={isGenerating}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Enterprise Twin
          </Button>
        }
      />

      {twinsLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading twins from API…
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {twins.map((twin) => {
          const isActive = twin.id === activeTwinId;
          const canDelete = isApiTwinId(twin.id);
          const isDeleting = deletingId === twin.id;

          return (
            <Card
              key={twin.id}
              className={`rounded-card ${isActive ? "border-accent ring-1 ring-accent/20" : ""}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <GitBranchPlus className="h-5 w-5 shrink-0 text-accent" />
                    <CardTitle className="truncate text-base">{twin.name}</CardTitle>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <StatusBadge status={isActive ? "Live" : twin.status} />
                    {canDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        disabled={isDeleting || isGenerating}
                        onClick={() => setTwinToDelete(twin)}
                        aria-label={`Delete ${twin.name}`}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
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
        {!twinsLoading && twins.length === 0 && (
          <p className="text-sm text-muted-foreground md:col-span-2">
            No twins yet. Create one to get started.
          </p>
        )}
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="justify-start px-0 text-accent"
            onClick={() => setNewPrompt(DEFAULT_TWIN_PROMPT)}
          >
            Use example prompt
          </Button>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} disabled={!newPrompt.trim() || isGenerating}>
              {isGenerating ? "Creating…" : "Create Twin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(twinToDelete)} onOpenChange={(open) => !open && setTwinToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Enterprise Twin?</AlertDialogTitle>
            <AlertDialogDescription>
              {twinToDelete ? (
                <>
                  This will permanently delete <strong>{twinToDelete.name}</strong> and all
                  published organizations, compliance rules, and twin-scoped data linked to it.
                  This action cannot be undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingId)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={Boolean(deletingId)}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmDelete();
              }}
            >
              {deletingId ? "Deleting…" : "Delete Twin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

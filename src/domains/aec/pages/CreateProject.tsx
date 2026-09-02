import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { ProjectForm } from "@/domains/aec/components/ProjectForm";
import { PipelineErrorBanner } from "@/domains/aec/components/PipelineUi";
import { TwinEntitiesBanner } from "@/domains/aec/components/TwinEntitiesBanner";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { aecProjectRecommendations } from "@/common/api/aecPipeline";
import { mapRecommendations } from "@/domains/aec/api/pipelineMappers";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import type { StaffRecommendation } from "@/domains/aec/data/projects";
import { toast } from "sonner";

export default function CreateProject() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    projectDraft,
    updateDraft,
    saveProjectFromDraft,
    activeTwin,
    activeTwinId,
    loadTwinDetail,
    pipelineError,
  } = useAecApp();
  const [saving, setSaving] = useState(false);
  const [recommendations, setRecommendations] = useState<StaffRecommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  useEffect(() => {
    if (activeTwinId && isApiTwinId(activeTwinId) && !activeTwin.entities.length) {
      void loadTwinDetail(activeTwinId);
    }
  }, [activeTwinId, activeTwin.entities.length, loadTwinDetail]);

  useEffect(() => {
    const client = searchParams.get("client");
    const entity = searchParams.get("entity");
    const value = searchParams.get("value");
    const name = searchParams.get("name");

    if (client || entity || value || name) {
      const match = activeTwin.entities.find((e) => e.code === entity);
      updateDraft({
        ...(name && { name: decodeURIComponent(name) }),
        ...(client && { client: decodeURIComponent(client) }),
        ...(entity && { entity: decodeURIComponent(entity) }),
        ...(match && { entity: match.code, currency: match.currency }),
        ...(value && { budget: Number(value) }),
      });
    }
  }, [searchParams, updateDraft, activeTwin.entities]);

  useEffect(() => {
    if (!activeTwinId || !isApiTwinId(activeTwinId)) {
      setRecommendations([]);
      return;
    }
    setRecsLoading(true);
    const q: Record<string, string> = {};
    if (projectDraft.type) q.projectType = projectDraft.type;
    if (projectDraft.entity) q.entity = projectDraft.entity;
    void aecProjectRecommendations(activeTwinId, q)
      .then((raw) => setRecommendations(mapRecommendations(raw)))
      .catch(() => setRecommendations([]))
      .finally(() => setRecsLoading(false));
  }, [activeTwinId, projectDraft.type, projectDraft.entity]);

  const handleNext = async () => {
    if (!projectDraft.name.trim() || !projectDraft.client.trim()) {
      toast.error("Please enter project name and client");
      return;
    }
    if (!projectDraft.entity) {
      toast.error("Please select an entity");
      return;
    }
    setSaving(true);
    try {
      await saveProjectFromDraft();
      toast.success("Project saved — opening WBS Builder");
      navigate("/projects/wbs");
    } catch {
      /* toast already shown */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Create Project"
        subtitle="Set up a new project with billing, budget, and AI-recommended team."
        breadcrumb={[
          { label: "Project Pipeline", href: "/projects" },
          { label: "Create Project" },
        ]}
        actions={
          <Button size="sm" onClick={() => void handleNext()} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Next: Build WBS
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        }
      />

      <PipelineErrorBanner message={pipelineError ?? ""} />
      <TwinEntitiesBanner entities={activeTwin.entities} twinLabel={activeTwin.name} />

      <ProjectForm
        draft={projectDraft}
        onChange={updateDraft}
        entities={activeTwin.entities}
        recommendations={recommendations}
        recommendationsLoading={recsLoading}
      />

      <div className="flex items-center justify-end border-t pt-4">
        <Button onClick={() => void handleNext()} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Next: Build WBS
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

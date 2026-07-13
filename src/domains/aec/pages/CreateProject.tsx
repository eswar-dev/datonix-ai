import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, FolderPlus } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { ProjectForm } from "@/domains/aec/components/ProjectForm";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { toast } from "sonner";

export default function CreateProject() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projectDraft, updateDraft, saveProjectFromDraft } = useAecApp();

  useEffect(() => {
    const client = searchParams.get("client");
    const entity = searchParams.get("entity");
    const value = searchParams.get("value");
    const name = searchParams.get("name");

    if (client || entity || value || name) {
      updateDraft({
        ...(name && { name: decodeURIComponent(name) }),
        ...(client && { client: decodeURIComponent(client) }),
        ...(entity && { entity: entity as typeof projectDraft.entity }),
        ...(value && { budget: Number(value) }),
        ...(entity === "MC" && { currency: "AED" }),
      });
    }
  }, [searchParams, updateDraft, projectDraft.entity]);

  const handleNext = () => {
    if (!projectDraft.name.trim() || !projectDraft.client.trim()) {
      toast.error("Please enter project name and client");
      return;
    }
    saveProjectFromDraft();
    toast.success("Project saved — opening WBS Builder");
    navigate("/projects/wbs");
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Create Project"
        subtitle="Set up a new project with billing, budget, and AI-recommended team."
        breadcrumb={[
          { label: "Pipeline", href: "/customer-inquiries" },
          { label: "Create Project" },
        ]}
        actions={
          <Button size="sm" onClick={handleNext}>
            Next: Build WBS
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        }
      />

      <ProjectForm draft={projectDraft} onChange={updateDraft} />

      <div className="flex justify-end">
        <Button onClick={handleNext}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Next: Build WBS →
        </Button>
      </div>
    </div>
  );
}

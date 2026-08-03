import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Textarea } from "@/common/components/ui/textarea";
import { Skeleton } from "@/common/components/ui/skeleton";
import { DEFAULT_TWIN_PROMPT, useAecTwin } from "@/domains/aec/context/AecTwinContext";

export function GenerateTwinPanel() {
  const { isGenerating, twinGenerated, generateTwin, activeTwin, twinDetail } = useAecTwin();
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    void generateTwin(prompt);
  };

  return (
    <Card className="rounded-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-accent" />
          Generate Enterprise Twin
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Describe your organization to generate a four-layer enterprise twin via the API.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="resize-none"
          disabled={isGenerating}
          placeholder="e.g. A multi-entity AEC holding company with architecture, engineering, and construction subsidiaries…"
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Twin
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isGenerating}
            onClick={() => setPrompt(DEFAULT_TWIN_PROMPT)}
          >
            Use example prompt
          </Button>
        </div>

        {isGenerating && (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid gap-2 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-md" />
              ))}
            </div>
          </div>
        )}

        {!isGenerating && twinGenerated && activeTwin.id && (
          <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">
            Active twin: <span className="font-medium">{activeTwin.name}</span>
            {" · "}
            {activeTwin.entities.length} entities
            {" · "}
            {twinDetail?.agents.length ?? 0} agents
            {" · "}
            {twinDetail?.kpis.length ?? 0} KPIs
          </div>
        )}
      </CardContent>
    </Card>
  );
}

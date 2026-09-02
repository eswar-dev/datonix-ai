import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/common/components/ui/alert";
import { Button } from "@/common/components/ui/button";
import type { TwinEntity } from "@/domains/aec/data/meridian";

interface TwinEntitiesBannerProps {
  entities: TwinEntity[];
  twinLabel?: string;
}

/** Warn when no published organizations exist — entity writes will fail with "Invalid entity." */
export function TwinEntitiesBanner({ entities, twinLabel }: TwinEntitiesBannerProps) {
  if (entities.length > 0) return null;

  return (
    <Alert variant="destructive" className="rounded-card">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>No entities available</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          {twinLabel
            ? `"${twinLabel}" has no published organizations yet.`
            : "This Enterprise Twin has no published organizations yet."}{" "}
          Customer inquiries, projects, and resources require an entity code (e.g. MA, ME, MC)
          created when the twin is published.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/enterprise-twin">Publish or open Enterprise Twin</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}

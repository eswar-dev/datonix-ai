import { Link } from "react-router-dom";
import { Check, ChevronDown, GitBranchPlus, Plus } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { useAecTwin } from "@/domains/aec/context/AecTwinContext";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/common/lib/utils";

export function AecTwinSelector() {
  const { activeTwin, activeTwinId, twins, switchTwin } = useAecTwin();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-[color:var(--shell-brand)]/20 bg-[color:var(--shell-brand)]/8 px-2.5 text-xs font-semibold text-[color:var(--shell-text)] sm:gap-2"
        >
          <GitBranchPlus className="h-3.5 w-3.5 shrink-0 text-[color:var(--shell-brand)]" />
          <span className="max-w-[100px] truncate text-xs font-medium sm:max-w-[140px]">{activeTwin.name}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Enterprise Twin</DropdownMenuLabel>
        {twins.length === 0 ? (
          <div className="px-2 py-3 text-xs text-muted-foreground">No twins from API yet.</div>
        ) : (
          twins.map((twin) => {
            const isActive = twin.id === activeTwinId;
            return (
              <DropdownMenuItem
                key={twin.id}
                className="flex cursor-pointer items-start gap-2 py-2.5"
                onClick={() => switchTwin(twin.id)}
              >
                <Check
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0 text-accent",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{twin.name}</span>
                    <StatusBadge
                      status={isActive ? "Live" : twin.status}
                      className="shrink-0"
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {twin.staffCount} staff · {twin.projectCount} projects
                  </p>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/multi-twin" className="flex items-center gap-2 text-accent">
            <Plus className="h-4 w-4" />
            Manage twins
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

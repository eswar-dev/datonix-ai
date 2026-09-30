import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { useManufacturingSite } from "@/domains/manufacturing/context/ManufacturingSiteContext";
import { MfgCountryChip, SITE_ICONS } from "@/domains/manufacturing/components/mfgIcons";
import { cn } from "@/common/lib/utils";

export function MfgSiteSelector() {
  const { sites, activeSite, activeSiteId, setActiveSiteId } = useManufacturingSite();
  const ActiveIcon = SITE_ICONS[activeSiteId];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-[color:var(--shell-brand)]/20 bg-[color:var(--shell-brand)]/8 px-2.5 text-xs font-semibold text-[color:var(--shell-text)] sm:gap-2"
        >
          <ActiveIcon className="h-3.5 w-3.5 shrink-0 text-[color:var(--shell-brand)]" strokeWidth={1.75} />
          <span className="max-w-[100px] truncate text-xs font-medium sm:max-w-[160px]">
            {activeSite.full}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Active site</DropdownMenuLabel>
        {sites.map((site) => {
          const isActive = site.id === activeSiteId;
          const Icon = SITE_ICONS[site.id];
          return (
            <DropdownMenuItem
              key={site.id}
              className="flex cursor-pointer items-start gap-2 py-2.5"
              onClick={() => setActiveSiteId(site.id)}
            >
              <Check className={cn("mt-0.5 h-4 w-4 shrink-0 text-accent", isActive ? "opacity-100" : "opacity-0")} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-[color:var(--page-accent)]" strokeWidth={1.75} />
                  <span className="truncate text-sm font-medium">{site.full}</span>
                  <MfgCountryChip id={site.id} />
                  <StatusBadge status={site.status} className="shrink-0" />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {site.coverage}% twin coverage · {site.currency}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

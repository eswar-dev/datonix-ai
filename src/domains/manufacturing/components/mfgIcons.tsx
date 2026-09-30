import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Building2,
  ClipboardList,
  Cog,
  Factory,
  Flame,
  Landmark,
  LineChart,
  Package,
  PenTool,
  Truck,
  Warehouse,
  Wrench,
  Zap,
} from "lucide-react";
import { cn } from "@/common/lib/utils";
import type { MfgSiteId } from "@/domains/manufacturing/data";

const TONES = {
  brand: "bg-[color:var(--page-accent)]/10 text-[color:var(--page-accent)]",
  teal: "bg-[color:var(--page-teal)]/10 text-[color:var(--page-teal)]",
  blue: "bg-[color:var(--page-blue)]/10 text-[color:var(--page-blue)]",
  amber: "bg-[color:var(--page-amber)]/10 text-[color:var(--page-amber)]",
  purple: "bg-[color:var(--page-purple)]/10 text-[color:var(--page-purple)]",
  muted: "bg-[color:var(--page-card-2)] text-[color:var(--page-muted)]",
} as const;

export function MfgGlyph({
  icon: Icon,
  tone = "brand",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: keyof typeof TONES;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-6 w-6" : "h-7 w-7";
  const glyph = size === "lg" ? "h-4 w-4" : size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-md", box, TONES[tone], className)}>
      <Icon className={glyph} strokeWidth={1.75} />
    </span>
  );
}

export const ROLE_ICONS: Record<string, LucideIcon> = {
  plant: Factory,
  production: ClipboardList,
  quality: BadgeCheck,
  maintenance: Wrench,
  supplychain: Package,
  energy: Zap,
  cfo: Landmark,
  coo: LineChart,
};

export const DOMAIN_ICONS: Record<string, LucideIcon> = {
  Production: Cog,
  "Asset Reliability": Wrench,
  Quality: BadgeCheck,
  "Supply Chain": Package,
  Energy: Zap,
  "Service & Logistics": Truck,
  "Engineering & Process": PenTool,
  "Financial Performance": Landmark,
};

export const SITE_ICONS: Record<MfgSiteId | "group", LucideIcon> = {
  group: Building2,
  birmingham: Factory,
  katowice: Flame,
  coventry: Warehouse,
};

export const SITE_TONES: Record<MfgSiteId | "group", keyof typeof TONES> = {
  group: "brand",
  birmingham: "blue",
  katowice: "amber",
  coventry: "purple",
};

export function siteGlyphProps(id: string) {
  const key = (id in SITE_ICONS ? id : "birmingham") as keyof typeof SITE_ICONS;
  return { icon: SITE_ICONS[key], tone: SITE_TONES[key] };
}

export function siteCountry(id: string) {
  if (id === "katowice") return "PL";
  if (id === "group") return "EU";
  return "UK";
}

export function MfgCountryChip({ id, className }: { id: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-4 min-w-[22px] items-center justify-center rounded border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] px-1 font-mono text-[9px] font-bold tracking-wide text-[color:var(--page-muted)]",
        className,
      )}
    >
      {siteCountry(id)}
    </span>
  );
}

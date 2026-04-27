import logoSrc from "@/assets/datapx1-logo.png";

interface DatapxLogoProps {
  collapsed?: boolean;
  variant?: "light" | "dark";
}

export function DatapxLogo({ collapsed = false, variant = "light" }: DatapxLogoProps) {
  const taglineColor = variant === "light" ? "#aaccdd" : "hsl(var(--muted-foreground))";

  return (
    <div className="flex items-center gap-3">
      <img
        src={logoSrc}
        alt="Datapx1"
        width={collapsed ? 38 : 48}
        height={collapsed ? 38 : 48}
        className="shrink-0 object-contain"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}
      />
      {!collapsed && (
        <div className="min-w-0">
          <p
            className="text-[9px] font-bold uppercase tracking-[1.5px] leading-tight"
            style={{ color: taglineColor, maxWidth: 140 }}
          >
            Asset Optimization &<br />Decision Intelligence
          </p>
        </div>
      )}
    </div>
  );
}

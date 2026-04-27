import logoSrc from "@/assets/datapx1-logo.png";

interface DatapxLogoProps {
  collapsed?: boolean;
  variant?: "light" | "dark";
}

export function DatapxLogo({ collapsed = false, variant = "light" }: DatapxLogoProps) {
  const titleColor = variant === "light" ? "#1AABEC" : "hsl(var(--primary))";
  const taglineColor = variant === "light" ? "#aaccdd" : "hsl(var(--muted-foreground))";

  return (
    <div className="flex items-center gap-2.5">
      <img
        src={logoSrc}
        alt="Datapx1"
        width={collapsed ? 36 : 42}
        height={collapsed ? 36 : 42}
        className="shrink-0 object-contain"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}
      />
      {!collapsed && (
        <div className="min-w-0">
          <h1
            className="text-[18px] font-black tracking-tight leading-none"
            style={{ fontFamily: "'Sora', 'Arial Black', sans-serif", color: titleColor, letterSpacing: "-0.02em" }}
          >
            DATA<span style={{ color: "#E8B400" }}>PX1</span>
          </h1>
          <p
            className="text-[7px] font-bold uppercase tracking-[2px] mt-0.5"
            style={{ color: taglineColor }}
          >
            Industrial Decision Intelligence
          </p>
        </div>
      )}
    </div>
  );
}

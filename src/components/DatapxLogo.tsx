interface DatapxLogoProps {
  collapsed?: boolean;
  variant?: "light" | "dark";
}

export function DatapxLogo({ collapsed = false, variant = "light" }: DatapxLogoProps) {
  const titleColor = variant === "light" ? "#1AABEC" : "hsl(var(--primary))";
  const taglineColor = variant === "light" ? "#aaccdd" : "hsl(var(--muted-foreground))";

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={collapsed ? 32 : 36}
        height={collapsed ? 32 : 36}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path
          d="M10 10 H38 a14 14 0 0 1 14 14 v16 a14 14 0 0 1 -14 14 H10 Z"
          fill="none"
          stroke="#1AABEC"
          strokeWidth="3"
        />
        <circle cx="22" cy="32" r="3" fill="#1AABEC" />
        <circle cx="34" cy="22" r="3" fill="#1AABEC" />
        <circle cx="34" cy="42" r="3" fill="#1AABEC" />
        <circle cx="44" cy="32" r="3" fill="#1AABEC" />
        <line x1="22" y1="32" x2="34" y2="22" stroke="#1AABEC" strokeWidth="1.5" opacity="0.6" />
        <line x1="22" y1="32" x2="34" y2="42" stroke="#1AABEC" strokeWidth="1.5" opacity="0.6" />
        <line x1="34" y1="22" x2="44" y2="32" stroke="#1AABEC" strokeWidth="1.5" opacity="0.6" />
        <line x1="34" y1="42" x2="44" y2="32" stroke="#1AABEC" strokeWidth="1.5" opacity="0.6" />
      </svg>
      {!collapsed && (
        <div className="min-w-0">
          <h1
            className="text-[20px] font-black tracking-tight leading-none"
            style={{ fontFamily: "'Sora', 'Arial Black', sans-serif", color: titleColor, letterSpacing: "-0.02em" }}
          >
            Datapx<span style={{ color: "#FF8A3D" }}>1</span>
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

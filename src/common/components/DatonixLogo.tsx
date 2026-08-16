import { cn } from "@/common/lib/utils";

const BRAND_ACCENT = "#0099FF";
const BRAND_MUTED = "#89D8F8";

export function DatonixLogo({
  tagline,
  size = "md",
  className,
}: {
  tagline: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dimensions =
    size === "sm"
      ? { width: 140, height: 32, fontSize: 18, subSize: 4.5 }
      : size === "lg"
        ? { width: 260, height: 56, fontSize: 28, subSize: 5.5 }
        : { width: 180, height: 40, fontSize: 22, subSize: 5 };

  return (
    <svg
      viewBox="0 0 240 52"
      width={dimensions.width}
      height={dimensions.height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Datonix"
      className={cn("shrink-0", className)}
    >
      <polygon
        points="22,26 34,8 58,8 70,26 58,44 34,44"
        stroke={BRAND_MUTED}
        strokeWidth="2.5"
        fill="none"
      />
      <circle cx="46" cy="26" r="7" fill={BRAND_ACCENT} />
      <circle cx="60" cy="22" r="5.2" fill={BRAND_ACCENT} />
      <circle cx="46" cy="14" r="4.8" fill={BRAND_ACCENT} />
      <circle cx="33" cy="22" r="4.3" fill={BRAND_ACCENT} />
      <circle cx="46" cy="37" r="4.3" fill={BRAND_ACCENT} />
      <circle cx="59" cy="35" r="2.6" fill={BRAND_ACCENT} />
      <circle cx="34" cy="15" r="2" fill={BRAND_ACCENT} />
      <text
        x="82"
        y="33"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontWeight="900"
        fontSize={dimensions.fontSize}
        fill={BRAND_ACCENT}
      >
        Datonix
      </text>
      <text
        x="82"
        y="46"
        fontFamily="Arial, sans-serif"
        fontWeight="600"
        fontSize={dimensions.subSize}
        fill="#7a9ab5"
        letterSpacing="0.8"
      >
        {tagline}
      </text>
    </svg>
  );
}

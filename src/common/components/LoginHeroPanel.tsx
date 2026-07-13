import type { DomainLoginTheme } from "@/domains/loginTypes";

interface LoginHeroPanelProps {
  theme: DomainLoginTheme;
  domainLabel: string;
  title: string;
  subtitle: string;
  highlights: string[];
  image: string;
  imageAlt: string;
}

export function LoginHeroPanel({
  theme,
  domainLabel,
  title,
  subtitle,
  highlights,
  image,
  imageAlt,
}: LoginHeroPanelProps) {
  return (
    <div
      className="relative hidden min-h-[100dvh] min-h-screen md:flex md:w-[46%] lg:w-[48%] xl:w-1/2 flex-col justify-center overflow-hidden"
      style={{ background: theme.pageBackground }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 50%, rgba(0,153,255,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-10 py-12 lg:px-14">
        <span
          className="mb-5 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{
            color: theme.accentMuted,
            borderColor: "rgba(0,153,255,0.35)",
            background: "rgba(0,153,255,0.08)",
          }}
        >
          {domainLabel}
        </span>

        <h2
          className="mb-3 max-w-lg text-center text-[26px] font-semibold leading-snug lg:text-[30px]"
          style={{ color: theme.textPrimary }}
        >
          {title}
        </h2>

        <p
          className="mb-8 max-w-md text-center text-[15px] leading-relaxed"
          style={{ color: theme.textSecondary }}
        >
          {subtitle}
        </p>

        {/* Hero image card */}
        <div
          className="relative w-full max-w-[540px] overflow-hidden rounded-2xl"
          style={{
            border: `1px solid ${theme.border}`,
            boxShadow: "0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,153,255,0.06)",
          }}
        >
          <div className="aspect-[16/10] w-full">
            <img
              src={image}
              alt={imageAlt}
              className="h-full w-full object-cover object-center"
              loading="eager"
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(21,32,48,0.55) 0%, transparent 45%)",
            }}
          />
        </div>

        {/* Feature pills */}
        <ul className="mt-8 flex max-w-[540px] flex-wrap justify-center gap-2">
          {highlights.map((item) => (
            <li
              key={item}
              className="rounded-full border px-3.5 py-1.5 text-xs font-medium"
              style={{
                color: theme.textSecondary,
                borderColor: theme.border,
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

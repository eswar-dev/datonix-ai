import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/common/contexts/AuthContext";
import { useDomain } from "@/common/contexts/DomainContext";
import { LOGIN_QUICK_ACCOUNTS } from "@/common/const.js";
import { LoginHeroPanel } from "@/common/components/LoginHeroPanel";

function LoginLogo({ tagline, accent, accentMuted }: { tagline: string; accent: string; accentMuted: string }) {
  return (
    <svg viewBox="0 0 240 52" width="260" height="56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <polygon points="22,26 34,8 58,8 70,26 58,44 34,44" stroke={accentMuted} strokeWidth="2.5" fill="none" />
      <circle cx="46" cy="26" r="7" fill={accent} />
      <circle cx="60" cy="22" r="5.2" fill={accent} />
      <circle cx="46" cy="14" r="4.8" fill={accent} />
      <circle cx="33" cy="22" r="4.3" fill={accent} />
      <circle cx="46" cy="37" r="4.3" fill={accent} />
      <circle cx="59" cy="35" r="2.6" fill={accent} />
      <circle cx="34" cy="15" r="2" fill={accent} />
      <text x="82" y="33" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="28" fill={accent}>
        Datonix
      </text>
      <text x="82" y="46" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="5.5" fill="#7a9ab5" letterSpacing="0.8">
        {tagline}
      </text>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const domain = useDomain();
  const { login: loginConfig, label: domainLabel } = domain;
  const { theme } = loginConfig;

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.background;
    const prevBodyBg = body.style.background;
    const prevHtmlMinH = html.style.minHeight;
    const prevBodyMinH = body.style.minHeight;
    html.style.background = theme.pageBackground;
    body.style.background = theme.pageBackground;
    html.style.minHeight = "100%";
    body.style.minHeight = "100%";
    return () => {
      html.style.background = prevHtmlBg;
      body.style.background = prevBodyBg;
      html.style.minHeight = prevHtmlMinH;
      body.style.minHeight = prevBodyMinH;
    };
  }, [theme.pageBackground]);

  const submitCredentials = async (nextEmail: string, nextPassword: string) => {
    setEmail(nextEmail);
    setPassword(nextPassword);
    setError("");
    setSubmitting(true);
    try {
      const err = await login(nextEmail, nextPassword);
      if (err) {
        setError(err);
      } else {
        navigate("/dashboard");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCredentials(email, password);
  };

  const quickAccounts = [
    ...loginConfig.demoAccounts,
    ...(import.meta.env.DEV ? LOGIN_QUICK_ACCOUNTS : []),
  ];

  const inputClass =
    "h-12 w-full rounded-xl border px-4 text-[15px] outline-none transition-all duration-150 placeholder:opacity-40 focus:ring-2 focus:ring-[#0099FF]/25";

  return (
    <div
      className="flex min-h-[100dvh] min-h-screen w-full"
      style={{ background: theme.pageBackground }}
    >
      {/* Left — sign-in panel (slightly wider for SaaS balance) */}
      <div
        className="flex min-h-[100dvh] min-h-screen w-full flex-col justify-center md:w-[54%] lg:w-[52%] xl:w-[50%]"
        style={{ background: theme.panelBackground }}
      >
        <div className="mx-auto flex w-full max-w-[560px] flex-col justify-center px-10 py-14 sm:px-14 lg:px-16 xl:px-20">
          <div
            className="mb-12 rounded-2xl px-6 py-5"
            style={{ background: theme.panelHeaderBackground, border: `1px solid ${theme.border}` }}
          >
            <LoginLogo tagline={domain.tagline} accent={theme.accent} accentMuted={theme.accentMuted} />
          </div>

          <span
            className="mb-4 inline-flex w-fit items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]"
            style={{
              color: theme.accentMuted,
              borderColor: "rgba(0,153,255,0.3)",
              background: "rgba(0,153,255,0.07)",
            }}
          >
            {domainLabel}
          </span>

          <h1 className="mb-2 text-[32px] font-semibold leading-tight lg:text-[36px]" style={{ color: theme.textPrimary }}>
            Sign in
          </h1>
          <p className="mb-10 text-base leading-relaxed lg:text-[17px]" style={{ color: theme.textMuted }}>
            Access your {domainLabel.toLowerCase()} decision intelligence workspace
          </p>

          {error && (
            <div
              className="mb-5 rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: "rgba(239,68,68,0.35)",
                background: "rgba(239,68,68,0.1)",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-medium" style={{ color: theme.textSecondary }}>
                Email address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                style={{
                  color: theme.textPrimary,
                  background: theme.inputBackground,
                  borderColor: theme.border,
                }}
                placeholder="you@company.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-medium" style={{ color: theme.textSecondary }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                  style={{
                    color: theme.textPrimary,
                    background: theme.inputBackground,
                    borderColor: theme.border,
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 transition-opacity hover:opacity-80"
                  style={{ color: theme.textPrimary }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label
                className="flex cursor-pointer items-center gap-2.5 text-[15px]"
                style={{ color: theme.textSecondary }}
              >
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-[18px] w-[18px] rounded"
                  style={{ accentColor: theme.accent }}
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-[15px] font-medium transition-opacity hover:opacity-80"
                style={{ color: theme.accent }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-3 h-12 w-full rounded-xl text-[15px] font-semibold text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: theme.accent }}
              onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = theme.accentHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.accent)}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>

            {quickAccounts.length > 0 && import.meta.env.DEV && (
              <div
                className="mt-5 rounded-xl border p-5"
                style={{ borderColor: theme.border, background: "rgba(255,255,255,0.02)" }}
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                  Demo access · {domainLabel}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {quickAccounts.map((acc) => (
                    <button
                      key={`${acc.email}-${acc.label}`}
                      type="button"
                      disabled={submitting}
                      onClick={() => submitCredentials(acc.email, acc.password)}
                      className="rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-white/[0.06] disabled:opacity-60"
                      style={{
                        color: theme.textSecondary,
                        borderColor: theme.border,
                      }}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          <p className="mt-12 text-center text-xs" style={{ color: theme.textMuted }}>
            © {new Date().getFullYear()} AI-PRIORI · All rights reserved
          </p>
        </div>
      </div>

      <LoginHeroPanel
        theme={theme}
        domainLabel={domainLabel}
        title={loginConfig.welcomeTitle}
        subtitle={loginConfig.welcomeSubtitle}
        highlights={loginConfig.highlights}
        image={loginConfig.heroImage}
        imageAlt={loginConfig.heroAlt}
      />
    </div>
  );
}

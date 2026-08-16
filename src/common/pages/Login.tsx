import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/common/contexts/AuthContext";
import { useDomain } from "@/common/contexts/DomainContext";
import { LoginHeroPanel } from "@/common/components/LoginHeroPanel";
import { DatonixLogo } from "@/common/components/DatonixLogo";

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
        navigate(domain.defaultRoute || "/dashboard");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCredentials(email, password);
  };

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
            <DatonixLogo tagline={domain.tagline} size="lg" />
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

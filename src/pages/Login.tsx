import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LOGIN_QUICK_ACCOUNTS } from "@/const.js";
import factoryImg from "@/assets/factory-worker.jpg";

function LoginLogo() {
  return (
    <svg viewBox="0 0 220 50" width="220" height="50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="22,25 34,7 58,7 70,25 58,43 34,43" stroke="#89D8F8" strokeWidth="3" fill="none" />
      <circle cx="46" cy="25" r="7" fill="#0099FF" />
      <circle cx="60" cy="21" r="5.2" fill="#0099FF" />
      <circle cx="46" cy="13" r="4.8" fill="#0099FF" />
      <circle cx="33" cy="21" r="4.3" fill="#0099FF" />
      <circle cx="46" cy="36" r="4.3" fill="#0099FF" />
      <circle cx="59" cy="34" r="2.6" fill="#0099FF" />
      <circle cx="34" cy="14" r="2" fill="#0099FF" />
      <text x="78" y="32" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="28" fill="#0099FF">Datonix</text>
      <text x="78" y="44" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="5.5" fill="#6a9ab8" letterSpacing="0.7">AI THAT MAKES DECISIONS ACTIONABLE</text>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
    html.style.background = "#152030";
    body.style.background = "#152030";
    html.style.minHeight = "100%";
    body.style.minHeight = "100%";
    return () => {
      html.style.background = prevHtmlBg;
      body.style.background = prevBodyBg;
      html.style.minHeight = prevHtmlMinH;
      body.style.minHeight = prevBodyMinH;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const err = await login(email, password);
      if (err) {
        setError(err);
      } else {
        navigate("/dashboard");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPassword: string) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setError("");
    setSubmitting(true);
    try {
      const err = await login(quickEmail, quickPassword);
      if (err) {
        setError(err);
      } else {
        navigate("/dashboard");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex min-h-[100dvh] min-h-screen w-full flex-1"
      style={{ background: "#152030" }}
    >
      {/* LEFT SIDE — Dark navy theme */}
      <div
        className="flex min-h-[100dvh] min-h-screen flex-1 flex-col justify-center"
        style={{ background: "#1a2a3a", padding: "60px 70px" }}
      >
        <div className="mb-8">
          <LoginLogo />
        </div>

        <h1 className="mb-6 text-[22px] font-normal text-white/90">Login</h1>

        {error && (
          <div className="mb-4 max-w-[420px] rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5 max-w-[420px]">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">
              Email<span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-full border bg-white/5 px-5 text-sm text-white placeholder:text-white/30 outline-none transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
              onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">
              Password<span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-full border bg-white/5 px-5 pr-12 text-sm text-white placeholder:text-white/30 outline-none transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.15)" }}
                onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-white/70">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 accent-[#2563EB]"
              />
              Remember me
            </label>
            <button type="button" className="text-sm font-medium hover:underline" style={{ color: "#2563EB" }}>
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-full text-sm font-bold text-white uppercase transition-colors disabled:opacity-60"
            style={{ backgroundColor: "#2563EB", letterSpacing: "1.5px" }}
            onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = "#1d4ed8")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
          >
            {submitting ? "Signing in…" : "LOGIN"}
          </button>

          {LOGIN_QUICK_ACCOUNTS.length > 0 && (
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-xs text-white/45">Quick sign-in</span>
              <div className="flex flex-wrap gap-2">
                {LOGIN_QUICK_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.key}
                    type="button"
                    disabled={submitting}
                    onClick={() => handleQuickLogin(acc.email, acc.password)}
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white/85 transition-colors hover:bg-white/10 disabled:opacity-60"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        <p className="mt-10 text-xs text-center max-w-[420px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          © All Rights Reserved, AI-PRIORI 2026
        </p>
      </div>

      {/* RIGHT SIDE — Matching dark theme */}
      <div
        className="hidden min-h-[100dvh] min-h-screen md:flex w-1/2 flex-col items-center justify-center"
        style={{ background: "#152030", padding: "36px 40px" }}
      >
        <h2
          className="mb-6 text-center text-[22px] font-bold uppercase"
          style={{ color: "#2563EB", letterSpacing: "1px" }}
        >
          WELCOME TO DATONIX
        </h2>
        <p className="mb-6 text-center text-sm max-w-md" style={{ color: "rgba(255,255,255,0.5)" }}>
          Decision Intelligence Platform — Role-first analytics for AEC, Manufacturing & Retail
        </p>
        <img
          src={factoryImg}
          alt="Factory worker with AR panels"
          className="w-full max-w-[520px] rounded-[14px] object-cover"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        />
      </div>
    </div>
  );
}

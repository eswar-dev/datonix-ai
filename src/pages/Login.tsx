import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import factoryImg from "@/assets/factory-worker.jpg";
import logoSrc from "@/assets/datapx1-logo.png";

function LoginLogo() {
  return (
    <div className="flex items-center gap-3">
      <img src={logoSrc} alt="Datapx1" width={64} height={64} className="object-contain" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }} />
      <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: "#aaccdd", lineHeight: 1.4 }}>
        Asset Optimization &<br />Decision Intelligence
      </p>
    </div>
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = login(email, password);
    if (err) {
      setError(err);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen h-screen w-full" style={{ background: "#152030" }}>
      {/* LEFT SIDE — Dark navy theme */}
      <div
        className="flex flex-1 flex-col justify-center"
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
            className="h-11 w-full rounded-full text-sm font-bold text-white uppercase transition-colors"
            style={{ backgroundColor: "#2563EB", letterSpacing: "1.5px" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
          >
            LOGIN
          </button>
        </form>

        <p className="mt-10 text-xs text-center max-w-[420px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          © All Rights Reserved, Datapx1 2026
        </p>
      </div>

      {/* RIGHT SIDE — Matching dark theme */}
      <div
        className="hidden md:flex w-1/2 flex-col items-center justify-center"
        style={{ background: "#152030", padding: "36px 40px" }}
      >
        <h2
          className="mb-6 text-center text-[22px] font-bold uppercase"
          style={{ color: "#2563EB", letterSpacing: "1px" }}
        >
          WELCOME TO DATAPX1
        </h2>
        <p className="mb-6 text-center text-sm max-w-md" style={{ color: "rgba(255,255,255,0.5)" }}>
          Industrial Decision Intelligence — unify ERP, machine telemetry & operations into actionable insight
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

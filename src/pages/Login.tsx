import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import factoryImg from "@/assets/factory-worker.jpg";

function LoginLogo() {
  return (
    <svg viewBox="0 0 260 60" width="260" height="60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 12 H38 a14 14 0 0 1 14 14 v8 a14 14 0 0 1 -14 14 H10 Z" fill="none" stroke="#1AABEC" strokeWidth="3" />
      <circle cx="22" cy="30" r="3" fill="#1AABEC" />
      <circle cx="34" cy="20" r="3" fill="#1AABEC" />
      <circle cx="34" cy="40" r="3" fill="#1AABEC" />
      <circle cx="44" cy="30" r="3" fill="#1AABEC" />
      <line x1="22" y1="30" x2="34" y2="20" stroke="#1AABEC" strokeWidth="1.5" opacity="0.6" />
      <line x1="22" y1="30" x2="34" y2="40" stroke="#1AABEC" strokeWidth="1.5" opacity="0.6" />
      <line x1="34" y1="20" x2="44" y2="30" stroke="#1AABEC" strokeWidth="1.5" opacity="0.6" />
      <line x1="34" y1="40" x2="44" y2="30" stroke="#1AABEC" strokeWidth="1.5" opacity="0.6" />
      <text x="68" y="38" fontFamily="'Sora', 'Arial Black', sans-serif" fontWeight="900" fontSize="30" fill="#1AABEC" letterSpacing="-1">Datapx</text>
      <text x="196" y="38" fontFamily="'Sora', 'Arial Black', sans-serif" fontWeight="900" fontSize="30" fill="#FF8A3D" letterSpacing="-1">1</text>
      <text x="68" y="52" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="6" fill="#6a9ab8" letterSpacing="1.4">INDUSTRIAL DECISION INTELLIGENCE</text>
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
    <div className="flex min-h-screen" style={{ minHeight: 600, background: "#152030" }}>
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

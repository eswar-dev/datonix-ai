import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
      <text x="78" y="44" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="5.5" fill="#888" letterSpacing="0.7">AI THAT MAKES DECISIONS ACTIONABLE</text>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen" style={{ minHeight: 600 }}>
      {/* LEFT SIDE */}
      <div className="flex flex-1 flex-col justify-center bg-white" style={{ padding: "60px 70px" }}>
        <div className="mb-8">
          <LoginLogo />
        </div>

        <h1 className="mb-6 text-[22px] font-normal" style={{ color: "#222" }}>Login</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-5 max-w-[420px]">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "#222" }}>
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-full border px-5 text-sm outline-none transition-colors"
              style={{ borderColor: "#d0d0d0" }}
              onFocus={(e) => (e.target.style.borderColor = "#0099FF")}
              onBlur={(e) => (e.target.style.borderColor = "#d0d0d0")}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "#222" }}>
              Password<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-full border px-5 pr-12 text-sm outline-none transition-colors"
                style={{ borderColor: "#d0d0d0" }}
                onFocus={(e) => (e.target.style.borderColor = "#0099FF")}
                onBlur={(e) => (e.target.style.borderColor = "#d0d0d0")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "#222" }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-[#3d7a5e]"
              />
              Remember me
            </label>
            <button type="button" className="text-sm font-medium hover:underline" style={{ color: "#0099FF" }}>
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="h-11 w-full rounded-full text-sm font-bold text-white uppercase transition-colors"
            style={{ backgroundColor: "#3d7a5e", letterSpacing: "1.5px" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2e5e47")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3d7a5e")}
          >
            LOGIN
          </button>
        </form>

        {/* Footer */}
        <p className="mt-10 text-xs text-center max-w-[420px]" style={{ color: "#999" }}>
          © All Rights Reserved, AI-PRIORI 2026
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="flex w-1/2 flex-col items-center"
        style={{ backgroundColor: "#fdfde8", padding: "36px 40px" }}
      >
        <h2
          className="mb-6 text-center text-[22px] font-bold uppercase"
          style={{ color: "#2e7d32", letterSpacing: "1px" }}
        >
          WELCOME TO DATONIX
        </h2>
        <img
          src={factoryImg}
          alt="Factory worker with AR panels"
          className="w-full max-w-[520px] rounded-[14px] object-cover"
        />
      </div>
    </div>
  );
}

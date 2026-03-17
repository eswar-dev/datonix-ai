import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

/* ── Brand Logo ── */
function LoginLogo() {
  return (
    <svg viewBox="0 0 200 44" width="180" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,22 31,6 53,6 64,22 53,38 31,38" stroke="#89D8F8" strokeWidth="2.5" fill="none" />
      <circle cx="42" cy="22" r="5.5" fill="#0099FF" />
      <circle cx="54" cy="19" r="4.2" fill="#0099FF" />
      <circle cx="42" cy="12" r="4" fill="#0099FF" />
      <circle cx="30" cy="19" r="3.6" fill="#0099FF" />
      <circle cx="42" cy="31" r="3.6" fill="#0099FF" />
      <circle cx="53" cy="29" r="2.2" fill="#0099FF" />
      <circle cx="31" cy="13" r="1.6" fill="#0099FF" />
      <text x="72" y="28" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="20" fill="#0099FF">Datonix</text>
      <text x="72" y="38" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="4.2" fill="#888" letterSpacing="0.7">AI THAT MAKES DECISIONS ACTIONABLE</text>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f4f2]">
      <div className="w-[440px] rounded-2xl bg-[#f5f4f2] px-10 pb-7 pt-9">
        {/* Logo */}
        <div className="mb-5">
          <LoginLogo />
        </div>

        {/* Headings */}
        <h1 className="text-[28px] font-extrabold text-foreground leading-tight">Start Building.</h1>
        <p className="mb-6 text-[22px] font-bold text-muted-foreground/50">Log in to your account</p>

        {/* Google */}
        <div className="relative mb-2.5">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-[#0099FF] bg-white py-3 text-sm font-semibold text-foreground hover:bg-blue-50/50 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <span className="absolute -top-2 right-3 rounded-full border border-[#c7d2fe] bg-[#eef2ff] px-2.5 py-0.5 text-[10px] font-semibold text-[#4f6ef7]">
            Last used
          </span>
        </div>

        {/* GitHub */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-5 flex w-full items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-border bg-white py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
        >
          <GitHubIcon />
          Continue with GitHub
        </button>

        {/* OR */}
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] tracking-widest text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Email */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-5 w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
        >
          Continue with email
        </button>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>SSO available on</span>
          <span className="cursor-pointer text-foreground underline">Business and Enterprise</span>
          <span>plans</span>
        </div>
      </div>
    </div>
  );
}

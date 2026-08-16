import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/common/contexts/ThemeContext";
import { cn } from "@/common/lib/utils";

export function ThemeToggle({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "shell";
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors",
        variant === "shell"
          ? "border-[color:var(--shell-input-border)] bg-[color:var(--shell-input-bg)] text-[color:var(--shell-text)] hover:border-[color:var(--shell-brand)]"
          : isDark
            ? "border-[color:var(--page-border)] bg-[color:var(--page-card)] text-[color:var(--page-text)] hover:border-[color:var(--page-accent)]"
            : "border-border bg-card text-foreground hover:border-accent",
        className,
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
    >
      {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, Search, Settings } from "lucide-react";
import { useAuth } from "@/common/contexts/AuthContext";
import { useDomain } from "@/common/contexts/DomainContext";
import { DatonixLogo } from "@/common/components/DatonixLogo";
import { ThemeToggle } from "@/common/components/ThemeToggle";
import { AecTwinSelector } from "@/domains/aec/components/AecTwinSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";

export function AecTopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const domain = useDomain();
  const [searchOpen, setSearchOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith("/admin");

  const onKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onKey]);

  return (
    <>
      <header className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-[color:var(--shell-sidebar-border)] bg-[color:var(--shell-topbar)] px-4">
        <Link to={isAdminRoute ? "/admin" : "/enterprise-twin"} className="mr-1 shrink-0">
          <DatonixLogo tagline={`${domain.label} Enterprise Ops`} size="sm" />
        </Link>

        {!isAdminRoute && <AecTwinSelector />}

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden h-8 max-w-[420px] flex-1 items-center gap-2 rounded-md border border-[color:var(--shell-input-border)] bg-[color:var(--shell-input-bg)] px-3 py-0 sm:flex"
        >
          <Search className="h-3.5 w-3.5 text-[color:var(--shell-muted)]" />
          <span className="flex-1 text-left text-[12.5px] text-[color:var(--shell-muted)]">
            Search projects, resources, rate cards, invoices…
          </span>
          <span className="font-mono text-[9.5px] text-[color:var(--shell-muted)]">⌘K</span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded border border-[color:var(--shell-brand)]/25 bg-[color:var(--shell-brand)]/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[color:var(--shell-brand-muted)] sm:inline">
            SOR + INTELLIGENCE
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#28C76F]/20 bg-[#28C76F]/10 px-2 py-0.5 text-[10px] font-semibold text-[#28C76F]">
            <span className="aec-pulse h-1.5 w-1.5 rounded-full bg-[#28C76F]" />
            Live
          </span>
          <ThemeToggle variant="shell" />
          <button
            type="button"
            className="relative flex h-[30px] w-[30px] items-center justify-center rounded-md border border-[color:var(--shell-input-border)] bg-[color:var(--shell-input-bg)] text-[color:var(--shell-muted)]"
            aria-label="Notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[color:var(--shell-brand)] text-[8px] font-bold text-white">
              5
            </span>
          </button>
          <Link
            to="/admin"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-[color:var(--shell-input-border)] bg-[color:var(--shell-input-bg)] text-[color:var(--shell-muted)] hover:border-[color:var(--shell-brand)]"
            aria-label="Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </Link>
          <div className="hidden text-right sm:block">
            <div className="text-[11.5px] font-semibold text-[color:var(--shell-text)]">
              {user?.name}
            </div>
            <div className="text-[10px] text-[color:var(--shell-muted)]">{user?.title}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-[29px] w-[29px] items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--shell-brand)] to-[color:var(--shell-brand-muted)] text-[10px] font-bold text-white"
              >
                {user?.initials ?? "?"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Search Datonix</DialogTitle>
          </DialogHeader>
          <Input placeholder="Type to search…" autoFocus />
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Search, Bell, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/data-ingestion": "Data Ingestion",
  "/data-processing": "Data Processing",
  "/bot": "Datapx1 AI",
  "/data-quality": "Data Quality",
  "/data-modelling": "Data Modelling",
  "/admin": "Administration",
};

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const breadcrumbParts = location.pathname.split("/").filter(Boolean);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-6">
        <div className="flex items-center gap-3">
          {user && (
            <Badge variant="secondary" className="text-[11px]">
              {user.title}
            </Badge>
          )}

          <Button variant="outline" size="sm" className="hidden gap-2 text-muted-foreground sm:flex" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" />
            <span className="text-xs">Search…</span>
            <kbd className="ml-4 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">⌘K</kbd>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#2a4a6a" }}>
                  {user?.initials || "?"}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex h-9 items-center gap-1 border-b bg-card px-6 text-xs text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground transition-colors">Home</Link>
        {breadcrumbParts.map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            <span className={i === breadcrumbParts.length - 1 ? "text-foreground font-medium" : ""}>
              {routeNames["/" + breadcrumbParts.slice(0, i + 1).join("/")] || part.replace(/-/g, " ")}
            </span>
          </span>
        ))}
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Search Datapx1</DialogTitle></DialogHeader>
          <Input placeholder="Type to search machines, datasets, reports…" autoFocus />
          <div className="py-8 text-center text-sm text-muted-foreground">Start typing to search across the platform</div>
        </DialogContent>
      </Dialog>
    </>
  );
}

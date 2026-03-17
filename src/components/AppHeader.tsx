import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { Search, Bell, ChevronRight } from "lucide-react";
import profileAvatar from "@/assets/profile-avatar.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/data-sources": "Data Sources",
  "/bot": "Datonix Bot",
  "/reports": "Reports",
  "/decision-intelligence": "Decision Intelligence",
  "/admin": "Administration",
};

export function AppHeader() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const currentRoute = routeNames[location.pathname] || "Home";
  const breadcrumbParts = location.pathname.split("/").filter(Boolean);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-6">
        {/* Left: spacer for logo area */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 text-muted-foreground sm:flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">Search…</span>
            <kbd className="ml-4 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
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
                <img src={profileAvatar} alt="John Doe" className="h-8 w-8 rounded-full object-cover" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="flex h-9 items-center gap-1 border-b bg-card px-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        {breadcrumbParts.map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            <span className={i === breadcrumbParts.length - 1 ? "text-foreground font-medium" : ""}>
              {routeNames["/" + breadcrumbParts.slice(0, i + 1).join("/")] || part.replace(/-/g, " ")}
            </span>
          </span>
        ))}
      </div>

      {/* Search dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Search Datonix</DialogTitle>
          </DialogHeader>
          <Input placeholder="Type to search datasets, reports, actions…" autoFocus />
          <div className="py-8 text-center text-sm text-muted-foreground">
            Start typing to search across the platform
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

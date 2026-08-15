import { useState, useEffect, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Search, Bell, ChevronRight, Eye, Users } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/common/components/ui/dialog";
import { useAuth } from "@/common/contexts/AuthContext";
import { useDomain } from "@/common/contexts/DomainContext";
import { useViewMode } from "@/common/contexts/ViewModeContext";
import { AecTwinSelector } from "@/domains/aec/components/AecTwinSelector";

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/data-sources": "Data Sources",
  "/bot": "Datonix Bot",
  "/reports": "Reports",
  "/decision-intelligence": "Decision Intelligence",
  "/admin": "Administration",
  "/enterprise-twin": "Enterprise Twin",
  "/multi-twin": "Multi-Twin Manager",
  "/data-ingestion": "Data Ingestion",
  "/data-ingestion/add": "Add Datasource",
  "/customer-inquiries": "Customer Inquiries",
  "/projects": "Project Portfolio",
  "/projects/create": "Create Project",
  "/projects/wbs": "WBS Builder",
  "/projects/profitability": "Project Profitability",
  "/org-chart": "Organization Chart",
  "/resources/add": "Add Resource",
  "/resources/planning": "Resource Planning",
  "/resources/skills": "Skills Matrix",
  "/resources/rate-cards": "Rate Cards",
  "/resources/shared-allocation": "Shared Allocation",
  "/timesheets": "Timesheets",
  "/timesheets/submit": "Submit Timesheet",
  "/expenses/submit": "Submit Expense",
  "/expenses/approvals": "Expense Approvals",
  "/leave": "Leave & Downtime",
  "/accounting": "Accounting",
  "/accounting/create-invoice": "Create Invoice",
  "/currency": "Currency Intelligence",
  "/dashboard/executive": "Executive Dashboard",
  "/ai-agents": "AI Agent Governance",
};

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const domain = useDomain();
  const { viewMode, setViewMode } = useViewMode();
  const isAec = domain.id === "aec";
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

  const isManager = user?.isManager === true;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-6">
        <div className="flex items-center gap-3">
          {user && (
            <Badge variant="secondary" className="text-[11px]">
              {user.industry} • {user.title}
            </Badge>
          )}

          {/* View Mode Toggle — only for managers */}
          {isManager && (
            <div className="flex rounded-lg border bg-muted/50 p-0.5">
              <button
                onClick={() => setViewMode("individual")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "individual"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                My View
              </button>
              <button
                onClick={() => setViewMode("admin")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "admin"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Team View
              </button>
            </div>
          )}

          {isAec && <AecTwinSelector />}

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
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        {breadcrumbParts.map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            <span className={i === breadcrumbParts.length - 1 ? "text-foreground font-medium" : ""}>
              {routeNames["/" + breadcrumbParts.slice(0, i + 1).join("/")] || part.replace(/-/g, " ")}
            </span>
          </span>
        ))}
        {isManager && viewMode === "admin" && (
          <Badge variant="outline" className="ml-2 text-[10px] bg-accent/10 text-accent border-accent/20">
            Team View
          </Badge>
        )}
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Search Datonix</DialogTitle></DialogHeader>
          <Input placeholder="Type to search datasets, reports, actions…" autoFocus />
          <div className="py-8 text-center text-sm text-muted-foreground">Start typing to search across the platform</div>
        </DialogContent>
      </Dialog>
    </>
  );
}

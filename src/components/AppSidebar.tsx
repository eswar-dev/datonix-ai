import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Database,
  LayoutDashboard,
  Bot,
  FileText,
  Brain,
  Shield,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Building2,
  Users,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import profileAvatar from "@/assets/profile-avatar.png";

const mainNavItems = [
  { title: "Data Sources", path: "/data-sources", icon: Database },
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Datonix AI", path: "/bot", icon: Bot },
  { title: "Reports", path: "/reports", icon: FileText },
  { title: "Decision Intelligence", path: "/decision-intelligence", icon: Brain },
  { title: "Administration", path: "/admin", icon: Shield },
];

const adminNavItems = [
  { title: "Tenants", path: "/admin/tenants", icon: Building2 },
  { title: "Organizations", path: "/admin/organizations", icon: Building2 },
  { title: "User Roles", path: "/admin/user-roles", icon: ShieldCheck },
  { title: "Users", path: "/admin/users", icon: Users },
  { title: "User Sessions", path: "/admin/user-sessions", icon: Clock },
];

function HexagonLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        <svg
          width={collapsed ? 36 : 40}
          height={collapsed ? 36 : 40}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hexagon outline */}
          <path
            d="M24 2L44 14V34L24 46L4 34V14L24 2Z"
            stroke="url(#hexGrad)"
            strokeWidth="2"
            fill="rgba(0,210,211,0.08)"
          />
          {/* Network nodes */}
          <circle cx="24" cy="14" r="3" fill="url(#nodeGrad)" />
          <circle cx="14" cy="28" r="3" fill="url(#nodeGrad)" />
          <circle cx="34" cy="28" r="3" fill="url(#nodeGrad)" />
          <circle cx="24" cy="36" r="2.5" fill="url(#nodeGrad)" opacity="0.7" />
          <circle cx="24" cy="24" r="4" fill="url(#nodeGrad)" />
          {/* Connecting lines */}
          <line x1="24" y1="14" x2="24" y2="24" stroke="hsl(180,80%,50%)" strokeWidth="1.2" opacity="0.6" />
          <line x1="14" y1="28" x2="24" y2="24" stroke="hsl(180,80%,50%)" strokeWidth="1.2" opacity="0.6" />
          <line x1="34" y1="28" x2="24" y2="24" stroke="hsl(180,80%,50%)" strokeWidth="1.2" opacity="0.6" />
          <line x1="24" y1="24" x2="24" y2="36" stroke="hsl(180,80%,50%)" strokeWidth="1.2" opacity="0.4" />
          <line x1="24" y1="14" x2="14" y2="28" stroke="hsl(180,80%,50%)" strokeWidth="0.8" opacity="0.3" />
          <line x1="24" y1="14" x2="34" y2="28" stroke="hsl(180,80%,50%)" strokeWidth="0.8" opacity="0.3" />
          <defs>
            <linearGradient id="hexGrad" x1="4" y1="2" x2="44" y2="46">
              <stop offset="0%" stopColor="hsl(180,80%,50%)" />
              <stop offset="100%" stopColor="hsl(200,80%,45%)" />
            </linearGradient>
            <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(180,90%,65%)" />
              <stop offset="100%" stopColor="hsl(180,80%,50%)" />
            </radialGradient>
          </defs>
        </svg>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full blur-md opacity-20 bg-[hsl(180,80%,50%)]" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <h1 className="font-sora text-base font-bold tracking-tight text-white leading-tight">
            Datonix
          </h1>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-sidebar-cyan">
            AI-Driven Decisions
          </p>
        </div>
      )}
    </div>
  );
}

export function AppSidebar() {
  const { collapsed, toggle } = useSidebarState();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const navItems = isAdminRoute ? adminNavItems : mainNavItems;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar-deep text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar-expanded"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-white/[0.06]",
        collapsed ? "justify-center px-2" : "px-4"
      )}>
        <HexagonLogo collapsed={collapsed} />
      </div>

      {/* User Profile */}
      <div className={cn(
        "border-b border-white/[0.06] px-3 py-3",
        collapsed ? "flex justify-center" : "flex items-center gap-3"
      )}>
        <div className="relative h-9 w-9 shrink-0">
          <img
            src={profileAvatar}
            alt="John Doe"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-sidebar-cyan/30"
          />
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar-deep bg-emerald-400" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">John Doe</p>
            <p className="text-[10px] text-sidebar-cyan/70 truncate">Sales Manager</p>
          </div>
        )}
      </div>

      {/* Back button for admin */}
      {isAdminRoute && (
        <div className="px-2 pt-3 pb-1">
          <button
            onClick={() => navigate("/dashboard")}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full",
              "text-white/50 hover:bg-white/[0.06] hover:text-white"
            )}
            title="Back to Home"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Back to Home</span>}
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-2 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const active = isAdminRoute
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.title}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-white/[0.08] text-white shadow-[inset_3px_0_0_0_hsl(180,80%,50%)]"
                  : "text-white/60 hover:bg-white/[0.05] hover:text-white/90"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-sidebar-cyan" : "text-white/40 group-hover:text-white/70"
                )}
              />
              {!collapsed && <span>{item.title}</span>}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-sidebar-cyan shadow-[0_0_8px_hsl(180,80%,50%,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={toggle}
        className="flex h-10 items-center justify-center border-t border-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}

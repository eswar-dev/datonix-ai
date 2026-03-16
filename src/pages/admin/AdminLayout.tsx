import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft, Building2, Users, ShieldCheck, UserCog, Clock } from "lucide-react";

const adminNav = [
  { title: "Tenants", path: "/admin/tenants", icon: Building2 },
  { title: "Organizations", path: "/admin/organizations", icon: Building2 },
  { title: "User Roles", path: "/admin/user-roles", icon: ShieldCheck },
  { title: "Users", path: "/admin/users", icon: Users },
  { title: "User Sessions", path: "/admin/user-sessions", icon: Clock },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-full -m-6">
      {/* Admin sub-sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-card">
        <div className="p-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-button px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors w-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>

        <nav className="space-y-0.5 px-2 pb-4">
          {adminNav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4.5 w-4.5 shrink-0", active ? "text-accent" : "")} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Admin content */}
      <div className="flex-1 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

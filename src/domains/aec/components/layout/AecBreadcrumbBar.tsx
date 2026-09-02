import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const routeNames: Record<string, string> = {
  "/enterprise-twin": "Enterprise Twin",
  "/compliance": "Compliance Layer",
  "/multi-twin": "Multi-Twin Manager",
  "/data-ingestion": "Data Ingestion",
  "/data-ingestion/add": "Add Datasource",
  "/customer-inquiries": "Customer Inquiries",
  "/projects": "Project Lifecycle",
  "/projects/create": "Create Project",
  "/projects/wbs": "WBS Builder",
  "/projects/profitability": "Profitability",
  "/resources/shared-allocation": "Resource Management",
  "/resources/planning": "Resources",
  "/resources/add": "Add Resource",
  "/resources/skills": "Skills Matrix",
  "/org-chart": "Organization Chart",
  "/resources/rate-cards": "Rate Cards",
  "/leave": "Leave & Downtime",
  "/timesheets": "Timesheets",
  "/timesheets/submit": "Submit Timesheet",
  "/expenses/submit": "Submit Expense",
  "/expenses/approvals": "Expense Approvals",
  "/payroll": "Payroll Analytics",
  "/accounting": "Accounting",
  "/accounting/create-invoice": "Create Invoice",
  "/currency": "Currency Intelligence",
  "/dashboard/executive": "Executive Dashboard",
  "/dashboard": "My Dashboard",
  "/reports": "Reports",
  "/ai-agents": "Decision Intelligence",
  "/admin": "Administration",
  "/admin/tenants": "Tenants",
  "/admin/organizations": "Organizations",
  "/admin/user-roles": "User Roles",
  "/admin/users": "Users",
  "/admin/user-sessions": "User Sessions",
};

export function AecBreadcrumbBar() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  return (
    <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-[color:var(--page-breadcrumb-border)] bg-[color:var(--page-breadcrumb-bg)] px-5 text-[11px] text-[color:var(--page-muted)]">
      <Link to="/enterprise-twin" className="hover:text-[color:var(--page-text)]">
        Home
      </Link>
      {parts.map((_, i) => {
        const path = "/" + parts.slice(0, i + 1).join("/");
        const label = routeNames[path] ?? parts[i].replace(/-/g, " ");
        const isLast = i === parts.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-[color:var(--page-dim)]" />
            {isLast ? (
              <span className="font-medium text-[color:var(--page-text)]">{label}</span>
            ) : (
              <Link to={path} className="hover:text-[color:var(--page-text)]">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}

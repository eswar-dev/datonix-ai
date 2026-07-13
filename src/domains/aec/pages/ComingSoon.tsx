import { Construction } from "lucide-react";
import { Card, CardContent } from "@/common/components/ui/card";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";

const ROUTE_PROMPTS: Record<string, number> = {
  "/customer-inquiries": 2,
  "/projects/create": 2,
  "/projects/wbs": 2,
  "/projects/profitability": 2,
  "/org-chart": 3,
  "/resources/add": 3,
  "/resources/planning": 3,
  "/resources/skills": 3,
  "/resources/rate-cards": 3,
  "/resources/shared-allocation": 3,
  "/timesheets": 3,
  "/timesheets/submit": 3,
  "/expenses/submit": 3,
  "/accounting": 4,
  "/accounting/create-invoice": 4,
  "/currency": 4,
  "/dashboard": 4,
  "/dashboard/executive": 4,
  "/reports": 4,
  "/ai-agents": 4,
};

const ROUTE_TITLES: Record<string, string> = {
  "/customer-inquiries": "Customer Inquiries",
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
  "/accounting": "Accounting",
  "/accounting/create-invoice": "Create Invoice",
  "/currency": "Currency Intelligence",
  "/dashboard": "My Dashboard",
  "/dashboard/executive": "Executive Dashboard",
  "/reports": "Reports",
  "/ai-agents": "AI Agent Governance",
};

interface ComingSoonProps {
  path: string;
}

export default function ComingSoon({ path }: ComingSoonProps) {
  const prompt = ROUTE_PROMPTS[path] ?? 0;
  const title = ROUTE_TITLES[path] ?? "Coming Soon";

  return (
    <div className="space-y-6">
      <AecPageHeader title={title} subtitle="This module is part of the AEC intelligence platform." />
      <Card className="rounded-card">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Construction className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Coming in Prompt {prompt}</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            The {title} screen will be implemented in the next development phase. Continue from
            Enterprise Twin to explore the intelligence foundation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

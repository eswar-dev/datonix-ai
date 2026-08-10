import {
  Bot,
  Clock,
  CreditCard,
  Database,
  FileBarChart,
  GitBranch,
  GitBranchPlus,
  Globe,
  Layers,
  LayoutDashboard,
  LineChart,
  FolderKanban,
  Inbox,
  Network,
  Receipt,
  Shuffle,
  Shield,
  UserPlus,
  Users,
  Award,
  CalendarDays,
  Wallet,
  CalendarOff,
  ListChecks,
  Banknote,
} from "lucide-react";
import type { DomainConfig } from "@/domains/types";
import { aecLoginConfig } from "./login";
import EnterpriseTwin from "./pages/EnterpriseTwin";
import MultiTwinManager from "./pages/MultiTwinManager";
import DataIngestion from "./pages/DataIngestion";
import CustomerInquiries from "./pages/CustomerInquiries";
import CreateProject from "./pages/CreateProject";
import WbsBuilder from "./pages/WbsBuilder";
import ProjectProfitability from "./pages/ProjectProfitability";
import OrgChart from "./pages/OrgChart";
import AddResource from "./pages/AddResource";
import ResourcePlanning from "./pages/ResourcePlanning";
import SkillsMatrix from "./pages/SkillsMatrix";
import RateCards from "./pages/RateCards";
import SharedAllocation from "./pages/SharedAllocation";
import Timesheets from "./pages/Timesheets";
import SubmitTimesheet from "./pages/SubmitTimesheet";
import SubmitExpense from "./pages/SubmitExpense";
import Accounting from "./pages/Accounting";
import CreateInvoice from "./pages/CreateInvoice";
import CurrencyIntelligence from "./pages/CurrencyIntelligence";
import MyDashboard from "./pages/MyDashboard";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import Reports from "./pages/Reports";
import AiAgentGovernance from "./pages/AiAgentGovernance";
import ProjectPortfolio from "./pages/ProjectPortfolio";
import ExpenseApprovals from "./pages/ExpenseApprovals";
import LeaveManagement from "./pages/LeaveManagement";
import PayrollAnalytics from "./pages/PayrollAnalytics";

export const aecConfig: DomainConfig = {
  id: "aec",
  label: "AEC",
  tagline: "AEC INTELLIGENCE",
  defaultRoute: "/enterprise-twin",
  login: aecLoginConfig,
  nav: [
    {
      title: "Enterprise Twin",
      path: "/enterprise-twin",
      icon: Layers,
      group: "Intelligence",
    },
    {
      title: "Multi-Twin Manager",
      path: "/multi-twin",
      icon: GitBranchPlus,
      group: "Intelligence",
    },
    {
      title: "Data Ingestion",
      path: "/data-ingestion",
      icon: Database,
      group: "Intelligence",
    },
    {
      title: "Customer Inquiries",
      path: "/customer-inquiries",
      icon: Inbox,
      group: "Pipeline",
    },
    {
      title: "Project Portfolio",
      path: "/projects",
      icon: ListChecks,
      group: "Pipeline",
    },
    {
      title: "Create Project",
      path: "/projects/create",
      icon: FolderKanban,
      group: "Pipeline",
    },
    {
      title: "WBS Builder",
      path: "/projects/wbs",
      icon: GitBranch,
      group: "Pipeline",
    },
    {
      title: "Project Profitability",
      path: "/projects/profitability",
      icon: LineChart,
      group: "Pipeline",
    },
    {
      title: "Organization Chart",
      path: "/org-chart",
      icon: Network,
      group: "Resources",
    },
    {
      title: "Add Resource",
      path: "/resources/add",
      icon: UserPlus,
      group: "Resources",
    },
    {
      title: "Resource Planning",
      path: "/resources/planning",
      icon: Users,
      group: "Resources",
    },
    {
      title: "Skills Matrix",
      path: "/resources/skills",
      icon: Award,
      group: "Resources",
    },
    {
      title: "Rate Cards",
      path: "/resources/rate-cards",
      icon: CreditCard,
      group: "Resources",
    },
    {
      title: "Leave & Downtime",
      path: "/leave",
      icon: CalendarOff,
      group: "Resources",
    },
    {
      title: "Shared Allocation",
      path: "/resources/shared-allocation",
      icon: Shuffle,
      group: "Resources",
    },
    {
      title: "Timesheets",
      path: "/timesheets",
      icon: Clock,
      group: "Timesheets",
    },
    {
      title: "Submit Timesheet",
      path: "/timesheets/submit",
      icon: CalendarDays,
      group: "Timesheets",
    },
    {
      title: "Submit Expense",
      path: "/expenses/submit",
      icon: Receipt,
      group: "Timesheets",
    },
    {
      title: "Expense Approvals",
      path: "/expenses/approvals",
      icon: Receipt,
      group: "Timesheets",
    },
    {
      title: "Accounting",
      path: "/accounting",
      icon: Wallet,
      group: "Accounting",
    },
    {
      title: "Create Invoice",
      path: "/accounting/create-invoice",
      icon: Receipt,
      group: "Accounting",
    },
    {
      title: "Payroll Analytics",
      path: "/payroll",
      icon: Banknote,
      group: "Accounting",
    },
    {
      title: "Currency Intelligence",
      path: "/currency",
      icon: Globe,
      group: "Accounting",
    },
    {
      title: "My Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      group: "Dashboards & Reports",
    },
    {
      title: "Executive Dashboard",
      path: "/dashboard/executive",
      icon: LineChart,
      group: "Dashboards & Reports",
    },
    {
      title: "Reports",
      path: "/reports",
      icon: FileBarChart,
      group: "Dashboards & Reports",
    },
    {
      title: "AI Agent Governance",
      path: "/ai-agents",
      icon: Bot,
      group: "AI Agents",
    },
    {
      title: "Administration",
      path: "/admin",
      icon: Shield,
    },
  ],
  routes: [
    { path: "/enterprise-twin", Component: EnterpriseTwin },
    { path: "/multi-twin", Component: MultiTwinManager },
    { path: "/data-ingestion", Component: DataIngestion },
    { path: "/customer-inquiries", Component: CustomerInquiries },
    { path: "/projects", Component: ProjectPortfolio },
    { path: "/projects/create", Component: CreateProject },
    { path: "/projects/wbs", Component: WbsBuilder },
    { path: "/projects/profitability", Component: ProjectProfitability },
    { path: "/org-chart", Component: OrgChart },
    { path: "/resources/add", Component: AddResource },
    { path: "/resources/planning", Component: ResourcePlanning },
    { path: "/resources/skills", Component: SkillsMatrix },
    { path: "/resources/rate-cards", Component: RateCards },
    { path: "/resources/shared-allocation", Component: SharedAllocation },
    { path: "/timesheets", Component: Timesheets },
    { path: "/timesheets/submit", Component: SubmitTimesheet },
    { path: "/expenses/submit", Component: SubmitExpense },
    { path: "/expenses/approvals", Component: ExpenseApprovals },
    { path: "/leave", Component: LeaveManagement },
    { path: "/accounting", Component: Accounting },
    { path: "/accounting/create-invoice", Component: CreateInvoice },
    { path: "/payroll", Component: PayrollAnalytics },
    { path: "/currency", Component: CurrencyIntelligence },
    { path: "/dashboard", Component: MyDashboard },
    { path: "/dashboard/executive", Component: ExecutiveDashboard },
    { path: "/reports", Component: Reports },
    { path: "/ai-agents", Component: AiAgentGovernance },
  ],
};

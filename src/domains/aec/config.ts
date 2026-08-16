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
  Plus,
  CircleDot,
} from "lucide-react";
import type { DomainConfig } from "@/domains/types";
import { aecLoginConfig } from "./login";
import EnterpriseTwin from "./pages/EnterpriseTwin";
import MultiTwinManager from "./pages/MultiTwinManager";
import DataIngestion from "./pages/DataIngestion";
import AddDatasource from "./pages/AddDatasource";
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
      badgeType: "live",
      badge: "Live",
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
      title: "Add Datasource",
      path: "/data-ingestion/add",
      icon: Plus,
      group: "Intelligence",
      nested: true,
      parentPath: "/data-ingestion",
    },
    {
      title: "Customer Inquiries",
      path: "/customer-inquiries",
      icon: Inbox,
      group: "Pipeline",
    },
    {
      title: "Project Lifecycle",
      path: "/projects",
      icon: ListChecks,
      group: "Pipeline",
    },
    {
      title: "Create Project",
      path: "/projects/create",
      icon: FolderKanban,
      group: "Pipeline",
      nested: true,
      parentPath: "/projects",
    },
    {
      title: "WBS Builder",
      path: "/projects/wbs",
      icon: GitBranch,
      group: "Pipeline",
      nested: true,
      parentPath: "/projects",
    },
    {
      title: "Profitability",
      path: "/projects/profitability",
      icon: LineChart,
      group: "Pipeline",
      nested: true,
      parentPath: "/projects",
    },
    {
      title: "Resources",
      path: "/resources/planning",
      icon: CircleDot,
      group: "Resource Planning",
    },
    {
      title: "Add Resource",
      path: "/resources/add",
      icon: Plus,
      group: "Resource Planning",
      nested: true,
      parentPath: "/resources/planning",
    },
    {
      title: "Skills Matrix",
      path: "/resources/skills",
      icon: Award,
      group: "Resource Planning",
    },
    {
      title: "Organization Chart",
      path: "/org-chart",
      icon: Network,
      group: "Resource Planning",
    },
    {
      title: "Rate Cards",
      path: "/resources/rate-cards",
      icon: CreditCard,
      group: "Resource Planning",
    },
    {
      title: "Shared Allocation",
      path: "/resources/shared-allocation",
      icon: Shuffle,
      group: "Resource Planning",
    },
    {
      title: "Leave & Downtime",
      path: "/leave",
      icon: CalendarOff,
      group: "Resource Planning",
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
      nested: true,
      parentPath: "/timesheets",
    },
    {
      title: "Submit Expense",
      path: "/expenses/submit",
      icon: Receipt,
      group: "Timesheets",
      nested: true,
      parentPath: "/timesheets",
    },
    {
      title: "Payroll Analytics",
      path: "/payroll",
      icon: Banknote,
      group: "Payroll Analytics",
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
      icon: Plus,
      group: "Accounting",
      nested: true,
      parentPath: "/accounting",
    },
    {
      title: "Currency Intelligence",
      path: "/currency",
      icon: Globe,
      group: "Accounting",
    },
    {
      title: "Executive Dashboard",
      path: "/dashboard/executive",
      icon: LayoutDashboard,
      group: "Dashboards & Reports",
    },
    {
      title: "My Dashboard",
      path: "/dashboard",
      icon: Users,
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
    { path: "/data-ingestion/add", Component: AddDatasource },
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

import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/common/components/ProtectedRoute";
import { AppLayout } from "@/common/components/AppLayout";
import { useDomain } from "@/common/contexts/DomainContext";
import Admin from "@/common/pages/Admin";
import AdminLayout from "@/common/pages/admin/AdminLayout";
import Tenants from "@/common/pages/admin/Tenants";
import Organizations from "@/common/pages/admin/Organizations";
import UserRoles from "@/common/pages/admin/UserRoles";
import Users from "@/common/pages/admin/Users";
import UserSessions from "@/common/pages/admin/UserSessions";
import NotFound from "@/common/pages/NotFound";
import DatonixDemo from "@/domains/manufacturing/pages/DatonixDemo";
import Login from "@/common/pages/Login";

export function AppRoutes() {
  const domain = useDomain();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/demo" element={<DatonixDemo />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to={domain.defaultRoute ?? "/dashboard"} replace />} />
          {domain.routes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Admin />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="user-roles" element={<UserRoles />} />
            <Route path="users" element={<Users />} />
            <Route path="user-sessions" element={<UserSessions />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import DataIngestion from "@/pages/DataIngestion";
import DataProcessing from "@/pages/DataProcessing";
import Dashboard from "@/pages/Dashboard";
import BotPage from "@/pages/BotPage";
import DataQuality from "@/pages/DataQuality";
import DataModelling from "@/pages/DataModelling";
import Admin from "@/pages/Admin";
import AdminLayout from "@/pages/admin/AdminLayout";
import Tenants from "@/pages/admin/Tenants";
import Organizations from "@/pages/admin/Organizations";
import UserRoles from "@/pages/admin/UserRoles";
import Users from "@/pages/admin/Users";
import UserSessions from "@/pages/admin/UserSessions";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="bottom-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/data-ingestion" element={<DataIngestion />} />
                <Route path="/data-processing" element={<DataProcessing />} />
                <Route path="/bot" element={<BotPage />} />
                <Route path="/data-quality" element={<DataQuality />} />
                <Route path="/data-modelling" element={<DataModelling />} />
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

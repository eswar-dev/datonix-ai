import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/common/contexts/AuthContext";

export function ProtectedRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/stores/auth-provider";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

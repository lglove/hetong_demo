import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./stores/auth";

export function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export function RequireSuperAdmin({ children }) {
  const { user } = useAuth();
  if (user?.role !== "super_admin") {
    return <Navigate to="/contracts" replace />;
  }
  return children;
}

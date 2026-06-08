import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../types/common";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

/**
 * Renders child routes only when the user is authenticated.
 * Optionally restricts access to specific roles.
 * - No token → redirect to /login
 * - Wrong role → redirect to /access-denied
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}

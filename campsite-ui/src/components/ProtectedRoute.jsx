import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Lock, AlertCircle, Loader } from "lucide-react";

export default function ProtectedRoute({
  children,
  adminOnly = false,
  requiredRole = null,
}) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const location = useLocation();

  // All hooks must be at top level before any conditional returns
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated && user) {
      toast.error("Please log in to access this page", {
        icon: <Lock size={18} />,
        duration: 3000,
      });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && adminOnly && !isAdmin) {
      toast.error("Admin access required. You don't have permission.", {
        icon: <AlertCircle size={18} />,
        duration: 3000,
      });
    }
  }, [isAuthenticated, adminOnly, isAdmin]);

  useEffect(() => {
    if (isAuthenticated && requiredRole && !isAdmin) {
      toast.error(`This page requires ${requiredRole} role. Access denied.`, {
        icon: <AlertCircle size={18} />,
        duration: 3000,
      });
    }
  }, [isAuthenticated, requiredRole, isAdmin]);

  // Conditional renders after all hooks
  // Show loading state while checking auth
  if (!isAuthenticated && !user) {
    return (
      <div className="protected-route-loading">
        <div className="loading-container">
          <Loader size={40} className="spinner" />
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Authenticated but not admin (admin-only route)
  if (adminOnly && !isAdmin) {
    return (
      <Navigate to="/" replace state={{ from: location, blocked: true }} />
    );
  }

  // Authenticated but doesn't have required role
  if (requiredRole && !isAdmin) {
    return (
      <Navigate to="/" replace state={{ from: location, blocked: true }} />
    );
  }

  // All checks passed
  return <>{children}</>;
}

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";

export default function UserOnlyRoute({ children }) {
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Keep navigation behavior consistent
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Admin users cannot access user-only pages
  useEffect(() => {
    if (isAdmin) {
      toast.error("Access Denied: Admins cannot access this page", {
        icon: <AlertCircle size={18} />,
        duration: 3000,
      });
    }
  }, [isAdmin]);

  if (isAdmin) {
    return <Navigate to="/admin" replace state={{ blocked: true }} />;
  }

  // Guests and regular users can access
  return <>{children}</>;
}

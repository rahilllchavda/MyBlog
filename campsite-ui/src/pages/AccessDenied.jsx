import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Home, LogOut } from "lucide-react";
import { useApp } from "../context/useApp";

export default function AccessDenied() {
  const navigate = useNavigate();
  const { logoutUser } = useApp();

  const handleLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <div className="access-denied-page">
      <div className="access-denied-container">
        <div className="access-denied-icon">
          <AlertCircle size={80} strokeWidth={1.5} />
        </div>
        <h1>Access Denied</h1>
        <p className="access-denied-message">
          Admins cannot access this page. Please use the admin dashboard to
          manage camps.
        </p>
        <div className="access-denied-actions">
          <Link to="/admin" className="btn btn-primary">
            <Home size={16} /> Back to Admin Dashboard
          </Link>
          <button onClick={handleLogout} className="btn btn-outline">
            <LogOut size={16} /> Logout
          </button>
        </div>
        <p className="access-denied-note">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}

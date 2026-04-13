import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/useApp";
import { useAuth } from "../hooks/useAuth";
import {
  Tent,
  LogOut,
  Settings,
  BookOpen,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { logoutUser } = useApp();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const isAdminSession = isAuthenticated && isAdmin;
  const showBookingLinks = !isAdminSession;
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navbarRef = useRef(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Brief loading state
    logoutUser();
    setUserDropdownOpen(false);
    setIsLoggingOut(false);
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userDropdownOpen]);

  // Handle keyboard shortcuts (ESC to close menus)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Detect scroll to add dynamic shadow
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper to check if link is active
  const isActive = (path) => location.pathname.startsWith(path);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const brandTarget = isAdminSession ? "/admin" : "/";
  const displayName = user?.firstName?.trim() || "User";

  return (
    <nav
      role="navigation"
      className={`navbar ${hasScrolled ? "navbar-scrolled" : ""}`}
      ref={navbarRef}
    >
      <div className="navbar-inner">
        <Link
          to={brandTarget}
          className="navbar-brand"
          onClick={closeMobileMenu}
        >
          <Tent size={28} strokeWidth={1.5} />
          <span>CampSite</span>
        </Link>

        {/* Desktop */}
        <div className="navbar-links desktop-only">
          {showBookingLinks && (
            <Link
              to="/manage"
              className={`nav-link ${isActive("/manage") ? "nav-link-active" : ""}`}
            >
              <BookOpen size={16} /> My Booking
            </Link>
          )}
          {isAdminSession && (
            <Link
              to="/admin"
              className={`nav-link nav-admin-link ${isActive("/admin") ? "nav-link-active" : ""}`}
            >
              <Settings size={16} /> Manage Camp
            </Link>
          )}
          {!isAuthenticated ? (
            <Link to="/login" className="btn btn-outline-white">
              Admin Login
            </Link>
          ) : (
            <div className="nav-user-menu" ref={dropdownRef}>
              <button
                className="nav-user-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
              >
                <span className="nav-user-avatar">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="nav-user-name">
                  {isAdminSession ? `Admin` : displayName}
                </span>
                <ChevronDown
                  size={16}
                  className={`dropdown-toggle ${
                    userDropdownOpen ? "dropdown-open" : ""
                  }`}
                />
              </button>
              {userDropdownOpen && (
                <div className="nav-dropdown nav-dropdown-enter">
                  <div className="nav-dropdown-header">
                    {user?.email}
                    {isAdminSession && (
                      <span className="admin-pill">Admin</span>
                    )}
                  </div>
                  {isAdminSession && !isActive("/admin") && (
                    <Link
                      to="/admin"
                      className="nav-dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Settings size={15} /> Go to Admin Panel
                    </Link>
                  )}
                  <button
                    className="nav-dropdown-item"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut size={15} />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={closeMobileMenu} />
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu mobile-menu-enter">
          {showBookingLinks && (
            <Link
              to="/manage"
              onClick={closeMobileMenu}
              className={isActive("/manage") ? "mobile-menu-item-active" : ""}
            >
              <BookOpen size={16} /> My Booking
            </Link>
          )}
          {isAdminSession && (
            <Link
              to="/admin"
              onClick={closeMobileMenu}
              className={isActive("/admin") ? "mobile-menu-item-active" : ""}
            >
              <Settings size={16} /> Manage Camps
            </Link>
          )}
          {!isAuthenticated ? (
            <Link to="/login" onClick={closeMobileMenu}>
              Admin Login
            </Link>
          ) : (
            <button
              onClick={() => {
                handleLogout();
                closeMobileMenu();
              }}
              disabled={isLoggingOut}
              className="mobile-menu-logout-btn"
            >
              <LogOut size={16} /> {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

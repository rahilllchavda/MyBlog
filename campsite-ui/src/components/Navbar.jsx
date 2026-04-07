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
    navigate("/");
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
  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav
      className={`navbar ${hasScrolled ? "navbar-scrolled" : ""}`}
      ref={navbarRef}
    >
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <Tent size={28} strokeWidth={1.5} />
          <span>CampSite</span>
        </Link>

        {/* Desktop */}
        <div className="navbar-links desktop-only">
          <Link
            to="/manage"
            className={`nav-link ${isActive("/manage") ? "nav-link-active" : ""}`}
          >
            <BookOpen size={16} /> My Booking
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link ${isActive("/admin") ? "nav-link-active" : ""}`}
            >
              <Settings size={16} /> Manage Camps
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
                  {user?.firstName?.charAt(0).toUpperCase()}
                </span>
                <span className="nav-user-name">
                  {user?.firstName} {isAdmin ? "👑" : ""}
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
                  <div className="nav-dropdown-header">{user?.email}</div>
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
          <Link
            to="/manage"
            onClick={closeMobileMenu}
            className={isActive("/manage") ? "mobile-menu-item-active" : ""}
          >
            <BookOpen size={16} /> My Booking
          </Link>
          {isAdmin && (
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

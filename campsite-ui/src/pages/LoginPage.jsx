import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import { login } from "../services/api";
import {
  Tent,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser, user } = useApp();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ If already logged in as admin, redirect to admin panel
  // If logged in as regular user, redirect to home
  useEffect(() => {
    if (user?.isAdmin) {
      navigate("/admin", { replace: true });
    } else if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const validate = () => {
    const e = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email is required";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    try {
      const res = await login(form);
      if (!res.data?.success || !res.data?.token) {
        toast.error(res.data?.message ?? "Login failed.");
        return;
      }
      loginUser(res.data, res.data.token);
      toast.success(`Welcome back, Admin!`);
      navigate(res.data.isAdmin ? "/admin" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const fillDemoCredentials = () => {
    setForm({ email: "admin@campsite.com", password: "Admin@123" });
    setErrors({});
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="login-back-link">
          <ArrowLeft size={14} /> Back to camps
        </Link>

        <div className="login-brand">
          <Tent size={40} strokeWidth={1.5} />
          <h1>CampSite</h1>
        </div>
        <h2 className="login-title">Admin Login</h2>
        <p className="login-sub">Sign in to manage camps and bookings</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className={`form-field ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="login-email">
              <Mail size={13} /> Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="admin@campsite.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
            />
            {errors.email && (
              <span className="field-error" id="login-email-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className={`form-field ${errors.password ? "has-error" : ""}`}>
            <label htmlFor="login-password">
              <Lock size={13} /> Password
            </label>
            <div className="password-wrap">
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "login-password-error" : undefined
                }
              />
              <button
                className="pw-toggle"
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="field-error" id="login-password-error">
                {errors.password}
              </span>
            )}
          </div>

          <button
            className="btn btn-primary btn-full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          className="btn btn-ghost btn-full login-demo-btn"
          onClick={fillDemoCredentials}
          disabled={loading}
        >
          <Sparkles size={14} /> Use demo credentials
        </button>

        <p className="login-hint">
          Demo account
          <br />
          admin@campsite.com / Admin@123
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import { login } from "../services/api";
import { Tent, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useApp();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
      loginUser(res.data, res.data.token);
      toast.success(`Welcome back, ${res.data.firstName}!`);
      navigate(res.data.isAdmin ? "/admin" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <Tent size={40} strokeWidth={1.5} />
          <h1>CampSite</h1>
        </div>
        <h2 className="login-title">Admin Login</h2>
        <p className="login-sub">Sign in to manage camps and bookings</p>

        <div className={`form-field ${errors.email ? "has-error" : ""}`}>
          <label>Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="admin@campsite.com"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className={`form-field ${errors.password ? "has-error" : ""}`}>
          <label>Password</label>
          <div className="password-wrap">
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              className="pw-toggle"
              type="button"
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <span className="field-error">{errors.password}</span>
          )}
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="login-hint">Demo: admin@campsite.com / Admin@123</p>
      </div>
    </div>
  );
}

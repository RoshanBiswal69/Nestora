import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Home,
  Lock,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    apartmentNumber: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const update =
    (key) =>
    (e) =>
      setForm({
        ...form,
        [key]: e.target.value,
      });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: "480px" }}>
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <img src="/logo.svg" alt="Nestora" style={{ width: 56, height: 56 }} />
          </div>
          <h1>Nestora</h1>
          <p>Smart Community Management</p>
        </div>

        <div className="auth-title">Create Resident Account</div>
        <div className="auth-sub">
          Register to raise maintenance requests, receive community bulletins, and track tickets.
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-group">
              <User size={18} />
              <input
                className="form-input"
                placeholder="e.g. John Doe"
                value={form.name}
                onChange={update("name")}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <Mail size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="name@community.com"
                value={form.email}
                onChange={update("email")}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Apartment / Unit</label>
              <div className="input-group">
                <Home size={18} />
                <input
                  className="form-input"
                  placeholder="e.g. B-402"
                  value={form.apartmentNumber}
                  onChange={update("apartmentNumber")}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-group">
                <Phone size={18} />
                <input
                  className="form-input"
                  placeholder="e.g. +1 555-0199"
                  value={form.phone}
                  onChange={update("phone")}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <Lock size={18} />
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={update("password")}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            <UserPlus size={18} />
            <span>{loading ? "Creating Account..." : "Create Nestora Account"}</span>
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
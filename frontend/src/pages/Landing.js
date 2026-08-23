import React from "react";
import { Link } from "react-router-dom";
import {
  ClipboardPlus,
  ClipboardList,
  Megaphone,
  LayoutDashboard,
  Clock3,
  ShieldCheck,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  Image,
  BellRing
} from "lucide-react";

const FEATURES = [
  {
    icon: ClipboardPlus,
    title: "Complaint Resolution Engine",
    text: "Residents quickly log maintenance tickets with categories, descriptions, urgency levels, and photo attachments.",
  },
  {
    icon: Clock3,
    title: "Intelligent SLA Tracking",
    text: "Automatic overdue alerts surface aging tickets to ensure prompt resolution and eliminate maintenance backlogs.",
  },
  {
    icon: Megaphone,
    title: "Broadcast Notice Board",
    text: "Publish community updates with critical announcement pinning and instant automated resident email blasts.",
  },
  {
    icon: LayoutDashboard,
    title: "Centralized Admin Suite",
    text: "Comprehensive metrics, deep multi-criteria filtering, and granular status triage in a single command center.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Security",
    text: "JWT-authenticated role protection ensuring private resident accounts and secure administrator controls.",
  },
  {
    icon: CheckCircle2,
    title: "Immutable Audit Trail",
    text: "Every status transition, timestamp, and administrative note is permanently logged for transparent governance.",
  }
];

const STEPS = [
  {
    num: "01",
    title: "Report with Context",
    text: "Resident submits an issue in seconds with category selection, detailed description, and direct photo upload.",
  },
  {
    num: "02",
    title: "Triage & Track",
    text: "Administrators review, set priority levels, and progress the issue through a verified Open → In Progress pipeline.",
  },
  {
    num: "03",
    title: "Resolve & Notify",
    text: "Issues are closed with resolution notes, notifying residents instantly via email and updating society metrics.",
  },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Header / Nav */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="brand-header" style={{ textDecoration: 'none' }}>
            <div className="brand-icon-box">
              <img src="/logo.svg" alt="Nestora" style={{ width: 36, height: 36 }} />
            </div>
            <div className="brand-info">
              <span className="brand-title">Nestora</span>
              <span className="brand-tagline">Smart Community Management</span>
            </div>
          </Link>
          <nav className="landing-nav-links">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <Sparkles size={15} />
            <span>Modern Community Operations Platform</span>
          </div>

          <h1 className="hero-title">
            Smart Community Management,{" "}
            <span className="hero-accent">Simplified.</span>
          </h1>

          <p className="hero-sub">
            Nestora empowers apartment societies and residential communities with an intuitive platform for maintenance tickets, real-time SLA tracking, and instant resident broadcasts.
          </p>

          <div className="hero-cta">
            <Link
              to="/register"
              className="btn btn-primary"
              style={{ padding: "13px 28px", fontSize: "15px" }}
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="btn btn-secondary"
              style={{ padding: "13px 28px", fontSize: "15px" }}
            >
              Sign In to Portal
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <Users size={20} color="var(--primary)" />
              <strong>Resident Portal</strong>
              <span>Fast Issue Reporting</span>
            </div>

            <div>
              <Zap size={20} color="var(--secondary)" />
              <strong>Real-Time SLA</strong>
              <span>Automated Overdue Alerts</span>
            </div>

            <div>
              <BellRing size={20} color="var(--accent)" />
              <strong>Direct Broadcasts</strong>
              <span>Community Announcements</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Core Capabilities</span>
            <h2 className="section-title">
              Engineered for Modern Residential Communities
            </h2>
            <p className="section-sub">
              Everything required to maintain society transparency, fast problem resolution, and happy residents.
            </p>
          </div>

          <div className="feature-grid">
            {FEATURES.map((f) => {
              const Icon = f.icon;

              return (
                <div className="feature-card" key={f.title}>
                  <div className="feature-icon-box">
                    <Icon size={24} />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Simple Workflow</span>
            <h2 className="section-title">How Nestora Works</h2>
            <p className="section-sub">
              From issue detection to verified resolution in three streamlined steps.
            </p>
          </div>

          <div className="steps-grid">
            {STEPS.map((s) => (
              <div className="step-card" key={s.num}>
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="cta-band">
        <div className="cta-band-inner">
          <h2>Upgrade Your Community Experience Today</h2>
          <p>
            Experience a cleaner, more organized society management workflow with Nestora.
          </p>
          <Link
            to="/register"
            className="btn btn-primary"
            style={{ padding: "13px 30px", fontSize: "15px" }}
          >
            Create Your Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-col">
            <div className="brand-header" style={{ marginBottom: "12px" }}>
              <div className="brand-icon-box" style={{ background: "none", boxShadow: "none" }}>
                <img src="/logo.svg" alt="Nestora" style={{ width: 36, height: 36 }} />
              </div>
              <div className="brand-info">
                <span className="brand-title" style={{ color: "white", WebkitTextFillColor: "white" }}>Nestora</span>
                <span className="brand-tagline" style={{ color: "#94a3b8" }}>Smart Community Management</span>
              </div>
            </div>
            <p>
              A focused, modern community platform connecting residents and administrators for streamlined operations and faster complaint resolution.
            </p>
          </div>

          <div className="footer-col">
            <h4>Application</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
          </div>

          <div className="footer-col">
            <h4>Features</h4>
            <span>Complaint Triage</span>
            <span>Notice Broadcasts</span>
            <span>Overdue SLA Alerting</span>
          </div>

          <div className="footer-col">
            <h4>Security & Privacy</h4>
            <span>Role-Based Access</span>
            <span>Audit Trail Logging</span>
            <span>Encrypted Credentials</span>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} Nestora. All rights reserved. Smart Community Management.
        </div>
      </footer>
    </div>
  );
}

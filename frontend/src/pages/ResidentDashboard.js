import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { StatusBadge, PriorityBadge, OverdueBadge } from "../components/Badges";
import {
  House,
  ClipboardList,
  CirclePlus,
  Megaphone,
  Pin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Inbox
} from "lucide-react";

export default function ResidentDashboard() {
  const { authFetch, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([authFetch("/complaints/my"), authFetch("/notices")])
      .then(([c, n]) => {
        setComplaints(c);
        setNotices(n.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === "Open").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px", fontWeight: 600 }}>Loading Resident Portal...</p>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "Resident";

  return (
    <>
      {/* Header & Quick Action */}
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-title-group">
            <div className="page-title-icon">
              <House size={24} />
            </div>
            <div>
              <h1>Welcome back, {firstName}</h1>
              <p>
                {user?.apartmentNumber ? `Unit ${user.apartmentNumber} · ` : ""}
                Track your active maintenance tickets and stay updated on community notices.
              </p>
            </div>
          </div>
          <Link to="/raise-complaint" className="btn btn-primary">
            <CirclePlus size={18} />
            <span>Raise Maintenance Ticket</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-total">
            <ClipboardList size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">My Tickets</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-sub" style={{ color: "var(--text-muted)" }}>Total logged</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-open">
            <AlertCircle size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Open</div>
            <div className="stat-value" style={{ color: "var(--danger)" }}>{stats.open}</div>
            <div className="stat-sub" style={{ color: "var(--danger)" }}>Awaiting triage</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-progress">
            <Clock size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">In Progress</div>
            <div className="stat-value" style={{ color: "var(--warning)" }}>{stats.inProgress}</div>
            <div className="stat-sub" style={{ color: "var(--warning-hover)" }}>Under resolution</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-resolved">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Resolved</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>{stats.resolved}</div>
            <div className="stat-sub" style={{ color: "var(--success)" }}>Completed</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "24px",
        }}
      >
        {/* Recent Personal Complaints */}
        <div className="card" style={{ padding: 0 }}>
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Recent Tickets</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>Your recently submitted issues</p>
            </div>
            <Link
              to="/my-complaints"
              style={{
                fontSize: "13px",
                color: "var(--primary)",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {complaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <ClipboardList size={26} />
              </div>
              <h3>No tickets logged yet</h3>
              <p>Everything in your apartment is in top shape! If you encounter an issue, report it right away.</p>
              <Link
                to="/raise-complaint"
                className="btn btn-primary btn-sm"
                style={{ marginTop: "16px" }}
              >
                <CirclePlus size={16} />
                <span>Submit First Ticket</span>
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 5).map((c) => (
                    <tr
                      key={c._id}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/complaints/${c._id}`)}
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong>{c.title}</strong>
                          {c.isOverdue && <OverdueBadge />}
                        </div>
                      </td>
                      <td>{c.category}</td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link
                          to={`/complaints/${c._id}`}
                          className="btn btn-ghost btn-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>Details</span>
                          <ArrowRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Community Notice Board Widget */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Megaphone size={18} color="var(--primary)" />
              <span>Community Bulletins</span>
            </div>
            <Link
              to="/notices"
              style={{
                fontSize: "13px",
                color: "var(--primary)",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {notices.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 16px" }}>
              <div className="empty-icon" style={{ width: "42px", height: "42px", marginBottom: "12px" }}>
                <Megaphone size={20} />
              </div>
              <h3 style={{ fontSize: "15px" }}>No Announcements</h3>
              <p style={{ fontSize: "13px" }}>Check back later for updates from society administration.</p>
            </div>
          ) : (
            notices.map((n) => (
              <div
                key={n._id}
                style={{
                  paddingBottom: "16px",
                  marginBottom: "16px",
                  borderBottom: "1px solid var(--border-light)",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--text)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {n.isImportant && (
                    <span className="badge badge-important" style={{ padding: "2px 8px", fontSize: "11px" }}>
                      <Pin size={11} /> Important
                    </span>
                  )}
                  <span>{n.title}</span>
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    marginTop: "6px",
                    lineHeight: 1.55,
                  }}
                >
                  {n.content.length > 100
                    ? n.content.slice(0, 100) + "..."
                    : n.content}
                </p>
                <div style={{ fontSize: "11.5px", color: "var(--text-light)", marginTop: "8px" }}>
                  Posted on {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

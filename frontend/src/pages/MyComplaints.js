import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ClipboardList,
  CirclePlus,
  Filter,
  Inbox,
  ArrowRight,
  Eye
} from "lucide-react";
import {
  StatusBadge,
  PriorityBadge,
  OverdueBadge,
} from "../components/Badges";

export default function MyComplaints() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    authFetch("/complaints/my")
      .then(setComplaints)
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter
    ? complaints.filter((c) => c.status === statusFilter)
    : complaints;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px", fontWeight: 600 }}>Loading your tickets...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-title-group">
            <div className="page-title-icon">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1>My Maintenance Tickets</h1>
              <p>Monitor status updates, audit history, and admin resolutions for all tickets you have raised.</p>
            </div>
          </div>
          <Link to="/raise-complaint" className="btn btn-primary">
            <CirclePlus size={18} />
            <span>Raise New Ticket</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Filter size={18} color="var(--text-muted)" />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>Filter by Status:</span>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses ({complaints.length})</option>
            <option value="Open">Open ({complaints.filter(c => c.status === 'Open').length})</option>
            <option value="In Progress">In Progress ({complaints.filter(c => c.status === 'In Progress').length})</option>
            <option value="Resolved">Resolved ({complaints.filter(c => c.status === 'Resolved').length})</option>
          </select>
        </div>
      </div>

      {/* Empty State vs Table */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Inbox size={26} />
            </div>
            <h3>No Tickets Found</h3>
            <p>
              {statusFilter
                ? `No complaints match status "${statusFilter}".`
                : "You haven't submitted any maintenance requests yet."}
            </p>
            {!statusFilter && (
              <Link to="/raise-complaint" className="btn btn-primary" style={{ marginTop: "16px" }}>
                <CirclePlus size={16} />
                <span>Submit Ticket</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticket Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Logged Date</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((complaint) => (
                  <tr
                    key={complaint._id}
                    className={complaint.isOverdue ? "overdue-row" : ""}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/complaints/${complaint._id}`)}
                  >
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ color: "var(--text)" }}>{complaint.title}</strong>
                        {complaint.isOverdue && <OverdueBadge />}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>
                        {complaint.category}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td>
                      <PriorityBadge priority={complaint.priority} />
                    </td>
                    <td>
                      {new Date(complaint.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        to={`/complaints/${complaint._id}`}
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye size={14} />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
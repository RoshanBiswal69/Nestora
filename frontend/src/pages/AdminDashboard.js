import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/Badges';
import {
  LayoutDashboard,
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Inbox
} from 'lucide-react';

export default function AdminDashboard() {
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/dashboard')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', fontWeight: 600 }}>Loading Nestora Dashboard...</p>
      </div>
    );
  }

  const maxCategoryCount = Math.max(...data.byCategory.map(c => c.count), 1);

  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-title-group">
            <div className="page-title-icon">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1>Admin Command Center</h1>
              <p>Real-time operational overview of community complaints, SLA alerts, and category distributions</p>
            </div>
          </div>
          <Link to="/admin/complaints" className="btn btn-primary btn-sm">
            <ClipboardList size={16} />
            <span>Manage All Tickets</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-total">
            <ClipboardList size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Tickets</div>
            <div className="stat-value">{data.total}</div>
            <div className="stat-sub" style={{ color: 'var(--text-muted)' }}>All time logged</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-open">
            <AlertCircle size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Open</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{data.byStatus.Open}</div>
            <div className="stat-sub" style={{ color: 'var(--danger)' }}>Awaiting action</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-progress">
            <Clock size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">In Progress</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{data.byStatus['In Progress']}</div>
            <div className="stat-sub" style={{ color: 'var(--warning-hover)' }}>Currently active</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-resolved">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Resolved</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{data.byStatus.Resolved}</div>
            <div className="stat-sub" style={{ color: 'var(--success)' }}>Successfully closed</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderColor: data.overdueCount > 0 ? 'var(--overdue-border)' : undefined, background: data.overdueCount > 0 ? 'var(--overdue-light)' : undefined }}>
          <div className="stat-icon-wrapper stat-icon-overdue">
            <AlertTriangle size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Overdue SLA</div>
            <div className="stat-value" style={{ color: '#a21caf' }}>{data.overdueCount}</div>
            <div className="stat-sub" style={{ color: '#a21caf' }}>
              {data.overdueCount > 0 ? '⚠️ Requires attention' : 'All within SLA'}
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Sparkles size={18} color="var(--primary)" />
              <span>Complaints by Category</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Distribution</span>
          </div>

          {data.byCategory.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No category data available.</p>
          ) : (
            data.byCategory.map(c => (
              <div key={c.category} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{c.category}</span>
                  <strong style={{ color: 'var(--text)' }}>{c.count}</strong>
                </div>
                <div style={{ height: '8px', background: 'var(--surface-subtle)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                  <div style={{
                    height: '100%',
                    width: `${(c.count / maxCategoryCount) * 100}%`,
                    background: 'var(--primary-gradient)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={18} color="var(--warning)" />
              <span>Complaints by Priority</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Triage Severity</span>
          </div>

          {['High', 'Medium', 'Low'].map(p => (
            <div key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
              <PriorityBadge priority={p} />
              <strong style={{ fontSize: '16px', color: 'var(--text)' }}>{data.byPriority[p] || 0}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Recent & Active Complaints Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Active Priority Queue (Overdue First)</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Complaints requiring administrative attention or progression</p>
          </div>
          <Link to="/admin/complaints" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>View All Tickets</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {data.recentComplaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Inbox size={26} />
            </div>
            <h3>All Caught Up!</h3>
            <p>There are no active or overdue complaints requiring attention right now.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticket Title</th>
                  <th>Resident</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentComplaints.map(c => (
                  <tr key={c._id} className={c.isOverdue ? 'overdue-row' : ''}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: 'var(--text)' }}>{c.title}</strong>
                        {c.isOverdue && <OverdueBadge />}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{c.resident?.name || 'Resident'}</span>
                      {c.resident?.apartmentNumber && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '6px' }}>
                          ({c.resident.apartmentNumber})
                        </span>
                      )}
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/complaints/${c._id}`} className="btn btn-secondary btn-sm">
                        <span>Inspect</span>
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
    </>
  );
}

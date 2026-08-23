import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/Badges';
import { Search, ClipboardList, Filter, X, Eye, Calendar } from 'lucide-react';

const CATEGORIES = ['Plumbing', 'Electrical', 'Elevator', 'Security', 'Cleaning', 'Parking', 'Noise', 'Internet', 'Other'];

export default function AdminComplaints() {
  const { authFetch } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '', priority: '', search: '', startDate: '', endDate: '' });

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    authFetch(`/complaints?${params.toString()}`)
      .then(setComplaints)
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const update = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });
  const clearFilters = () => setFilters({ category: '', status: '', priority: '', search: '', startDate: '', endDate: '' });

  const overdueCount = complaints.filter(c => c.isOverdue).length;
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-title-group">
            <div className="page-title-icon">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1>All Maintenance Tickets</h1>
              <p>
                {complaints.length} tickets matching filters {overdueCount > 0 && `· ${overdueCount} flagged as overdue`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filters-bar">
        <div className="input-group" style={{ flex: 1, minWidth: '220px' }}>
          <Search size={16} />
          <input
            className="form-input"
            placeholder="Search by title or description..."
            value={filters.search}
            onChange={update('search')}
          />
        </div>

        <select className="filter-select" value={filters.category} onChange={update('category')}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="filter-select" value={filters.status} onChange={update('status')}>
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        <select className="filter-select" value={filters.priority} onChange={update('priority')}>
          <option value="">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={15} color="var(--text-muted)" />
          <input
            type="date"
            className="filter-select"
            value={filters.startDate}
            onChange={update('startDate')}
            title="From Date"
          />
          <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>to</span>
          <input
            type="date"
            className="filter-select"
            value={filters.endDate}
            onChange={update('endDate')}
            title="To Date"
          />
        </div>

        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <X size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="card" style={{ padding: '48px 0', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Filtering tickets...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={26} />
            </div>
            <h3>No Tickets Found</h3>
            <p>No complaints match your selected search query or filters. Try adjusting or clearing filters.</p>
            {hasActiveFilters && (
              <button className="btn btn-secondary btn-sm" onClick={clearFilters} style={{ marginTop: '16px' }}>
                Clear All Filters
              </button>
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
                  <th>Resident & Unit</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Raised Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
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
                        <span style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginLeft: '6px' }}>
                          ({c.resident.apartmentNumber})
                        </span>
                      )}
                    </td>
                    <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{c.category}</span></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/complaints/${c._id}`} className="btn btn-secondary btn-sm">
                        <Eye size={14} />
                        <span>Triage</span>
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

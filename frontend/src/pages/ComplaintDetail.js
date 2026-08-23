import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/Badges';
import {
  ArrowLeft,
  Calendar,
  User,
  Home,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  MessageSquare,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { authFetch, user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = user?.role === 'admin';

  const load = () => {
    authFetch(`/complaints/${id}`).then(c => {
      setComplaint(c);
      setNewStatus(c.status);
      setPriority(c.priority);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);
    try {
      const body = {};
      if (newStatus !== complaint.status) body.status = newStatus;
      if (priority !== complaint.priority) body.priority = priority;
      if (note) body.note = note;

      const updated = await authFetch(`/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      setComplaint(updated);
      setNote('');
      setSuccess('Complaint updated successfully! Resident has been notified.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', fontWeight: 600 }}>Loading Ticket Details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <h3>Ticket Not Found</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>This complaint may have been removed or you do not have permission to view it.</p>
        <Link to={isAdmin ? '/admin/complaints' : '/my-complaints'} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Tickets
        </Link>
      </div>
    );
  }

  const backLink = isAdmin ? '/admin/complaints' : '/my-complaints';

  // Status Stage Helper
  const stages = ['Open', 'In Progress', 'Resolved'];
  const currentStageIdx = stages.indexOf(complaint.status);

  return (
    <>
      <div className="page-header">
        <Link to={backLink} style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <ArrowLeft size={14} />
          <span>{isAdmin ? 'Back to All Tickets' : 'Back to My Tickets'}</span>
        </Link>

        <div className="page-header-top">
          <div>
            <h1>{complaint.title}</h1>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              {complaint.isOverdue && <OverdueBadge />}
              <span style={{ fontSize: '12.5px', color: 'var(--text-light)' }}>
                ID: #{complaint._id.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Workflow Progress Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIdx || complaint.status === 'Resolved';
            const isCurrent = stage === complaint.status;
            return (
              <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, flex: 1 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '13px',
                  background: isCurrent ? 'var(--primary)' : isCompleted ? 'var(--success)' : 'var(--surface-subtle)',
                  color: (isCurrent || isCompleted) ? 'white' : 'var(--text-muted)',
                  border: isCurrent ? '3px solid var(--primary-light)' : isCompleted ? '3px solid var(--success-light)' : '2px solid var(--border)',
                  boxShadow: (isCurrent || isCompleted) ? 'var(--shadow-sm)' : 'none'
                }}>
                  {isCompleted && !isCurrent ? '✓' : idx + 1}
                </div>
                <span style={{
                  fontSize: '12.5px',
                  fontWeight: isCurrent ? 800 : 600,
                  color: isCurrent ? 'var(--primary)' : isCompleted ? 'var(--success)' : 'var(--text-muted)'
                }}>
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1.35fr 1fr' : '1fr', gap: '24px' }}>
        {/* Left Column: Details & Audit Trail */}
        <div>
          {/* Metadata Card */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              Ticket Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>{complaint.category}</div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Raised By</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
                  {complaint.resident?.name || 'Resident'}
                  {complaint.resident?.apartmentNumber && ` (${complaint.resident.apartmentNumber})`}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submitted On</div>
                <div style={{ fontSize: '13.5px', color: 'var(--text)', marginTop: '4px' }}>
                  {new Date(complaint.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {complaint.resolvedAt && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase' }}>Resolved On</div>
                  <div style={{ fontSize: '13.5px', color: 'var(--text)', marginTop: '4px' }}>
                    {new Date(complaint.resolvedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Description</div>
              <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.65, background: 'var(--surface-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                {complaint.description}
              </div>
            </div>

            {/* Photo Attachment if available */}
            {complaint.photo && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={14} />
                  <span>Attached Photo Evidence</span>
                </div>
                <div style={{ background: 'var(--surface-subtle)', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <a href={complaint.photo} target="_blank" rel="noreferrer" title="Open full resolution">
                    <img
                      src={complaint.photo}
                      alt="Complaint Evidence"
                      style={{ maxWidth: '100%', maxHeight: '360px', borderRadius: 'var(--radius-sm)', display: 'block', margin: '0 auto', objectFit: 'contain' }}
                    />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Chronological Audit Trail */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              Lifecycle & Audit History
            </h3>
            <div className="history-timeline">
              {complaint.statusHistory.map((h, idx) => (
                <div className="history-item" key={idx}>
                  <div className="history-dot">
                    {h.status === 'Resolved' ? (
                      <CheckCircle2 size={16} color="var(--success)" />
                    ) : h.status === 'In Progress' ? (
                      <Clock size={16} color="var(--warning)" />
                    ) : (
                      <AlertCircle size={16} color="var(--danger)" />
                    )}
                  </div>
                  <div className="history-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="history-status">{h.status}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)', background: 'var(--surface-subtle)', padding: '1px 6px', borderRadius: '4px' }}>
                        Step {idx + 1}
                      </span>
                    </div>
                    <div className="history-meta">
                      Updated by <strong>{h.changedBy?.name || 'System'}</strong> ({h.changedBy?.role || 'user'}) · {new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {h.note && (
                      <div className="history-note">
                        <strong>Note:</strong> {h.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Admin Triage Suite (if Admin) */}
        {isAdmin && (
          <div>
            <div className="card" style={{ position: 'sticky', top: '24px' }}>
              <div className="card-header">
                <div className="card-title">
                  <Shield size={18} color="var(--primary)" />
                  <span>Admin Triage Actions</span>
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="alert alert-success">
                  <CheckCircle2 size={18} />
                  <span>{success}</span>
                </div>
              )}

              {complaint.status === 'Resolved' ? (
                <div style={{ background: 'var(--success-light)', border: '1px solid var(--success-border)', padding: '16px', borderRadius: 'var(--radius-sm)', color: '#065f46', fontSize: '13.5px' }}>
                  <strong>Ticket Closed:</strong> This complaint has been marked as Resolved and is archived in the permanent audit trail.
                </div>
              ) : (
                <form onSubmit={handleUpdate}>
                  <div className="form-group">
                    <label className="form-label">Update Status</label>
                    <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved (Close Ticket)</option>
                    </select>
                    <p className="form-hint">Changing status triggers an automated notification email to the resident.</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Set Priority SLA</label>
                    <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Administrative Note (Optional)</label>
                    <textarea
                      className="form-textarea"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="e.g. Assigned technician for Thursday 10:00 AM inspection..."
                      rows={3}
                    />
                    <p className="form-hint">This note is recorded in the permanent timeline and included in resident status emails.</p>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={updating}>
                    <CheckCircle2 size={16} />
                    <span>{updating ? 'Saving Update...' : 'Commit Status Update'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

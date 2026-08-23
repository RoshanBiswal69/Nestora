import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Pin, Plus, Trash2, AlertCircle, CheckCircle2, Sparkles, X, Mail } from 'lucide-react';

export default function AdminNotices() {
  const { authFetch } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    authFetch('/notices')
      .then(setNotices)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await authFetch('/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, isImportant })
      });
      setTitle('');
      setContent('');
      setIsImportant(false);
      setShowForm(false);
      setSuccess('Notice broadcasted successfully to all residents!');
      setTimeout(() => setSuccess(''), 4000);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this notice?')) return;
    try {
      await authFetch(`/notices/${id}`, { method: 'DELETE' });
      setSuccess('Notice deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', fontWeight: 600 }}>Loading Notices...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-title-group">
            <div className="page-title-icon">
              <Megaphone size={24} />
            </div>
            <div>
              <h1>Community Notice Board</h1>
              <p>Publish bulletins and broadcast urgent alerts to all registered residents</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span>{showForm ? 'Cancel' : 'Publish Notice'}</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Slide-down Create Notice Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '28px', maxWidth: '640px', borderColor: 'var(--primary)', boxShadow: 'var(--shadow-md)' }}>
          <div className="card-header">
            <div className="card-title">
              <Sparkles size={18} color="var(--primary)" />
              <span>Compose Community Bulletin</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Notice Title</label>
              <input
                className="form-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Annual Elevator Inspection Scheduled for Saturday"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notice Content</label>
              <textarea
                className="form-textarea"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Detail the announcement, dates, affected areas, and guidance for residents..."
                required
                rows={5}
              />
            </div>

            <div className="form-group" style={{ background: 'var(--surface-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={e => setIsImportant(e.target.checked)}
                  style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <div>
                  <strong style={{ color: 'var(--text)' }}>Flag as High-Priority / Important Announcement</strong>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Pins notice to the top of the feed and automatically dispatches email notifications to all registered community residents.
                  </p>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Megaphone size={16} />
                <span>{submitting ? 'Broadcasting...' : 'Broadcast Notice'}</span>
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notices Feed */}
      {notices.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Megaphone size={26} />
            </div>
            <h3>No Notices Published Yet</h3>
            <p>Publish your first announcement to keep community members informed.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)} style={{ marginTop: '16px' }}>
              <Plus size={16} />
              <span>Compose First Notice</span>
            </button>
          </div>
        </div>
      ) : (
        notices.map(n => (
          <div key={n._id} className={`notice-card ${n.isImportant ? 'important' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div className="notice-title">
                {n.isImportant && (
                  <span className="badge badge-important">
                    <Pin size={12} />
                    <span>Important Bulletin</span>
                  </span>
                )}
                <span>{n.title}</span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleDelete(n._id)}
                style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Delete Notice"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>

            <div className="notice-body">{n.content}</div>

            <div className="notice-footer">
              <span>Published by <strong>{n.postedBy?.name || 'Administrator'}</strong></span>
              <span>•</span>
              <span>{new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))
      )}
    </>
  );
}

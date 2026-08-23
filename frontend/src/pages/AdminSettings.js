import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Clock, CheckCircle2, AlertCircle, Save, Sparkles } from 'lucide-react';

export default function AdminSettings() {
  const { authFetch } = useAuth();
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch('/complaints/settings/overdue-threshold')
      .then(d => setDays(d.days))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await authFetch('/complaints/settings/overdue-threshold', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days })
      });
      setSuccess('Overdue SLA threshold updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', fontWeight: 600 }}>Loading Settings...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-title-icon">
            <Settings size={24} />
          </div>
          <div>
            <h1>System Settings & Policies</h1>
            <p>Configure operational thresholds, SLA alerts, and community management rules</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '560px' }}>
        <div className="card-header">
          <div className="card-title">
            <Clock size={18} color="var(--primary)" />
            <span>Overdue SLA Threshold</span>
          </div>
        </div>

        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
          Complaints that remain in <strong>Open</strong> or <strong>In Progress</strong> status past this number of days will be dynamically flagged as overdue and highlighted at the top of the admin triage queue.
        </p>

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

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Threshold Duration (Days)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                min="1"
                max="90"
                className="form-input"
                value={days}
                onChange={e => setDays(e.target.value)}
                style={{ maxWidth: '140px', fontWeight: 700 }}
                required
              />
              <span style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 600 }}>days since ticket submission</span>
            </div>
            <p className="form-hint">Default is 7 days. Changes take effect on next ticket evaluation.</p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </form>
      </div>
    </>
  );
}

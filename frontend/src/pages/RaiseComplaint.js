import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, CirclePlus, ArrowLeft, UploadCloud, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const CATEGORIES = ['Plumbing', 'Electrical', 'Elevator', 'Security', 'Cleaning', 'Parking', 'Noise', 'Internet', 'Other'];

export default function RaiseComplaint() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const { token } = useAuth();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL || '/api';

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removePhoto = (e) => {
    e.stopPropagation();
    setPhoto(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      if (photo) formData.append('photo', photo);

      const res = await fetch(`${API}/complaints`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit complaint');

      navigate('/my-complaints');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <Link to="/dashboard" style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <ArrowLeft size={14} />
          <span>Back to Overview</span>
        </Link>
        <div className="page-title-group">
          <div className="page-title-icon">
            <CirclePlus size={24} />
          </div>
          <div>
            <h1>Raise Maintenance Ticket</h1>
            <p>Provide details and optional photos to help society administrators resolve the issue quickly</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '640px' }}>
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Issue Title</label>
            <input
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Water leak under kitchen sink"
              required
              maxLength={100}
              autoFocus
            />
            <p className="form-hint">A concise summary of the issue</p>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="">Select an issue category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Specify the location in your unit, when the issue began, severity, and any relevant details..."
              required
              rows={5}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Attach Photo (Optional)</label>
            <div
              className={`photo-upload ${photo ? 'has-file' : ''}`}
              onClick={() => fileRef.current.click()}
            >
              <input
                type="file"
                ref={fileRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              {photoPreview ? (
                <div>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={photoPreview} alt="Preview" className="photo-preview" />
                    <button
                      type="button"
                      onClick={removePhoto}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'var(--danger)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      title="Remove Photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="form-hint" style={{ marginTop: '8px' }}>Click to replace photo</p>
                </div>
              ) : (
                <div>
                  <div style={{ color: 'var(--primary)', marginBottom: '10px' }}>
                    <UploadCloud size={36} style={{ margin: '0 auto' }} />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Click to upload an image</p>
                  <p className="form-hint">Supports JPG, PNG, WEBP up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <CirclePlus size={18} />
              <span>{loading ? 'Submitting Ticket...' : 'Submit Ticket'}</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

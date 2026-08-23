import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Pin, Inbox, Calendar, User } from 'lucide-react';

export default function NoticeBoardPage() {
  const { authFetch } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/notices')
      .then(setNotices)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', fontWeight: 600 }}>Loading Notice Board...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-title-icon">
            <Megaphone size={24} />
          </div>
          <div>
            <h1>Community Notice Board</h1>
            <p>Official broadcasts, scheduled maintenance advisories, and society announcements</p>
          </div>
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Megaphone size={26} />
            </div>
            <h3>No Announcements Yet</h3>
            <p>There are no active notices on the community board. Check back later for updates.</p>
          </div>
        </div>
      ) : (
        notices.map(n => (
          <div key={n._id} className={`notice-card ${n.isImportant ? 'important' : ''}`}>
            <div className="notice-title">
              {n.isImportant && (
                <span className="badge badge-important">
                  <Pin size={12} />
                  <span>Important Bulletin</span>
                </span>
              )}
              <span>{n.title}</span>
            </div>

            <div className="notice-body">{n.content}</div>

            <div className="notice-footer">
              <span>Posted by <strong>{n.postedBy?.name || 'Society Admin'}</strong></span>
              <span>•</span>
              <span>{new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))
      )}
    </>
  );
}

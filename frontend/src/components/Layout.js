import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CirclePlus,
  ClipboardList,
  Megaphone,
  Settings,
  LogOut,
  House,
  Shield
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  const residentLinks = [
    { to: '/dashboard', icon: House, label: 'Overview' },
    { to: '/raise-complaint', icon: CirclePlus, label: 'Raise Ticket' },
    { to: '/my-complaints', icon: ClipboardList, label: 'My Tickets' },
    { to: '/notices', icon: Megaphone, label: 'Notice Board' },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/complaints', icon: ClipboardList, label: 'All Tickets' },
    { to: '/admin/notices', icon: Megaphone, label: 'Notice Board' },
    { to: '/admin/settings', icon: Settings, label: 'System Settings' },
  ];

  const links = user?.role === 'admin' ? adminLinks : residentLinks;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link to="/" className="brand-header" style={{ textDecoration: 'none' }}>
            <div className="brand-icon-box">
              <img src="/logo.svg" alt="Nestora" style={{ width: 36, height: 36 }} />
            </div>
            <div className="brand-info">
              <span className="brand-title">Nestora</span>
              <span className="brand-tagline">Smart Community Hub</span>
            </div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Main Navigation</div>

          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin' || link.to === '/dashboard'}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <Icon size={18} className="nav-icon" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-pill">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <div className="user-name" title={user?.name}>{user?.name || 'Community Member'}</div>
              <span className={`user-role-badge ${user?.role === 'admin' ? 'admin' : ''}`}>
                {user?.role === 'admin' ? 'Administrator' : `Resident ${user?.apartmentNumber ? `· ${user?.apartmentNumber}` : ''}`}
              </span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
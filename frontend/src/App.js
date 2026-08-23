import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ResidentDashboard from './pages/ResidentDashboard';
import RaiseComplaint from './pages/RaiseComplaint';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetail from './pages/ComplaintDetail';
import NoticeBoardPage from './pages/NoticeBoardPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaints from './pages/AdminComplaints';
import AdminNotices from './pages/AdminNotices';
import AdminSettings from './pages/AdminSettings';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Resident routes */}
      <Route path="/dashboard" element={<PrivateRoute><Layout><ResidentDashboard /></Layout></PrivateRoute>} />
      <Route path="/raise-complaint" element={<PrivateRoute><Layout><RaiseComplaint /></Layout></PrivateRoute>} />
      <Route path="/my-complaints" element={<PrivateRoute><Layout><MyComplaints /></Layout></PrivateRoute>} />
      <Route path="/complaints/:id" element={<PrivateRoute><Layout><ComplaintDetail /></Layout></PrivateRoute>} />
      <Route path="/notices" element={<PrivateRoute><Layout><NoticeBoardPage /></Layout></PrivateRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<PrivateRoute adminOnly><Layout><AdminDashboard /></Layout></PrivateRoute>} />
      <Route path="/admin/complaints" element={<PrivateRoute adminOnly><Layout><AdminComplaints /></Layout></PrivateRoute>} />
      <Route path="/admin/complaints/:id" element={<PrivateRoute adminOnly><Layout><ComplaintDetail /></Layout></PrivateRoute>} />
      <Route path="/admin/notices" element={<PrivateRoute adminOnly><Layout><AdminNotices /></Layout></PrivateRoute>} />
      <Route path="/admin/settings" element={<PrivateRoute adminOnly><Layout><AdminSettings /></Layout></PrivateRoute>} />

      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

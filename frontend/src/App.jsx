import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './pages/Dashboard';
import AddCase from './pages/AddCase';
import CaseList from './pages/CaseList';
import Schedule from './pages/Schedule';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import ProtectedRoute from './ProtectedRoute';
import './App.css';
import { Scale, FilePlus, List, Calendar, BarChart2, LogOut } from 'lucide-react';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <span>Verifying Access...</span>
      </div>
    );
  }

  // Flow A: Not authenticated
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Flow B: Authenticated, but on login page -> redirect to dashboard
  if (location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  // Flow C: Authenticated, show main application shell
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Scale size={32} />
          <h2>JusticeOS</h2>
        </div>
        <nav className="nav-links">
          <Link to="/" className="nav-link"><BarChart2 className="icon" /> Dashboard</Link>
          <Link to="/add-case" className="nav-link"><FilePlus className="icon" /> Add Case</Link>
          <Link to="/cases" className="nav-link"><List className="icon" /> Case List</Link>
          <Link to="/schedule" className="nav-link"><Calendar className="icon" /> Schedule Engine</Link>
          <Link to="/analytics" className="nav-link"><BarChart2 className="icon" /> Analytics</Link>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>Smart Judicial Case Scheduling System</h1>
          <div className="user-profile">
            <span style={{ marginRight: '1rem', color: '#64748b' }}>{user.email}</span>
            <button 
              onClick={handleLogout} 
              style={{ background: 'none', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: '500' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-case" element={<AddCase />} />
            <Route path="/cases" element={<CaseList />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

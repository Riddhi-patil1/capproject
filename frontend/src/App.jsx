import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddCase from './pages/AddCase';
import CaseList from './pages/CaseList';
import Schedule from './pages/Schedule';
import Analytics from './pages/Analytics';
import './App.css';
import { Scale, FilePlus, List, Calendar, BarChart2 } from 'lucide-react';

function App() {
  return (
    <Router>
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
            <div className="user-profile">Admin</div>
          </header>

          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-case" element={<AddCase />} />
              <Route path="/cases" element={<CaseList />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;

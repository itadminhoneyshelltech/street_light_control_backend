import React from 'react';
import { useAuthStore } from '../store/authStore';
import { LogOut, Settings } from 'lucide-react';
import '../styles/Navbar.css';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <h1>🚦 Street Light Control System</h1>
        </div>
        <div className="navbar-menu">
          <a href="/" className="navbar-link">Home</a>
          <a href="/report" className="navbar-link">Report</a>
          <a href="/liveview" className="navbar-link">Liveview</a>
        </div>
        <div className="navbar-content">
          <span className="user-info">
            {user?.name} ({user?.role?.toUpperCase?.()})
          </span>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

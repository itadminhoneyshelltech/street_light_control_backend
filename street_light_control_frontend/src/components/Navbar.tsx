import React from 'react';
import { useAuthStore } from '../store/authStore';
import { LogOut, Settings } from 'lucide-react';
import '../styles/Navbar.css';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return '👑';
      case 'operator':
        return '⚙️';
      case 'viewer':
        return '👁️';
      default:
        return '👤';
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Administrator';
      case 'operator':
        return 'Operator';
      case 'viewer':
        return 'Viewer';
      default:
        return 'User';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-icon">💡</span>
          <div>
            <h1>Smart City</h1>
            <p>Street Light Control</p>
          </div>
        </div>
        <div className="navbar-highlights" aria-label="energy-highlights">
          <span className="highlight-chip success">Energy Saved Today: 47.95%</span>
          <span className="highlight-chip info">Cumulative Saving: 24,13,271 kWh</span>
        </div>

        <div className="navbar-content">
          <span className="user-info">
            <span className="role-badge">
              {getRoleIcon()} {getRoleLabel()}
            </span>
            <span className="user-name">{user?.name}</span>
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

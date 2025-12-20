import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Navbar } from '../components/Navbar';
import { EnhancedDashboard } from '../components/EnhancedDashboard';
import { LightControl } from '../components/LightControl';
import { MapView } from '../components/MapView';
import { Reports } from '../components/Reports';
import { AIChatbot } from '../components/AIChatbot';
import '../styles/Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'control' | 'map' | 'reports'>('overview');
  const [expandLamps, setExpandLamps] = React.useState(false);
  const [expandCCMS, setExpandCCMS] = React.useState(false);
  const [chatbotOpen, setChatbotOpen] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  useEffect(() => {
    if (!token || !user) {
      window.location.href = '/login';
    }
  }, [token, user]);

  // Listen for chatbot command execution and trigger refresh
  useEffect(() => {
    const handleDashboardRefresh = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    return () => window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
  }, []);

  const isOperator = user?.role === 'operator' || user?.role === 'admin';
  const isViewer = user?.role === 'viewer';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-container">
        <div className="sidebar">
          {/* Overview Tab - All Roles */}
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>

          {/* Expandable Stats */}
          <div className="stat-section">
            <button 
              className="stat-dropdown-btn"
              onClick={() => setExpandLamps(!expandLamps)}
            >
              <span>💡 Total Lamps: 6,527</span>
              <span className="arrow">{expandLamps ? '▼' : '▶'}</span>
            </button>
            {expandLamps && (
              <div className="stat-dropdown-content">
                <div className="stat-item">On: <strong>5,577</strong></div>
                <div className="stat-item">Off: <strong>914</strong></div>
                <div className="stat-item">Unknown: <strong>36</strong></div>
                <div className="stat-item">Working: <strong>96%</strong></div>
                <div className="stat-item">Faulty: <strong>3% (195)</strong></div>
              </div>
            )}
          </div>

          <div className="stat-section">
            <button 
              className="stat-dropdown-btn"
              onClick={() => setExpandCCMS(!expandCCMS)}
            >
              <span>🔌 CCMS Total: 134</span>
              <span className="arrow">{expandCCMS ? '▼' : '▶'}</span>
            </button>
            {expandCCMS && (
              <div className="stat-dropdown-content">
                <div className="stat-item">CCMS On: <strong>129</strong></div>
                <div className="stat-item">CCMS Off: <strong>3</strong></div>
                <div className="stat-item">CCMS Not Comm: <strong>2</strong></div>
                <div className="stat-item">CCMS Faulty: <strong>2</strong></div>
                <div className="stat-item">CCMS Working: <strong>97%</strong></div>
              </div>
            )}
          </div>

          {/* Control Lights - Operator & Admin Only */}
          {isOperator && (
            <button
              className={`tab-btn ${activeTab === 'control' ? 'active' : ''}`}
              onClick={() => setActiveTab('control')}
            >
              💡 Control Lights
            </button>
          )}

          {/* Map View - All Roles */}
          <button
            className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            🗺️ Map View
          </button>

          {/* Reports - All Roles */}
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📋 Reports
          </button>

          {/* Admin Only Section */}
          {isAdmin && (
            <div className="admin-section">
              <div className="section-divider"></div>
              <p className="section-label">👑 Admin Controls</p>
              <p style={{fontSize: '0.85rem', color: '#999', margin: '5px 0'}}>Full system control</p>
            </div>
          )}

          {/* Role Info */}
          <div className="role-info">
            <p style={{fontSize: '0.85rem', fontWeight: '600', margin: '10px 0 5px 0'}}>Your Role:</p>
            {isOperator && (
              <div style={{fontSize: '0.8rem', color: '#666'}}>
                <p>✅ Manage devices</p>
                <p>✅ Control lights</p>
                <p>✅ View reports</p>
              </div>
            )}
            {isViewer && (
              <div style={{fontSize: '0.8rem', color: '#666'}}>
                <p>👁️ View only access</p>
                <p>👁️ No edit permissions</p>
              </div>
            )}
            {isAdmin && (
              <div style={{fontSize: '0.8rem', color: '#666'}}>
                <p>✅ All permissions</p>
                <p>✅ User management</p>
                <p>✅ System settings</p>
              </div>
            )}
          </div>
        </div>

        <div className="main-content">
          {activeTab === 'overview' && <EnhancedDashboard key={refreshKey} city={user?.city} />}
          {activeTab === 'control' && isOperator && <LightControl city={user?.city} />}
          {activeTab === 'map' && <MapView city={user?.city} />}
          {activeTab === 'reports' && <Reports city={user?.city} />}
        </div>
      </div>

      {/* AI Chatbot Floating Button - Operator & Admin Only */}
      {isOperator && !chatbotOpen && (
        <button 
          className="ai-chat-float-btn" 
          onClick={() => setChatbotOpen(true)}
          title="Open Smart City Control AI"
        >
          💼
        </button>
      )}

      {/* AI Chatbot Modal */}
      {isOperator && <AIChatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />}
    </div>
  );
};

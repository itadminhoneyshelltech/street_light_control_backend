import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { lightService } from '../services/api';
import { Activity, Zap, AlertTriangle, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import '../styles/EnhancedDashboard.css';

interface Statistics {
  totalLights: number;
  lightsOn: number;
  lightsOff: number;
  lightsInError: number;
  lightsUnknown: number;
  energySavedTodayPercent: number;
  cumulativeEnergySavingKwh: number;
  totalCCMS: number;
  taskOn: number;
  taskOff: number;
  taskNotComm: number;
  faultyCCMS: number;
}

interface EnhancedDashboardProps {
  city?: string;
}

const fallbackStats: Statistics = {
  totalLights: 6527,
  lightsOn: 5577,
  lightsOff: 914,
  lightsInError: 195,
  lightsUnknown: 36,
  energySavedTodayPercent: 47.95,
  cumulativeEnergySavingKwh: 2413271,
  totalCCMS: 134,
  taskOn: 129,
  taskOff: 3,
  taskNotComm: 2,
  faultyCCMS: 2,
};

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ city }) => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Statistics>(fallbackStats);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchStats();
    const timeTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Auto-refresh stats every 5 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing dashboard stats...');
      fetchStats();
    }, 5000);
    
    // Listen for dashboard refresh events from AI Chatbot
    const handleRefresh = () => {
      console.log('Dashboard refreshing due to chatbot command...');
      fetchStats();
    };
    
    window.addEventListener('dashboardRefresh', handleRefresh);
    
    return () => {
      clearInterval(timeTimer);
      clearInterval(refreshInterval);
      window.removeEventListener('dashboardRefresh', handleRefresh);
    };
  }, [city]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await lightService.getCitySummary(city || user?.city);
      console.log('📊 Dashboard API Response:', data);
      console.log('📊 LightsOn value:', data.lights_on);
      console.log('📊 Total Lights:', data.total_lights);
      setStats({
        totalLights: data.total_lights ?? fallbackStats.totalLights,
        lightsOn: data.lights_on ?? fallbackStats.lightsOn,
        lightsOff: data.lights_off ?? fallbackStats.lightsOff,
        lightsInError: data.lights_in_error ?? fallbackStats.lightsInError,
        lightsUnknown: data.lights_unknown ?? data.unknown ?? fallbackStats.lightsUnknown,
        energySavedTodayPercent: data.energy_saved_today_percent ?? fallbackStats.energySavedTodayPercent,
        cumulativeEnergySavingKwh: data.cumulative_energy_saving_kwh ?? fallbackStats.cumulativeEnergySavingKwh,
        totalCCMS: data.total_ccms ?? fallbackStats.totalCCMS,
        taskOn: data.task_on ?? fallbackStats.taskOn,
        taskOff: data.task_off ?? fallbackStats.taskOff,
        taskNotComm: data.task_not_comm ?? data.not_comm ?? fallbackStats.taskNotComm,
        faultyCCMS: data.faulty_ccms ?? fallbackStats.faultyCCMS,
      });
      console.log('✅ Stats updated in state');
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      setStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const totalLights = stats?.totalLights ?? fallbackStats.totalLights;
  const lightsOn = stats?.lightsOn ?? fallbackStats.lightsOn;
  const lightsOff = stats?.lightsOff ?? fallbackStats.lightsOff;
  const lightsInError = stats?.lightsInError ?? fallbackStats.lightsInError;
  const lightsUnknown = stats?.lightsUnknown ?? fallbackStats.lightsUnknown;
  const energySavedTodayPercent = stats?.energySavedTodayPercent ?? fallbackStats.energySavedTodayPercent;
  const cumulativeEnergySavingKwh = stats?.cumulativeEnergySavingKwh ?? fallbackStats.cumulativeEnergySavingKwh;
  const totalCCMS = stats?.totalCCMS ?? fallbackStats.totalCCMS;
  const taskOn = stats?.taskOn ?? fallbackStats.taskOn;
  const taskOff = stats?.taskOff ?? fallbackStats.taskOff;
  const taskNotComm = stats?.taskNotComm ?? fallbackStats.taskNotComm;
  const faultyCCMS = stats?.faultyCCMS ?? fallbackStats.faultyCCMS;

  const energyStatus = calculatePercentage(lightsOn, totalLights);
  const workingPercent = calculatePercentage(totalLights - lightsInError - lightsUnknown, totalLights);
  const faultyPercent = calculatePercentage(lightsInError, totalLights);
  const unknownPercent = calculatePercentage(lightsUnknown, totalLights);
  const ccmsWorkingPercent = calculatePercentage(totalCCMS - faultyCCMS - taskNotComm, totalCCMS);

  if (loading) {
    return (
      <div className="enhanced-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="enhanced-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="city-info">
            <h1>{user?.city || 'City'} Smart Street Lighting</h1>
            <p className="subtitle">Centralized Control & Monitoring System</p>
          </div>
          <div className="header-stats">
            <div className="time-display">
              <Clock size={20} />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="date-display">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="main-stats-grid">
        {/* Total Lights Card */}
        <div className="stat-card-enhanced primary">
          <div className="card-icon">
            <Activity size={48} />
          </div>
          <div className="card-content">
            <h3>TOTAL STREET LIGHTS</h3>
            <div className="stat-number">{totalLights.toLocaleString()}</div>
            <div className="stat-label">Units Installed</div>
          </div>
          <div className="card-footer">
            <TrendingUp size={16} />
            <span>System Active</span>
          </div>
        </div>

        {/* Lights ON Card */}
        <div className="stat-card-enhanced success">
          <div className="card-icon">
            <Zap size={48} />
          </div>
          <div className="card-content">
            <h3>LIGHTS ON</h3>
            <div className="stat-number">{lightsOn.toLocaleString()}</div>
            <div className="stat-label">
              {calculatePercentage(lightsOn, totalLights)}% Active
            </div>
          </div>
          <div className="card-footer">
            <CheckCircle size={16} />
            <span>Operating</span>
          </div>
        </div>

        {/* Lights OFF Card */}
        <div className="stat-card-enhanced info">
          <div className="card-icon">
            <CheckCircle size={48} />
          </div>
          <div className="card-content">
            <h3>LIGHTS OFF</h3>
            <div className="stat-number">{lightsOff.toLocaleString()}</div>
            <div className="stat-label">
              {calculatePercentage(lightsOff, totalLights)}% Inactive
            </div>
          </div>
          <div className="card-footer">
            <CheckCircle size={16} />
            <span>Standby Mode</span>
          </div>
        </div>

        {/* Lights in Error Card */}
        <div className="stat-card-enhanced danger">
          <div className="card-icon">
            <AlertTriangle size={48} />
          </div>
          <div className="card-content">
            <h3>ALERTS & ERRORS</h3>
            <div className="stat-number">{lightsInError.toLocaleString()}</div>
            <div className="stat-label">
              {calculatePercentage(lightsInError, totalLights)}% Need Attention
            </div>
          </div>
          <div className="card-footer">
            <AlertTriangle size={16} />
            <span>Action Required</span>
          </div>
        </div>
      </div>

      {/* System Architecture Section */}
      <div className="system-architecture">
        <h2>System Architecture & Data Flow</h2>
        <div className="architecture-grid">
          {/* CCMS Control */}
          <div className="architecture-card">
            <div className="arch-icon">
              <Activity size={32} />
            </div>
            <h3>CCMS CONTROL</h3>
            <div className="arch-number">{stats?.totalLights || 0}</div>
            <p>Centralized Control Units</p>
            <div className="arch-status active">
              <div className="status-dot"></div>
              <span>Active</span>
            </div>
          </div>

          {/* Monitoring & Control */}
          <div className="architecture-card">
            <div className="arch-icon">
              <Zap size={32} />
            </div>
            <h3>MONITORING & CONTROL</h3>
            <div className="arch-number">{stats?.lightsOn || 0}</div>
            <p>Real-time Monitoring</p>
            <div className="arch-status active">
              <div className="status-dot"></div>
              <span>Live</span>
            </div>
          </div>

          {/* Data Transfer */}
          <div className="architecture-card">
            <div className="arch-icon">
              <TrendingUp size={32} />
            </div>
            <h3>DATA TRANSFER</h3>
            <div className="arch-number">24/7</div>
            <p>Continuous Communication</p>
            <div className="arch-status active">
              <div className="status-dot"></div>
              <span>Connected</span>
            </div>
          </div>

          {/* Cloud Services */}
          <div className="architecture-card">
            <div className="arch-icon">
              <CheckCircle size={32} />
            </div>
            <h3>CLOUD SERVICES</h3>
            <div className="arch-number">99.9%</div>
            <p>Uptime & Reliability</p>
            <div className="arch-status active">
              <div className="status-dot"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Consumption Section */}
      <div className="energy-section">
        <h2>Energy Consumption & Efficiency</h2>
        <div className="energy-grid">
          <div className="energy-card">
            <h3>Current Load</h3>
            <div className="energy-value">{energyStatus}%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${energyStatus}%` }}></div>
            </div>
            <p>System Utilization</p>
          </div>

          <div className="energy-card">
            <h3>Estimated Energy</h3>
            <div className="energy-value">{((stats?.lightsOn || 0) * 0.06).toFixed(2)} kW</div>
            <p>Current Consumption</p>
          </div>

          <div className="energy-card">
            <h3>System Health</h3>
            <div className="energy-value">
              {calculatePercentage((stats?.totalLights || 0) - (stats?.lightsInError || 0), stats?.totalLights || 0)}%
            </div>
            <p>Operational Status</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn primary">
            <Activity size={24} />
            <span>View All Lights</span>
          </button>
          <button className="action-btn success">
            <Zap size={24} />
            <span>Control Panel</span>
          </button>
          <button className="action-btn info">
            <TrendingUp size={24} />
            <span>Analytics</span>
          </button>
          <button className="action-btn danger">
            <AlertTriangle size={24} />
            <span>View Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};

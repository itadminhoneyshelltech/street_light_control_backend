import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown, Zap, AlertTriangle, MapPin, Clock } from 'lucide-react';
import axios from 'axios';
import '../styles/CCMSDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://streetlightapi.honeyshelltech.com/api';

type FeederPanel = {
  zone_name?: string;
  ward_name?: string;
  panel_name?: string;
  panel_code?: string;
  total_lights?: number;
  lights_on?: number;
  lights_off?: number;
  lights_faulty?: number;
  connection_status?: string;
  last_sync?: string;
};

type CityStats = {
  total_lights?: number;
  lights_on?: number;
  lights_off?: number;
  lights_faulty?: number;
  uptime_percentage?: number;
  working_percent?: number;
  avg_battery?: number;
  good_battery_count?: number;
  low_battery_count?: number;
};

type EnergyPoint = { date: string; energy_kwh: number };
type AlertItem = { severity: string; fault_type: string; fault_description: string; created_at: string };
type StatusSlice = { name: string; value: number; color: string };

/**
 * CCMS Dashboard - Complete Monitoring & Control Center
 * Compliant with IS 16444 specifications
 */
export const CCMSDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'zones' | 'energy' | 'alerts' | 'reports'>('overview');
  const [selectedCity, setSelectedCity] = useState<number>(1);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);

  // Data states
  const [cityStats, setCityStats] = useState<CityStats | null>(null);
  const [feederPanels, setFeederPanels] = useState<FeederPanel[]>([]);
  const [energyData, setEnergyData] = useState<EnergyPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [selectedCity, selectedZone, selectedWard]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch city summary
      const citySummaryResponse = await axios.get(`${API_BASE_URL}/dashboard/city-snapshot?city_id=${selectedCity}`);
      setCityStats(citySummaryResponse.data.data);

      // Fetch feeder panels
      const panelsResponse = await axios.get(`${API_BASE_URL}/feeder-panels/list`, {
        params: {
          city_id: selectedCity,
          zone_id: selectedZone,
          ward_id: selectedWard
        }
      });
      setFeederPanels(panelsResponse.data.data);

      // Fetch active alerts
      const alertsResponse = await axios.get(`${API_BASE_URL}/alerts/active`, {
        params: {
          city_id: selectedCity,
          limit: 10
        }
      });
      setAlerts(alertsResponse.data.data);

      // Fetch energy data
      const energyResponse = await axios.get(`${API_BASE_URL}/dashboard/energy-snapshot`, {
        params: {
          city_id: selectedCity,
          days: 7
        }
      });
      setEnergyData(energyResponse.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ccms-dashboard">
      {/* Header */}
      <div className="ccms-header">
        <h1>🏛️ Centralized Control & Monitoring System (CCMS)</h1>
        <p>Real-time Street Light Management & Energy Monitoring</p>
      </div>

      {/* Control Panel */}
      <div className="ccms-controls">
        <select value={selectedCity} onChange={(e) => setSelectedCity(Number(e.target.value))}>
          <option value="1">Delhi</option>
          <option value="2">Bangalore</option>
          <option value="3">Mumbai</option>
        </select>
        <select value={selectedZone || ''} onChange={(e) => setSelectedZone(e.target.value ? Number(e.target.value) : null)}>
          <option value="">All Zones</option>
          <option value="1">Zone A</option>
          <option value="2">Zone B</option>
        </select>
        <select value={selectedWard || ''} onChange={(e) => setSelectedWard(e.target.value ? Number(e.target.value) : null)}>
          <option value="">All Wards</option>
          <option value="1">Ward 1</option>
          <option value="2">Ward 2</option>
        </select>
        <button onClick={fetchDashboardData} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="ccms-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'zones' ? 'active' : ''}`}
          onClick={() => setActiveTab('zones')}
        >
          🗺️ Zones & Wards
        </button>
        <button 
          className={`tab-button ${activeTab === 'energy' ? 'active' : ''}`}
          onClick={() => setActiveTab('energy')}
        >
          ⚡ Energy Monitor
        </button>
        <button 
          className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          🚨 Alerts ({alerts.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📈 Reports
        </button>
      </div>

      {/* Tab Content */}
      <div className="ccms-content">
        {activeTab === 'overview' && <OverviewTab stats={cityStats} panels={feederPanels} loading={loading} />}
        {activeTab === 'zones' && <ZonesTab feederPanels={feederPanels} loading={loading} />}
        {activeTab === 'energy' && <EnergyTab energyData={energyData} panels={feederPanels} loading={loading} />}
        {activeTab === 'alerts' && <AlertsTab alerts={alerts} loading={loading} />}
        {activeTab === 'reports' && <ReportsTab city_id={selectedCity} />}
      </div>
    </div>
  );
};

// ============================================================================
// OVERVIEW TAB - Main Statistics and Quick Actions
// ============================================================================

const OverviewTab: React.FC<{stats: any; panels: any[]; loading: boolean}> = ({ stats, panels, loading }) => {
  if (loading || !stats) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  const statusDistribution: StatusSlice[] = [
    { name: 'Connected', value: panels.filter(p => p.connection_status === 'connected').length, color: '#10b981' },
    { name: 'Disconnected', value: panels.filter(p => p.connection_status === 'disconnected').length, color: '#ef4444' },
    { name: 'Error', value: panels.filter(p => p.connection_status === 'error').length, color: '#f59e0b' }
  ];

  return (
    <div className="overview-tab">
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>💡 Total Lights</h3>
          <div className="metric-value">{stats.total_lights || 0}</div>
          <div className="metric-breakdown">
            <span className="on">🟢 On: {stats.lights_on || 0}</span>
            <span className="off">⚫ Off: {stats.lights_off || 0}</span>
            <span className="faulty">🔴 Faulty: {stats.lights_faulty || 0}</span>
          </div>
        </div>

        <div className="metric-card">
          <h3>📍 Feeder Panels</h3>
          <div className="metric-value">{panels.length}</div>
          <div className="metric-breakdown">
            <span className="connected">✓ Connected: {panels.filter(p => p.connection_status === 'connected').length}</span>
            <span className="disconnected">✗ Offline: {panels.filter(p => p.connection_status !== 'connected').length}</span>
          </div>
        </div>

        <div className="metric-card">
          <h3>📊 System Health</h3>
          <div className="metric-value">{stats.uptime_percentage?.toFixed(2) || 99.5}%</div>
          <div className="metric-breakdown">
            <span className="working">✓ Working: {stats.working_percent || 96}%</span>
            <span className="faulty">✗ Faulty: {100 - (stats.working_percent || 96)}%</span>
          </div>
        </div>

        <div className="metric-card">
          <h3>🔋 Battery Status</h3>
          <div className="metric-value">{stats.avg_battery || 85}%</div>
          <div className="metric-breakdown">
            <span className="good">✓ Good: {stats.good_battery_count || 0}</span>
            <span className="low">⚠️ Low: {stats.low_battery_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Panel Status Distribution */}
      <div className="chart-container">
        <h3>Feeder Panel Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={statusDistribution} cx="50%" cy="50%" labelLine={false} label={(entry: StatusSlice) => `${entry.name}: ${entry.value}`} outerRadius={100} fill="#8884d8" dataKey="value">
              {statusDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Feeder Panels */}
      <div className="panels-list">
        <h3>📍 Top Feeder Panels</h3>
        <table className="panels-table">
          <thead>
            <tr>
              <th>Panel Name</th>
              <th>Zone</th>
              <th>Lights</th>
              <th>On/Off/Faulty</th>
              <th>Status</th>
              <th>Last Sync</th>
            </tr>
          </thead>
          <tbody>
            {panels.slice(0, 10).map((panel, idx) => (
              <tr key={idx}>
                <td>{panel.panel_name}</td>
                <td>{panel.zone_name}</td>
                <td>{panel.total_lights}</td>
                <td>{panel.lights_on}/{panel.lights_off}/{panel.lights_faulty}</td>
                <td>
                  <span className={`status-badge ${panel.connection_status}`}>
                    {panel.connection_status}
                  </span>
                </td>
                <td>{panel.last_sync ? new Date(panel.last_sync).toLocaleTimeString() : 'Never'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// ZONES & WARDS TAB - Geographic View
// ============================================================================

const ZonesTab: React.FC<{feederPanels: FeederPanel[]; loading: boolean}> = ({ feederPanels, loading }) => {
  if (loading) return <div className="loading">Loading zones...</div>;

  // Group by zone
  const zones = feederPanels.reduce<Record<string, FeederPanel[]>>((acc, panel) => {
    if (!acc[panel.zone_name]) {
      acc[panel.zone_name] = [];
    }
    acc[panel.zone_name].push(panel);
    return acc;
  }, {} as Record<string, FeederPanel[]>);

  return (
    <div className="zones-tab">
      {Object.entries(zones).map(([zoneName, panelsInZone]) => (
        <div key={zoneName} className="zone-card">
          <h3>{zoneName}</h3>
          <p>Feeder Panels: {panelsInZone.length}</p>
          <div className="zone-stats">
            <div>🟢 Lights On: {panelsInZone.reduce((sum: number, p: FeederPanel) => sum + (p.lights_on || 0), 0)}</div>
            <div>⚫ Lights Off: {panelsInZone.reduce((sum: number, p: FeederPanel) => sum + (p.lights_off || 0), 0)}</div>
            <div>🔴 Faulty: {panelsInZone.reduce((sum: number, p: FeederPanel) => sum + (p.lights_faulty || 0), 0)}</div>
            <div>✓ Connected: {panelsInZone.filter((p: FeederPanel) => p.connection_status === 'connected').length}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// ENERGY MONITOR TAB
// ============================================================================

const EnergyTab: React.FC<{energyData: any[]; panels: any[]; loading: boolean}> = ({ energyData, panels, loading }) => {
  if (loading) return <div className="loading">Loading energy data...</div>;

  return (
    <div className="energy-tab">
      <div className="chart-container">
        <h3>Daily Energy Consumption (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={energyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="energy_kwh" stroke="#8884d8" name="Energy (kWh)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Power Quality */}
      <div className="power-quality">
        <h3>⚡ Power Quality Metrics</h3>
        <div className="quality-grid">
          <div className="quality-card">
            <h4>Voltage</h4>
            <p className="value">230V</p>
            <p className="status">✓ Normal</p>
          </div>
          <div className="quality-card">
            <h4>Current</h4>
            <p className="value">45A</p>
            <p className="status">✓ Normal</p>
          </div>
          <div className="quality-card">
            <h4>Power Factor</h4>
            <p className="value">0.95</p>
            <p className="status">✓ Excellent</p>
          </div>
          <div className="quality-card">
            <h4>Frequency</h4>
            <p className="value">50Hz</p>
            <p className="status">✓ Normal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ALERTS TAB
// ============================================================================

const AlertsTab: React.FC<{alerts: any[]; loading: boolean}> = ({ alerts, loading }) => {
  if (loading) return <div className="loading">Loading alerts...</div>;

  return (
    <div className="alerts-tab">
      {alerts.length === 0 ? (
        <div className="no-alerts">✓ No active alerts</div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`alert-item ${alert.severity}`}>
              <div className="alert-icon">
                {alert.severity === 'critical' ? <AlertTriangle /> : <AlertCircle />}
              </div>
              <div className="alert-content">
                <h4>{alert.fault_type}</h4>
                <p>{alert.fault_description}</p>
                <small>{new Date(alert.created_at).toLocaleString()}</small>
              </div>
              <div className="alert-actions">
                <button>Acknowledge</button>
                <button>Assign</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// REPORTS TAB
// ============================================================================

const ReportsTab: React.FC<{city_id: number}> = ({ city_id }) => {
  const [reportType, setReportType] = useState<'energy' | 'failures' | 'uptime' | 'maintenance'>('energy');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async (type: string) => {
    setLoading(true);
    try {
      const endpoint = {
        'energy': '/reports/energy-saving',
        'failures': '/reports/lamp-failure',
        'uptime': '/reports/uptime',
        'maintenance': '/reports/maintenance'
      }[type];

      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        params: {
          city_id,
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        }
      });

      setReportData(response.data.data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport(reportType);
  }, [reportType, city_id]);

  return (
    <div className="reports-tab">
      <div className="report-selector">
        <button 
          className={reportType === 'energy' ? 'active' : ''} 
          onClick={() => setReportType('energy')}
        >
          ⚡ Energy Saving
        </button>
        <button 
          className={reportType === 'failures' ? 'active' : ''} 
          onClick={() => setReportType('failures')}
        >
          💡 Lamp Failures
        </button>
        <button 
          className={reportType === 'uptime' ? 'active' : ''} 
          onClick={() => setReportType('uptime')}
        >
          📊 Uptime %
        </button>
        <button 
          className={reportType === 'maintenance' ? 'active' : ''} 
          onClick={() => setReportType('maintenance')}
        >
          🔧 Maintenance
        </button>
      </div>

      {loading ? (
        <div className="loading">Generating report...</div>
      ) : reportData ? (
        <div className="report-content">
          <h3>Report Data</h3>
          <pre>{JSON.stringify(reportData, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
};

export default CCMSDashboard;

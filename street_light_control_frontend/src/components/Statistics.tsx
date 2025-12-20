import React, { useEffect, useState } from 'react';
import { lightService } from '../services/api';
import { Users, Lightbulb, AlertCircle } from 'lucide-react';
import '../styles/Statistics.css';

interface Statistics {
  totalLights: number;
  lightsOn: number;
  lightsOff: number;
  lightsInError: number;
}

interface StatisticsProps {
  city?: string;
}

export const Statistics: React.FC<StatisticsProps> = ({ city }) => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [city]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await lightService.getCitySummary(city);
      setStats({
        totalLights: data.total_lights || data.totalLights || 0,
        lightsOn: data.lights_on || data.lightsOn || 0,
        lightsOff: data.lights_off || data.lightsOff || 0,
        lightsInError: data.lights_in_error || data.lightsInError || 0,
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      setStats({
        totalLights: 0,
        lightsOn: 0,
        lightsOff: 0,
        lightsInError: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading statistics...</div>;

  return (
    <div className="statistics-container">
      <h2>City Summary</h2>
      <div className="stats-grid">
        <div className="stat-card total">
          <Users size={32} />
          <div className="stat-content">
            <span className="stat-label">Total Lights</span>
            <span className="stat-value">{stats?.totalLights || 0}</span>
          </div>
        </div>

        <div className="stat-card on">
          <Lightbulb size={32} className="icon-on" />
          <div className="stat-content">
            <span className="stat-label">Lights ON</span>
            <span className="stat-value">{stats?.lightsOn || 0}</span>
          </div>
        </div>

        <div className="stat-card off">
          <Lightbulb size={32} className="icon-off" />
          <div className="stat-content">
            <span className="stat-label">Lights OFF</span>
            <span className="stat-value">{stats?.lightsOff || 0}</span>
          </div>
        </div>

        <div className="stat-card error">
          <AlertCircle size={32} className="icon-error" />
          <div className="stat-content">
            <span className="stat-label">In Error</span>
            <span className="stat-value">{stats?.lightsInError || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { lightService } from '../services/api';
import { Power, AlertCircle } from 'lucide-react';
import '../styles/LightControl.css';

interface Light {
  id?: string;
  _id?: string;
  light_id?: string;
  lightId?: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  address: string;
  status: 'on' | 'off' | 'error';
  last_status_change?: string;
  lastStatusChange?: string;
  error_details?: string;
  errorDetails?: string;
}

interface LightControlProps {
  city?: string;
}

export const LightControl: React.FC<LightControlProps> = ({ city }) => {
  const { user } = useAuthStore();
  const [lights, setLights] = useState<Light[]>([]);
  const [loading, setLoading] = useState(true);
  const [controlling, setControlling] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [activeFilters, setActiveFilters] = useState<any>({
    state: '',
    district: '',
    taluk: '',
    ward: '',
    status: '',
  });

  useEffect(() => {
    fetchLights();
    fetchFilterOptions();
  }, [city]);

  useEffect(() => {
    fetchLights();
  }, [activeFilters, city]);

  const fetchFilterOptions = async () => {
    try {
      const options = await lightService.getFilters(city);
      setFilterOptions(options);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const fetchLights = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([_, v]) => v)
      );
      const data = await lightService.getLights(city, cleanFilters);
      setLights(data);
    } catch (error) {
      console.error('Failed to fetch lights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleControl = async (lightId: string, action: 'on' | 'off') => {
    if (user?.role === 'viewer') {
      alert('You do not have permission to control lights');
      return;
    }

    try {
      setControlling(lightId);
      await lightService.controlLight(lightId, action);
      await fetchLights(); // Refresh list
    } catch (error) {
      console.error('Failed to control light:', error);
      alert('Failed to control light');
    } finally {
      setControlling(null);
    }
  };

  if (loading) return <div className="loading">Loading lights...</div>;

  if (!Array.isArray(lights)) {
    return <div className="loading">No lights data available</div>;
  }

  return (
    <div className="light-control-container">
      <h2>Street Lights Status</h2>

      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select
          value={activeFilters.state}
          onChange={(e) => setActiveFilters({ ...activeFilters, state: e.target.value })}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">All States</option>
          {(filterOptions.states || []).map((s: string) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={activeFilters.district}
          onChange={(e) => setActiveFilters({ ...activeFilters, district: e.target.value })}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">All Districts</option>
          {(filterOptions.districts || []).map((d: string) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={activeFilters.taluk}
          onChange={(e) => setActiveFilters({ ...activeFilters, taluk: e.target.value })}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">All Taluks</option>
          {(filterOptions.taluks || []).map((t: string) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={activeFilters.ward}
          onChange={(e) => setActiveFilters({ ...activeFilters, ward: e.target.value })}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">All Wards</option>
          {(filterOptions.wards || []).map((w: string) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
        <select
          value={activeFilters.status}
          onChange={(e) => setActiveFilters({ ...activeFilters, status: e.target.value })}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">All Statuses</option>
          {(filterOptions.statuses || []).map((st: string) => (
            <option key={st} value={st}>{st.toUpperCase()}</option>
          ))}
        </select>
        <button
          onClick={() => setActiveFilters({ state: '', district: '', taluk: '', ward: '', status: '' })}
          style={{
            padding: '6px 14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            background: '#f44336',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Clear Filters
        </button>
      </div>

      <div className="lights-grid">
        {lights.map((light) => {
          const rawId = light.id || light._id || light.light_id || light.lightId;
          const lightId = typeof rawId === 'number' ? String(rawId) : (rawId || '');
          const displayName = light.name || light.light_id || light.lightId || lightId || 'Unknown Light';
          return (
            <div key={lightId} className={`light-card ${light.status}`}>
              <div className="light-header">
                <h3>{displayName}</h3>
                <div className={`status-badge ${light.status}`}>
                  {light.status.toUpperCase()}
                </div>
              </div>

              <div className="light-details">
                <p>
                  <strong>Location:</strong> {light.address}
                </p>
                <p>
                  <strong>City:</strong> {light.city}
                </p>
                {lightId && (
                  <p>
                    <strong>ID:</strong> {lightId}
                  </p>
                )}
                {(light as any).battery_percentage !== undefined && (
                  <p>
                    <strong>Battery:</strong> {(light as any).battery_percentage}%
                  </p>
                )}
                {light.last_status_change && (
                  <p>
                    <strong>Last Updated:</strong>{' '}
                    {new Date(light.last_status_change).toLocaleString()}
                  </p>
                )}
                {(light.error_details || light.errorDetails) && (
                  <p className="error-details">
                    <AlertCircle size={16} /> {light.error_details || light.errorDetails}
                  </p>
                )}
              </div>

              {user?.role !== 'viewer' && light.status !== 'error' && (
                <div className="light-controls">
                  <button
                    className="btn btn-on"
                    onClick={() => handleControl((light.light_id || light.lightId || lightId), 'on')}
                    disabled={controlling === lightId || light.status === 'on'}
                  >
                    <Power size={16} /> ON
                  </button>
                  <button
                    className="btn btn-off"
                    onClick={() => handleControl((light.light_id || light.lightId || lightId), 'off')}
                    disabled={controlling === lightId || light.status === 'off'}
                  >
                    <Power size={16} /> OFF
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

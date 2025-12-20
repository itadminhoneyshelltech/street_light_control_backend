import React, { useEffect, useState, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { lightService } from '../services/api';
import '../styles/MapView.css';

// Static libraries array to prevent LoadScript reload warnings
const GOOGLE_MAP_LIBRARIES = ['places', 'geometry'];

interface Light {
  light_id?: string;
  lightId?: string;
  name: string;
  city?: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: 'on' | 'off' | 'error';
}

interface MapViewProps {
  city?: string;
}

// Memoize the LoadScript wrapper to prevent multiple instances
interface MapWrapperProps {
  apiKey: string;
  children: React.ReactNode;
  onError?: (error: string) => void;
}

const MapWrapper: React.FC<MapWrapperProps> = ({ apiKey, children, onError }) => {
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const [scriptError, setScriptError] = React.useState(false);

  // Validate API key format
  if (!apiKey || apiKey.length < 10) {
    console.error('Invalid API key format or too short');
    setScriptError(true);
    onError?.('Invalid API key');
    return null;
  }

  return (
    <LoadScript 
      googleMapsApiKey={apiKey}
      libraries={GOOGLE_MAP_LIBRARIES}
      preventGoogleFontsLoading
      onLoad={() => {
        console.log('Google Maps script loaded successfully');
        setScriptLoaded(true);
      }}
      onError={(error) => {
        console.error('Failed to load Google Maps script:', error);
        setScriptError(true);
        onError?.(`Failed to load Google Maps: ${error?.message || 'Unknown error'}`);
      }}
    >
      {scriptLoaded && !scriptError ? children : (
        <div style={{ padding: '20px', color: '#d32f2f' }}>
          Loading Google Maps... {scriptError ? 'Failed to load' : 'Please wait'}
        </div>
      )}
    </LoadScript>
  );
};

export const MapView: React.FC<MapViewProps> = ({ city }) => {
  const [lights, setLights] = useState<Light[]>([]);
  const [selectedLight, setSelectedLight] = useState<Light | null>(null);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.209 });
  const [mapError, setMapError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [activeFilters, setActiveFilters] = useState<any>({
    state: '',
    district: '',
    taluk: '',
    ward: '',
    status: '',
  });

  useEffect(() => {
    fetchFilterOptions();
  }, [city]);

  useEffect(() => {
    fetchMapData();
  }, [activeFilters, city]);

  const fetchFilterOptions = async () => {
    try {
      const options = await lightService.getFilters(city);
      setFilterOptions(options);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([_, v]) => v)
      );
      const data = await lightService.getLightsForMap(city, cleanFilters);
      if (Array.isArray(data) && data.length > 0) {
        setLights(data as Light[]);
        setCenter({
          lat: Number(data[0].latitude),
          lng: Number(data[0].longitude),
        });
      } else {
        setLights([]);
      }
    } catch (error) {
      console.error('Failed to fetch map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'on':
        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'off':
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      case 'error':
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      default:
        return 'http://maps.google.com/mapfiles/ms/icons/gray-dot.png';
    }
  };

  if (loading) return <div className="loading">Loading map...</div>;

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'EMPTY');

  if (!apiKey) {
    return (
      <div className="map-container">
        <h2>Street Lights Map</h2>
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
        <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '5px', marginBottom: '20px' }}>
          ⚠️ Google Maps API key is not configured or invalid. Using fallback display.
          <br/>
          <small>Check <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a> to enable Maps JavaScript API and verify the key in .env file.</small>
        </div>
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3>📍 Street Lights List</h3>
          {lights.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginTop: '10px' }}>
              {lights.map((light) => (
                <div key={light.light_id || light.lightId} style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${light.status === 'on' ? '#FFD700' : light.status === 'off' ? '#4169E1' : '#DC143C'}`,
                }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>{light.name}</h4>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#666' }}>
                    📍 {light.address || 'No address'}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                    <strong>Status:</strong> <span style={{
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: light.status === 'on' ? '#FFD700' : light.status === 'off' ? '#4169E1' : '#DC143C',
                      color: 'white',
                      fontSize: '0.8rem',
                    }}>
                      {light.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              <p>No lights found for selected filters</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="map-container">
        <h2>Street Lights Map</h2>
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
        <div style={{ padding: '20px', backgroundColor: '#f8d7da', borderRadius: '5px', marginBottom: '20px' }}>
          ❌ Error loading map: {mapError}. Using fallback map.
        </div>
        <iframe
          src={process.env.REACT_APP_MAP_PLACEHOLDER_URL || '/map-sample.html'}
          style={{
            width: '100%',
            height: '600px',
            border: 'none',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
          title="Map View"
        />
      </div>
    );
  }

  return (
    <div className="map-container">
      <h2>Street Lights Map</h2>

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

      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          <p>Loading filtered data...</p>
        </div>
      )}

      <div className="map-legend">
        <span className="legend-item on">🟡 Lights ON</span>
        <span className="legend-item off">🔵 Lights OFF</span>
        <span className="legend-item error">🔴 In Error</span>
      </div>

      <MapWrapper apiKey={apiKey} onError={(error) => setMapError(error)}>
        <GoogleMap
          mapContainerClassName="map"
          center={center}
          zoom={12}
          onLoad={() => {
            console.log('✅ Google Map loaded successfully');
          }}
          onError={(error: any) => {
            console.error('❌ Google Map error:', error);
            setMapError(`Map initialization error: ${error?.message || 'Unknown error'}`);
          }}
          options={{
            restriction: {
              latLngBounds: {
                north: 45.5,
                south: 11.5,
                east: 113.5,
                west: 60.5,
              },
            },
            disableDefaultUI: false,
            fullscreenControl: true,
            zoomControl: true,
            mapTypeControl: true,
          }}
        >
          {lights && lights.length > 0 ? (
            <>
              {lights.map((light) => (
                <Marker
                  key={light.light_id || light.lightId || light.name}
                  position={{
                    lat: Number(light.latitude),
                    lng: Number(light.longitude),
                  }}
                  icon={getMarkerColor(light.status)}
                  onClick={() => setSelectedLight(light)}
                  title={light.name}
                />
              ))}

              {selectedLight && (
                <InfoWindow
                  position={{
                    lat: Number(selectedLight.latitude),
                    lng: Number(selectedLight.longitude),
                  }}
                  onCloseClick={() => setSelectedLight(null)}
                >
                  <div className="info-window">
                    <h4>{selectedLight.name}</h4>
                    <p>Status: <strong>{selectedLight.status.toUpperCase()}</strong></p>
                    {selectedLight.address && <p>{selectedLight.address}</p>}
                  </div>
                </InfoWindow>
              )}
            </>
          ) : (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              zIndex: 10,
            }}>
              <p>No lights data available</p>
            </div>
          )}
        </GoogleMap>
      </MapWrapper>
    </div>
  );
};

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

  useEffect(() => {
  }, [city]);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const data = await lightService.getLightsForMap(city, {});
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
    fetchMapData();
  }, [city]);

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
      </div>
    );
    }

  // Calculate stats for lamps and CCMS/UIDs
  // Example data for demonstration (replace with live data as needed)
  const totalLamps = 6527;
  const lampsOn = 6520;
  const lampsOff = 6;
  const lampsNotConn = 1; // unknown
  const lampsError = Math.round(totalLamps * 0.01); // 1% faulty
  const lampsWorkingPct = totalLamps > 0 ? Math.round(((totalLamps - lampsError) / totalLamps) * 100) : 0;

  // Simulated CCMS/UID stats (replace with real data if available)
  const totalCCMS = 134;
  const ccmsOn = 129;
  const ccmsOff = 3;
  const ccmsNotComm = 2;
  const ccmsWorkingPct = Math.round(((totalCCMS - 2) / totalCCMS) * 100);

  return (
    <div className="map-container">
      {/* Summary Row with Left, Center, Right Alignment */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        gap: '2rem',
        boxSizing: 'border-box',
        padding: '0 12px',
      }}>
        {/* Left: Lamp status donut chart and labels, left-aligned */}
        <div style={{ flex: 1, minWidth: 260, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(34,197,94,0.13)', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch', border: '1px solid #bbf7d0', height: 370 }}>
          {/* Green header with total lamps */}
          <div style={{ background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)', color: '#fff', fontWeight: 700, fontSize: 22, letterSpacing: 1, padding: '10px 0 8px 0', borderTopLeftRadius: 8, borderTopRightRadius: 8, textAlign: 'center', borderBottom: '2px solid #bbf7d0' }}>
            TOTAL LAMPS <span style={{ fontSize: 28, fontWeight: 900, marginLeft: 12, background: '#166534', padding: '2px 16px', borderRadius: 4, letterSpacing: 2 }}>{totalLamps}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: '18px 10px 18px 10px', gap: 18 }}>
            {/* Donut chart with percent in center */}
            <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                {(() => {
                  const r = 60;
                  const cx = 70, cy = 70;
                  const total = totalLamps || 1;
                  const data = [
                    { value: lampsOn, color: '#00bcd4', animate: true },
                    { value: lampsOff, color: '#ffb300', animate: true },
                    { value: lampsNotConn, color: '#8e24aa', animate: false },
                    { value: lampsError, color: '#e53935', animate: false },
                  ];
                  let acc = 0;
                  return data.map((d, i) => {
                    const start = acc;
                    const angle = (d.value / total) * 360;
                    acc += angle;
                    const large = angle > 180 ? 1 : 0;
                    const rad = (deg) => (Math.PI / 180) * deg;
                    const x1 = cx + r * Math.cos(rad(start - 90));
                    const y1 = cy + r * Math.sin(rad(start - 90));
                    const x2 = cx + r * Math.cos(rad(start + angle - 90));
                    const y2 = cy + r * Math.sin(rad(start + angle - 90));
                    return (
                      <path
                        key={i}
                        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
                        fill={d.color}
                        stroke="#fff"
                        strokeWidth="2"
                        style={d.animate ? { filter: 'url(#glow)', opacity: 0.7, transition: 'opacity 0.7s', animation: `lightAnim${i} 1.2s infinite alternate` } : {}}
                      />
                    );
                  });
                })()}
                {/* Donut hole */}
                <circle cx="70" cy="70" r="44" fill="#fff" />
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <style>{`
                    @keyframes lightAnim0 {
                      0% { opacity: 0.7; }
                      100% { opacity: 1; }
                    }
                    @keyframes lightAnim1 {
                      0% { opacity: 0.7; }
                      100% { opacity: 1; }
                    }
                  `}</style>
                </defs>
              </svg>
              {/* Percent in center */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: 140, height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ color: 'green', fontWeight: 700, fontSize: 36, lineHeight: 1 }}>{lampsWorkingPct}%</span>
                <span style={{ color: 'green', fontWeight: 500, fontSize: 18, letterSpacing: 1 }}>WORKING</span>
              </div>
            </div>
            {/* Status labels */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, marginLeft: 18, minWidth: 90 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 32, background: '#00bcd4', display: 'inline-block', borderRadius: 2 }}></span>
                <span style={{ color: '#00bcd4', fontWeight: 700, fontSize: 22 }}>{lampsOn}</span>
                <span style={{ color: '#333', fontWeight: 500, fontSize: 16 }}>On</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 32, background: '#ffb300', display: 'inline-block', borderRadius: 2 }}></span>
                <span style={{ color: '#ffb300', fontWeight: 700, fontSize: 22 }}>{lampsOff}</span>
                <span style={{ color: '#333', fontWeight: 500, fontSize: 16 }}>Off</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 32, background: '#8e24aa', display: 'inline-block', borderRadius: 2 }}></span>
                <span style={{ color: '#8e24aa', fontWeight: 700, fontSize: 22 }}>{lampsNotConn}</span>
                <span style={{ color: '#333', fontWeight: 500, fontSize: 16 }}>Unknown</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 32, background: '#e53935', display: 'inline-block', borderRadius: 2 }}></span>
                <span style={{ color: '#e53935', fontWeight: 700, fontSize: 22 }}>{lampsError}</span>
                <span style={{ color: '#333', fontWeight: 500, fontSize: 16 }}>Faulty</span>
                <span style={{ color: '#e53935', fontWeight: 700, fontSize: 16, marginLeft: 4 }}>({Math.round((lampsError/totalLamps)*100)}%)</span>
              </div>
            </div>
          </div>
        </div>
        {/* Center: Energy Saved and Cumulative Saving (image style) */}
        <div style={{ minWidth: 320, maxWidth: 400, flex: 1, background: 'linear-gradient(135deg, #bbf7d0 0%, #fff 100%)', borderRadius: 16, boxShadow: '0 4px 16px rgba(34,197,94,0.10)', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #bbf7d0', justifyContent: 'center', height: 370, position: 'relative', overflow: 'hidden' }}>
          {/* Decorative background */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: '#22c55e', opacity: 0.12, borderRadius: '50%' }}></div>
          {/* Main content */}
          <div style={{ zIndex: 1, width: '100%', textAlign: 'center', padding: '32px 0 0 0' }}>
            <div style={{ color: '#22c55e', fontWeight: 900, fontSize: 48, letterSpacing: 1, marginBottom: 0 }}>47.53%</div>
            <div style={{ fontWeight: 500, fontSize: 22, color: '#166534', marginBottom: 18 }}>Energy Saved Today</div>
            <div style={{ background: '#d6d600', color: '#333', fontWeight: 700, fontSize: 32, borderRadius: 8, display: 'inline-block', padding: '12px 32px', marginBottom: 8, boxShadow: '0 2px 8px rgba(214,214,0,0.08)' }}>
              24,35,570
            </div>
            <div style={{ fontWeight: 500, fontSize: 18, color: '#333', marginTop: 2 }}>Cumulative Energy Saving (kWh)</div>
          </div>
        </div>
        {/* Right: CCMS/UID stats */}
        <div style={{ flex: 1, minWidth: 260, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(34,197,94,0.13)', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch', border: '1px solid #bbf7d0', height: 370 }}>
          {/* Green header with total CCMS/UID */}
          <div style={{ background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)', color: '#fff', fontWeight: 700, fontSize: 22, letterSpacing: 1, padding: '10px 0 8px 0', borderTopLeftRadius: 8, borderTopRightRadius: 8, textAlign: 'center', borderBottom: '2px solid #bbf7d0' }}>
            TOTAL CCMS (UID) <span style={{ fontSize: 28, fontWeight: 900, marginLeft: 12, background: '#166534', padding: '2px 16px', borderRadius: 4, letterSpacing: 2 }}>{totalCCMS}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: '18px 10px 18px 10px', gap: 18 }}>
            {/* Donut chart with percent in center */}
            <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                {(() => {
                  const r = 60;
                  const cx = 70, cy = 70;
                  const total = totalCCMS || 1;
                  const data = [
                    { value: ccmsOn, color: '#00bcd4', animate: true },
                    { value: ccmsOff, color: '#ffb300', animate: true },
                    { value: ccmsNotComm, color: '#8e24aa', animate: false },
                  ];
                  let acc = 0;
                  return data.map((d, i) => {
                    const start = acc;
                    const angle = (d.value / total) * 360;
                    acc += angle;
                    const large = angle > 180 ? 1 : 0;
                    const rad = (deg) => (Math.PI / 180) * deg;
                    const x1 = cx + r * Math.cos(rad(start - 90));
                    const y1 = cy + r * Math.sin(rad(start - 90));
                    const x2 = cx + r * Math.cos(rad(start + angle - 90));
                    const y2 = cy + r * Math.sin(rad(start + angle - 90));
                    return (
                      <path
                        key={i}
                        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
                        fill={d.color}
                        stroke="#fff"
                        strokeWidth="2"
                        style={d.animate ? { filter: 'url(#glow)', opacity: 0.7, transition: 'opacity 0.7s', animation: `lightAnim${i} 1.2s infinite alternate` } : {}}
                      />
                    );
                  });
                })()}
                {/* Donut hole */}
                <circle cx="70" cy="70" r="44" fill="#fff" />
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <style>{`
                    @keyframes lightAnim0 {
                      0% { opacity: 0.7; }
                      100% { opacity: 1; }
                    }
                    @keyframes lightAnim1 {
                      0% { opacity: 0.7; }
                      100% { opacity: 1; }
                    }
                  `}</style>
                </defs>
              </svg>
              {/* Percent in center */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: 140, height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 36, lineHeight: 1 }}>{ccmsWorkingPct}%</span>
                <span style={{ color: '#22c55e', fontWeight: 500, fontSize: 18, letterSpacing: 1 }}>WORKING</span>
              </div>
            </div>
            {/* Status labels */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, marginLeft: 18, minWidth: 90 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 32, background: '#00bcd4', display: 'inline-block', borderRadius: 2 }}></span>
                <span style={{ color: '#00bcd4', fontWeight: 700, fontSize: 22 }}>{ccmsOn}</span>
                <span style={{ color: '#333', fontWeight: 500, fontSize: 16 }}>UID On</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 32, background: '#ffb300', display: 'inline-block', borderRadius: 2 }}></span>
                <span style={{ color: '#ffb300', fontWeight: 700, fontSize: 22 }}>{ccmsOff}</span>
                <span style={{ color: '#333', fontWeight: 500, fontSize: 16 }}>UID Off</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 32, background: '#8e24aa', display: 'inline-block', borderRadius: 2 }}></span>
                <span style={{ color: '#8e24aa', fontWeight: 700, fontSize: 22 }}>{ccmsNotComm}</span>
                <span style={{ color: '#333', fontWeight: 500, fontSize: 16 }}>Not Comm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters removed as per request */}

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

      {/* Map legend removed as per request */}

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
}

export default MapView;

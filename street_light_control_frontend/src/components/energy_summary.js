import React from 'react';

interface EnergySummaryProps {
  energySavedPct: number;
}

const EnergySummary: React.FC<EnergySummaryProps> = ({ energySavedPct }) => (
  <div style={{ minWidth: 320, maxWidth: 400, flex: 1, background: 'linear-gradient(135deg, #bbf7d0 0%, #fff 100%)', borderRadius: 16, boxShadow: '0 4px 16px rgba(34,197,94,0.10)', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 370, position: 'relative' }}>
    <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: '#22c55e', opacity: 0.12, borderRadius: '50%' }}></div>
    <div style={{ zIndex: 1, width: '100%', textAlign: 'center', padding: '32px 0 0 0' }}>
      <div style={{ color: '#22c55e', fontWeight: 900, fontSize: 48, letterSpacing: 1, marginBottom: 0 }}>{energySavedPct}%</div>
      <div style={{ fontWeight: 500, fontSize: 22, color: '#166534', marginBottom: 18 }}>Energy Saved Today</div>
    </div>
  </div>
);

export default EnergySummary;

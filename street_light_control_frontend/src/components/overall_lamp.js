import React from 'react';

interface OverallLampProps {
  totalLamps: number;
  lampsOn: number;
  lampsOff: number;
  lampsNotConn: number;
  lampsError: number;
  lampsWorkingPct: number;
}

const OverallLamp: React.FC<OverallLampProps> = ({
  totalLamps,
  lampsOn,
  lampsOff,
  lampsNotConn,
  lampsError,
  lampsWorkingPct,
}) => (
  <div style={{ flex: 1, minWidth: 260, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(34,197,94,0.13)', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch', border: '1px solid #bbf7d0', height: 370 }}>
    <div style={{ background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)', color: '#fff', fontWeight: 700, fontSize: 22, letterSpacing: 1, padding: '10px 0 8px 0', borderTopLeftRadius: 8, borderTopRightRadius: 8, textAlign: 'center', borderBottom: '2px solid #bbf7d0' }}>
      TOTAL LAMPS <span style={{ fontSize: 28, fontWeight: 900, marginLeft: 12, background: '#166534', padding: '2px 16px', borderRadius: 4, letterSpacing: 2 }}>{totalLamps}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: '18px 10px 18px 10px', gap: 18 }}>
      <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Donut chart and stats here (copy from MapView.tsx) */}
      </div>
      {/* Status labels here (copy from MapView.tsx) */}
    </div>
  </div>
);

export default OverallLamp;

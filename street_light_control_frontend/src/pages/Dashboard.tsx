import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Navbar } from '../components/Navbar';
import { MapView } from '../components/MapView';
import { Reports } from '../components/Reports';
import { AIChatbot } from '../components/AIChatbot';
import '../styles/Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  // Map is always shown, no toggle
  return (
    <div className="dashboard">
      <Navbar />
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, minHeight: 600 }}>
          <MapView city={user?.city} />
        </div>
      </div>
    </div>
  );
};

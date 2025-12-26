import React from 'react';
import '../styles/EnhancedDashboard.css';

// Simple minimal look and feel screen
export const EnhancedDashboard: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80vh',
      fontFamily: 'sans-serif',
      background: '#f7f7f7',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      margin: '2rem',
      padding: '2rem'
    }}>
      <h1 style={{ color: '#333', fontWeight: 600, fontSize: '2.2rem', marginBottom: '1rem' }}>
        Welcome to Street Light Control System
      </h1>
      <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: 500, textAlign: 'center' }}>
        This is a simple dashboard screen.<br />
        Please use the navigation to access features.
      </p>
    </div>
  );
};

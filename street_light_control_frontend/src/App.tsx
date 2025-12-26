import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initializeApi } from './services/api';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { useAuthStore } from './store/authStore';
import './styles/index.css';

const App: React.FC = () => {
  const { token } = useAuthStore();

  useEffect(() => {
    // Initialize API on app load
    initializeApi();
    console.log('API initialized, token:', token ? 'Present' : 'Not present');
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

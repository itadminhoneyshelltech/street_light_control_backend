import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, initializeApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import '../styles/Auth.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setError } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@streetlight.com',
    password: 'admin123',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      console.log('Attempting login with:', formData.email);
      
      const response = await authService.login(formData.email, formData.password);
      console.log('Login response received:', response);
      
      // PHP API returns {token, user}
      const tokenData = response.token;
      const userData = response.user;
      
      if (!userData || !tokenData) {
        console.error('Missing user or token:', { user: userData, token: tokenData });
        throw new Error('Invalid credentials or server error');
      }
      
      console.log('Storing user:', userData);
      setUser(userData, tokenData);
      
      // Initialize API with new token
      initializeApi();
      
      console.log('Login successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <span className="logo-icon">💡</span>
          <div>
            <h1>Smart City</h1>
            <h3>Street Light Control</h3>
          </div>
        </div>
        <h2>Login</h2>

        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>

        {useAuthStore.getState().error && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33'
          }}>
            {useAuthStore.getState().error}
          </div>
        )}
      </div>
    </div>
  );
};

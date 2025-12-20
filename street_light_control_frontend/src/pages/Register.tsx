import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, initializeApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import '../styles/Auth.css';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setError } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'operator' | 'viewer'>('operator');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    street: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (selectedRole: 'operator' | 'viewer') => {
    setRole(selectedRole);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting registration with role:', role);
      const response = await authService.register(
        formData.name,
        formData.email,
        formData.password,
        formData.city,
        role,
        formData.street
      );
      console.log('Registration response:', response);
      console.log('Response structure:', {
        hasUser: !!response.user,
        hasToken: !!response.token,
        hasData: !!response.data,
        fullResponse: JSON.stringify(response)
      });

      // Handle different response formats
      const userData = response.data?.user || response.user;
      const tokenData = response.data?.token || response.token;

      if (!userData || !tokenData) {
        console.error('Missing user or token in response:', response);
        throw new Error('Invalid response from server: ' + JSON.stringify(response));
      }

      // Store user and token first
      setUser(userData, tokenData);
      console.log('User and token saved');
      
      // Initialize API with new token
      initializeApi();
      
      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('User saved, navigating to dashboard...');
      
      // Show success message
      alert(`Registration successful as ${role}! Redirecting to dashboard...`);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed. Please try again.';
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
        <h2>Create Account</h2>

        {/* Role Selection */}
        <div className="role-selection">
          <p className="role-label">Select Your Role:</p>
          <div className="role-buttons">
            <button
              type="button"
              className={`role-btn ${role === 'operator' ? 'active' : ''}`}
              onClick={() => handleRoleChange('operator')}
            >
              <span className="role-icon">⚙️</span>
              <span className="role-title">Operator</span>
              <span className="role-desc">Manage & Control</span>
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'viewer' ? 'active' : ''}`}
              onClick={() => handleRoleChange('viewer')}
            >
              <span className="role-icon">👁️</span>
              <span className="role-title">Viewer</span>
              <span className="role-desc">View Only</span>
            </button>
          </div>
        </div>

        {/* Role Descriptions */}
        <div className="role-info">
          {role === 'operator' ? (
            <div className="info-box">
              <h4>🔧 Operator Role</h4>
              <ul>
                <li>Register and manage devices</li>
                <li>Control street lights (On/Off)</li>
                <li>Manage local street details</li>
                <li>View reports and analytics</li>
                <li>Set schedules and automation</li>
              </ul>
            </div>
          ) : (
            <div className="info-box">
              <h4>👁️ Viewer Role</h4>
              <ul>
                <li>View street light status</li>
                <li>View location on map</li>
                <li>View reports</li>
                <li>Read-only access</li>
                <li>No control permissions</li>
              </ul>
            </div>
          )}
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
          />
          {role === 'operator' && (
            <input
              type="text"
              name="street"
              placeholder="Street / Zone (for Operators)"
              value={formData.street}
              onChange={handleChange}
            />
          )}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <a href="/login">Login here</a>
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

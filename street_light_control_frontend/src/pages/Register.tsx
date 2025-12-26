import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, initializeApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import '../styles/Auth.css';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setError } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      console.log('Attempting registration...');
      const response = await authService.register(
        formData.name,
        formData.email,
        formData.password,
        formData.city
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
      alert('Registration successful! Redirecting to dashboard...');
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
        <h1>🚦 Street Light Control</h1>
        <h2>Register</h2>

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
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
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
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
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

import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Eagerly create the client so it is always defined for consumers
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let interceptorsAttached = false;

export const initializeApi = () => {
  if (interceptorsAttached) return;

  // Add token to requests
  apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle 401 responses
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      if (error.response?.status === 401) {
        console.log('Received 401, logging out user');
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }
  );

  interceptorsAttached = true;
};

export const authService = {
  register: async (name: string, email: string, password: string, city: string, role: string = 'operator', street: string = '') => {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
      city,
      role,
      street,
    });
    // PHP API wraps response in {status, message, data}
    return response.data.data || response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    console.log('Raw login response:', response.data);
    // PHP API wraps response in {status, message, data}
    const result = response.data.data || response.data;
    console.log('Parsed login response:', result);
    return result;
  },
};

export interface LightFilters {
  city?: string;
  state?: string;
  district?: string;
  taluk?: string;
  ward?: string;
  status?: string;
}

export const lightService = {
  getLights: async (city?: string, filters?: LightFilters) => {
    const params: any = { city };
    if (filters) {
      if (filters.state) params.state = filters.state;
      if (filters.district) params.district = filters.district;
      if (filters.taluk) params.taluk = filters.taluk;
      if (filters.ward) params.ward = filters.ward;
      if (filters.status) params.status = filters.status;
    }
    const response = await apiClient.get('/lights/list', { params });
    console.log('Raw lights response:', response.data);
    const result = response.data.data || response.data;
    console.log('Parsed lights:', result);
    return Array.isArray(result) ? result : [];
  },

  getLightDetail: async (lightId: string) => {
    const response = await apiClient.get(`/lights/detail/${lightId}`);
    return response.data.data || response.data;
  },

  getCitySummary: async (city?: string) => {
    const response = await apiClient.get('/lights/summary', { 
      params: { city, _t: Date.now() }
    });
    console.log('Raw summary response:', response.data);
    const result = response.data.data || response.data;
    console.log('Parsed summary:', result);
    return result;
  },

  getLightsForMap: async (city?: string, filters?: LightFilters) => {
    const params: any = { city };
    if (filters) {
      if (filters.state) params.state = filters.state;
      if (filters.district) params.district = filters.district;
      if (filters.taluk) params.taluk = filters.taluk;
      if (filters.ward) params.ward = filters.ward;
      if (filters.status) params.status = filters.status;
    }
    const response = await apiClient.get('/lights/map', { params });
    const result = response.data.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  getFilters: async (city?: string) => {
    const response = await apiClient.get('/lights/filters', { params: { city } });
    return response.data.data || response.data;
  },

  controlLight: async (lightId: string, action: 'on' | 'off') => {
    const response = await apiClient.post('/lights/control', { lightId, action });
    return response.data.data || response.data;
  },
};

export default apiClient;

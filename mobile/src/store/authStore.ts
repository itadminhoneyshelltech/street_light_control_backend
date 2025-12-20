// mobile/src/store/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  city: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null, token: string | null) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: async (user, token) => {
    if (user && token) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);
    } else {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
    }
    set({ user, token });
  },

  logout: async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setError: (error) => set({ error }),

  loadFromStorage: async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      if (user && token) {
        set({ user: JSON.parse(user), token });
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  },
}));

// Store for authentication and app state
import { create } from 'zustand';

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
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  setUser: (user, token) => {
    console.log('setUser called with:', { user, token });
    
    if (user && token) {
      // Save to localStorage first
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      console.log('Saved to localStorage:', {
        user: localStorage.getItem('user'),
        token: localStorage.getItem('token')
      });
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      console.log('Removed from localStorage');
    }
    
    // Update state
    set({ user, token, error: null });
    
    // Verify state was updated
    const currentState = get();
    console.log('State after setUser:', { user: currentState.user, token: currentState.token });
  },

  logout: () => {
    console.log('Logging out...');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, error: null });
  },

  setError: (error) => set({ error }),
}));

import { create } from 'zustand';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('luxe_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('luxe_access_token'),
  isLoading: false,

  login: (user, accessToken, refreshToken) => {
    localStorage.setItem('luxe_access_token', accessToken);
    localStorage.setItem('luxe_refresh_token', refreshToken);
    localStorage.setItem('luxe_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore logout failure
    } finally {
      localStorage.removeItem('luxe_access_token');
      localStorage.removeItem('luxe_refresh_token');
      localStorage.removeItem('luxe_user');
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('luxe_access_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      localStorage.setItem('luxe_user', JSON.stringify(res.data.user));
    } catch (error) {
      localStorage.removeItem('luxe_access_token');
      localStorage.removeItem('luxe_refresh_token');
      localStorage.removeItem('luxe_user');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
export interface User {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
}
interface AuthActions {
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}
export const useAuthStore = create<AuthState & AuthActions>()(
  immer((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoggingIn: false,
    login: async (pin: string) => {
      set(state => { state.isLoggingIn = true; });
      try {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin })
        });
        if (!response.ok) throw new Error('Unauthorized');
        const result = await response.json();
        const { token, user } = result.data;
        localStorage.setItem('sw_token', token);
        localStorage.setItem('sw_user', JSON.stringify(user));
        set(state => {
          state.user = user;
          state.token = token;
          state.isAuthenticated = true;
          state.isLoggingIn = false;
        });
        return true;
      } catch (err) {
        set(state => { state.isLoggingIn = false; });
        return false;
      }
    },
    logout: () => {
      localStorage.removeItem('sw_token');
      localStorage.removeItem('sw_user');
      set(state => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
    },
    checkAuth: () => {
      const token = localStorage.getItem('sw_token');
      const userStr = localStorage.getItem('sw_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set(state => {
            state.token = token;
            state.user = user;
            state.isAuthenticated = true;
          });
        } catch (e) {
          get().logout();
        }
      }
    }
  }))
);
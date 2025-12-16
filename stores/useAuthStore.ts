import { authService } from '@/services/api/auth.service';
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  ipMkAuth: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (ipMkAuth: string, clientId: string, clientSecret: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  ipMkAuth: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (ipMkAuth: string, clientId: string, clientSecret: string) => {
    set({ isLoading: true });
    try {
      const token = await authService.login({ ipMkAuth, clientId, clientSecret });
      set({
        token,
        ipMkAuth,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({
      token: null,
      ipMkAuth: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    const token = await authService.getToken();
    const ipMkAuth = await authService.getIpMkAuth();
    
    if (token && ipMkAuth) {
      set({
        token,
        ipMkAuth,
        isAuthenticated: true,
      });
    } else {
      set({
        token: null,
        ipMkAuth: null,
        isAuthenticated: false,
      });
    }
  },
}));

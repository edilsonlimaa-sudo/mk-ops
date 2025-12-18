import { authService } from '@/services/api/auth.service';
import { authStorage, type LoginCredentials } from '@/services/storage/authStorage';
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  ipMkAuth: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (ipMkAuth: string, clientId: string, clientSecret: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getSavedCredentials: () => Promise<LoginCredentials | null>;
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
      
      // Salva token e credenciais via authStorage
      await authStorage.saveCredentials({ ipMkAuth, clientId, clientSecret }, token);
      
      // Atualiza estado (apiClient se auto-configura via subscription)
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
    // Limpa storage via authStorage
    await authStorage.clearAll();
    
    // Limpa estado (apiClient se auto-limpa via subscription)
    set({
      token: null,
      ipMkAuth: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    try {
      const session = await authStorage.getSession();
      
      if (session) {
        // Atualiza estado (apiClient se auto-configura via subscription)
        set({
          token: session.token,
          ipMkAuth: session.ipMkAuth,
          isAuthenticated: true,
        });
      } else {
        set({
          token: null,
          ipMkAuth: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.log('Erro ao verificar autenticação:', error);
      set({
        token: null,
        ipMkAuth: null,
        isAuthenticated: false,
      });
    }
  },

  getSavedCredentials: async (): Promise<LoginCredentials | null> => {
    return await authStorage.getCredentials();
  },
}));

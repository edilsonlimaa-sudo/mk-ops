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
      
      // Configura baseURL após login bem-sucedido
      try {
        const apiClientModule = await import('@/services/api/apiClient');
        if ('setBaseURL' in apiClientModule) {
          (apiClientModule as any).setBaseURL(ipMkAuth);
        }
      } catch (error) {
        console.log('⚠️ Não foi possível configurar API client:', error);
      }
      
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
    // Limpa estado do API client
    try {
      const apiClientModule = await import('@/services/api/apiClient');
      if ('clearApiState' in apiClientModule) {
        (apiClientModule as any).clearApiState();
      }
    } catch (error) {
      console.log('⚠️ Não foi possível limpar estado da API:', error);
    }
    
    // Limpa storage via authStorage
    await authStorage.clearAll();
    
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
        // Configura baseURL ao restaurar sessão
        try {
          const apiClientModule = await import('@/services/api/apiClient');
          if ('setBaseURL' in apiClientModule) {
            (apiClientModule as any).setBaseURL(session.ipMkAuth);
          }
        } catch (error) {
          console.log('⚠️ Não foi possível configurar API client:', error);
        }
        
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

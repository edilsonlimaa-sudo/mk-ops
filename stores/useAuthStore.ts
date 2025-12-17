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
  updateToken: (token: string, ipMkAuth?: string) => void;
}

// Flag global para prevenir múltiplos logins simultâneos
let isLoggingIn = false;

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  ipMkAuth: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (ipMkAuth: string, clientId: string, clientSecret: string) => {
    // Previne múltiplos logins simultâneos (debounce)
    if (isLoggingIn) {
      console.log('⏳ Login já em andamento, ignorando...');
      return;
    }
    
    isLoggingIn = true;
    set({ isLoading: true });
    
    try {
      const token = await authService.login({ ipMkAuth, clientId, clientSecret });
      
      // Configura baseURL e cache após login bem-sucedido
      try {
        const apiClientModule = await import('@/services/api/apiClient');
        if ('setBaseURL' in apiClientModule) {
          (apiClientModule as any).setBaseURL(ipMkAuth);
        }
        if ('updateTokenCache' in apiClientModule) {
          (apiClientModule as any).updateTokenCache(token);
        }
      } catch (cacheError) {
        console.log('⚠️ Não foi possível configurar API client:', cacheError);
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
    } finally {
      isLoggingIn = false;
    }
  },

  updateToken: (token: string, ipMkAuth?: string) => {
    // Atualiza cache quando token muda
    try {
      import('@/services/api/apiClient').then((apiClientModule) => {
        if ('updateTokenCache' in apiClientModule) {
          (apiClientModule as any).updateTokenCache(token);
        }
      });
    } catch (error) {
      console.log('⚠️ Não foi possível atualizar cache:', error);
    }
    
    // Atualiza Zustand (ipMkAuth opcional para quando credenciais mudam)
    if (ipMkAuth) {
      set({ token, ipMkAuth });
    } else {
      set({ token });
    }
  },

  logout: async () => {
    // Aguarda refresh terminar antes de fazer logout (previne race condition)
    const maxWait = 5000; // 5 segundos
    const startTime = Date.now();
    
    // Checa se existe isRefreshing exportado do apiClient
    try {
      const apiClientModule = await import('@/services/api/apiClient');
      if ('clearTokenCache' in apiClientModule) {
        // Limpa cache de token antes do logout
        (apiClientModule as any).clearTokenCache();
      }
    } catch (error) {
      console.log('⚠️ Não foi possível limpar cache:', error);
    }
    
    await authService.logout();
    set({
      token: null,
      ipMkAuth: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    try {
      const token = await authService.getToken();
      const ipMkAuth = await authService.getIpMkAuth();
      
      if (token && ipMkAuth) {
        // Configura baseURL e popula cache ao restaurar sessão
        try {
          const apiClientModule = await import('@/services/api/apiClient');
          if ('setBaseURL' in apiClientModule) {
            (apiClientModule as any).setBaseURL(ipMkAuth);
          }
          if ('updateTokenCache' in apiClientModule) {
            (apiClientModule as any).updateTokenCache(token);
          }
        } catch (cacheError) {
          console.log('⚠️ Não foi possível configurar API client:', cacheError);
        }
        
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
    } catch (error) {
      console.log('Erro ao verificar autenticação:', error);
      set({
        token: null,
        ipMkAuth: null,
        isAuthenticated: false,
      });
    }
  },
}));

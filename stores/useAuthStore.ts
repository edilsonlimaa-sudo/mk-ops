import { authService } from '@/services/api/auth.service';
import { create } from 'zustand';
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';

interface LoginCredentials {
  ipMkAuth: string;
  clientId: string;
  clientSecret: string;
}

interface AuthState {
  token: string | null;
  ipMkAuth: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (ipMkAuth: string, clientId: string, clientSecret: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateToken: (token: string, ipMkAuth?: string) => void;
  getSavedCredentials: () => Promise<LoginCredentials | null>;
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
      
      // Salva token e credenciais no SecureStore
      await setItemAsync('authToken', token);
      await setItemAsync('ipMkAuth', ipMkAuth);
      await setItemAsync('clientId', clientId);
      await setItemAsync('clientSecret', clientSecret);
      
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
    } finally {
      isLoggingIn = false;
    }
  },

  updateToken: (token: string, ipMkAuth?: string) => {
    // Atualiza Zustand (ipMkAuth opcional para quando credenciais mudam)
    if (ipMkAuth) {
      set({ token, ipMkAuth });
    } else {
      set({ token });
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
    
    // Limpa SecureStore
    await deleteItemAsync('authToken');
    await deleteItemAsync('ipMkAuth');
    await deleteItemAsync('clientId');
    await deleteItemAsync('clientSecret');
    
    set({
      token: null,
      ipMkAuth: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    try {
      const token = await getItemAsync('authToken');
      const ipMkAuth = await getItemAsync('ipMkAuth');
      
      if (token && ipMkAuth) {
        // Configura baseURL ao restaurar sessão
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
    const ipMkAuth = await getItemAsync('ipMkAuth');
    const clientId = await getItemAsync('clientId');
    const clientSecret = await getItemAsync('clientSecret');
    
    if (!ipMkAuth || !clientId || !clientSecret) {
      return null;
    }
    
    return { ipMkAuth, clientId, clientSecret };
  },
}));

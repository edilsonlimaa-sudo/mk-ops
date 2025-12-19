import { authService } from '@/services/api/auth.service';
import { authStorage, type LoginCredentials } from '@/services/storage/authStorage';
import { router } from 'expo-router';
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
  refreshToken: () => Promise<string>;
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
    
    // Redireciona para tela de login
    router.replace('/(auth)/login');
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
      // Limpa estado se falhar (storage corrompido, permissão negada, etc)
      set({
        token: null,
        ipMkAuth: null,
        isAuthenticated: false,
      });
      
      // Tenta limpar storage corrompido em background (ignora se falhar)
      authStorage.clearAll().catch(() => {});
      
      throw error;
    }
  },

  getSavedCredentials: async (): Promise<LoginCredentials | null> => {
    return await authStorage.getCredentials();
  },

  refreshToken: async (): Promise<string> => {
    // 1. Busca credenciais salvas do storage
    const credentials = await authStorage.getCredentials();
    if (!credentials) {
      throw new Error('Credenciais não salvas');
    }

    // 2. Faz login (HTTP call pura, sem side-effects)
    const token = await authService.login(credentials);

    // 3. Atualiza storage
    await authStorage.saveCredentials(credentials, token);

    // 4. Atualiza estado silenciosamente (sem isLoading, sem navegação)
    set({ token, isAuthenticated: true });

    console.log('✅ Token renovado automaticamente!');
    return token;
  },
}));

import { authService } from '@/services/api/auth.service';
import { getTokenExpiration } from '@/services/api/token/jwtDecoder';
import { authStorage, type LoginCredentials } from '@/services/storage/authStorage';
import { router } from 'expo-router';
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  tokenExpiration: number | null; // Timestamp em milissegundos
  ipMkAuth: string | null;
  isAuthenticated: boolean;
  isRestored: boolean; // Indica se a sessão foi restaurada do storage (bootstrap completo)
  isLoading: boolean;
  login: (ipMkAuth: string, clientId: string, clientSecret: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getSavedCredentials: () => Promise<LoginCredentials | null>;
  refreshToken: () => Promise<string>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  tokenExpiration: null,
  ipMkAuth: null,
  isAuthenticated: false,
  isRestored: false,
  isLoading: false,

  login: async (ipMkAuth: string, clientId: string, clientSecret: string) => {
    set({ isLoading: true });
    
    try {
      const token = await authService.login({ ipMkAuth, clientId, clientSecret });
      
      // Salva token e credenciais via authStorage
      await authStorage.saveCredentials({ ipMkAuth, clientId, clientSecret }, token);
      
      // Extrai data de expiração do token
      const tokenExpiration = getTokenExpiration(token);
      
      // Atualiza estado (apiClient se auto-configura via subscription)
      set({
        token,
        tokenExpiration,
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
      tokenExpiration: null,
      ipMkAuth: null,
      isAuthenticated: false,
    });
    
    // Redireciona para tela de login
    router.replace('/(auth)/login');
  },

  checkAuth: async () => {
    console.log('🔍 [AuthStore] checkAuth iniciado...');
    try {
      const session = await authStorage.getSession();
      
      if (session) {
        // Extrai data de expiração do token
        const tokenExpiration = getTokenExpiration(session.token);
        
        // VALIDAÇÃO PROATIVA: Verifica se token expirado
        if (Date.now() >= tokenExpiration) {
          console.log('🔄 Token expirado detectado no checkAuth, renovando...');
          try {
            // Renova token ANTES de marcar como autenticado
            await useAuthStore.getState().refreshToken();
            // Marca como restaurado após refresh bem-sucedido
            set({ isRestored: true });
            console.log('✅ [AuthStore] Sessão restaurada com token renovado!');
            return;
          } catch (refreshError) {
            console.warn('⚠️ Falha ao renovar token proativamente:', refreshError);
            // Mantém token expirado, interceptor vai tentar depois
            set({
              token: session.token,
              tokenExpiration,
              ipMkAuth: session.ipMkAuth,
              isAuthenticated: true,
              isRestored: true, // Restauração completa (token expirado mas mantém sessão)
            });
            return;
          }
        }
        
        // Token válido, usa normalmente
        set({
          token: session.token,
          tokenExpiration,
          isRestored: true, // Restauração completa (com token válido)
          ipMkAuth: session.ipMkAuth,
          isAuthenticated: true,
        });
        console.log('✅ [AuthStore] Sessão restaurada com sucesso! ipMkAuth:', session.ipMkAuth);
      } else {
        set({
          token: null,
          tokenExpiration: null,
          ipMkAuth: null,
          isAuthenticated: false,
          isRestored: true, // Restauração completa (sem sessão)
        });
        console.log('⚠️ [AuthStore] Nenhuma sessão encontrada');
      }
    } catch (error) {
      console.log('❌ [AuthStore] Erro no checkAuth:', error);
      // Limpa estado se falhar (storage corrompido, permissão negada, etc)
      set({
        token: null,
        tokenExpiration: null,
        ipMkAuth: null,
        isAuthenticated: false,
        isRestored: true, // Restauração completa (com erro)
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

    // 4. Extrai data de expiração do novo token
    const tokenExpiration = getTokenExpiration(token);

    // 5. Atualiza estado silenciosamente (sem isLoading, sem navegação)
    set({ token, tokenExpiration, isAuthenticated: true });

    console.log('✅ Token renovado automaticamente!');
    return token;
  },
}));

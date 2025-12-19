import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';
import { AppState } from 'react-native';

/**
 * Hook para refresh proativo de token quando app volta do background
 * 
 * Detecta quando usuário minimiza o app e volta depois.
 * Se token expirou durante o background, renova automaticamente.
 * 
 * Combinado com:
 * - checkAuth() ao abrir app (Camada 1)
 * - Interceptor Axios como fallback (Camada 3)
 */
export const useProactiveTokenRefresh = () => {
  const refreshToken = useAuthStore((state) => state.refreshToken);

  // AppState Listener: Detecta volta do background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        // App voltou para foreground
        const { token, tokenExpiration } = useAuthStore.getState();
        
        if (token && tokenExpiration) {
          const isExpired = Date.now() >= tokenExpiration;
          
          if (isExpired) {
            console.log('🔄 Token expirado detectado ao voltar do background, renovando...');
            try {
              await refreshToken();
            } catch (error) {
              console.warn('⚠️ Falha ao renovar token ao voltar do background:', error);
              // Não faz nada, interceptor vai tentar depois
            }
          }
        }
      }
    });

    return () => subscription.remove();
  }, [refreshToken]);
};

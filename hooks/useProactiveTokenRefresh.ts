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
    console.log('🎯 [ProactiveTokenRefresh] Hook inicializado');
    
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      console.log(`📱 [ProactiveTokenRefresh] AppState mudou para: ${nextAppState}`);
      
      if (nextAppState === 'active') {
        console.log('✨ [ProactiveTokenRefresh] App voltou para foreground, verificando token...');
        // App voltou para foreground
        const { token, tokenExpiration } = useAuthStore.getState();
        
        if (token && tokenExpiration) {
          const isExpired = Date.now() >= tokenExpiration;
          
          if (isExpired) {
            console.log('🔄 [ProactiveTokenRefresh] Token expirado detectado, renovando...');
            try {
              await refreshToken();
              console.log('✅ [ProactiveTokenRefresh] Token renovado com sucesso!');
            } catch (error) {
              console.warn('⚠️ [ProactiveTokenRefresh] Falha ao renovar token:', error);
              // Não faz nada, interceptor vai tentar depois
            }
          } else {
            const timeLeft = Math.round((tokenExpiration - Date.now()) / 1000 / 60);
            console.log(`✅ [ProactiveTokenRefresh] Token ainda válido (${timeLeft} minutos restantes)`);
          }
        } else {
          console.log('⚠️ [ProactiveTokenRefresh] Nenhum token encontrado');
        }
      }
    });

    return () => {
      console.log('🔌 [ProactiveTokenRefresh] Hook desmontado');
      subscription.remove();
    };
  }, [refreshToken]);
};

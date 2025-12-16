import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenCache } from '../token/tokenCache';
import { tokenRefreshManager } from '../token/tokenRefreshManager';

/**
 * Response Interceptor: Detecta 401 e faz refresh automático do token
 * Gerencia fila de requests pendentes e previne loops infinitos
 */
export const tokenRefreshSuccessHandler = (response: AxiosResponse) => {
  return response;
};

export const tokenRefreshErrorHandler = async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean;
    _refreshedToken?: boolean;
  };

  // Se recebeu 401 (token expirado)
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    // Se request tinha token recém-renovado e ainda deu 401,
    // é erro de autorização (sem permissão), não token expirado
    if (originalRequest._refreshedToken) {
      console.log('⚠️ 401 após token refresh - possível erro de autorização');
      return Promise.reject(error);
    }

    // Se já está renovando, adiciona à fila de espera
    if (tokenRefreshManager.getIsRefreshing()) {
      console.log('⏳ Request aguardando renovação de token...');
      return new Promise((resolve, reject) => {
        tokenRefreshManager.addPendingRequest((token, error) => {
          if (error) {
            reject(error);
          } else if (token) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            // Importa dinamicamente para evitar circular dependency
            import('../apiClient').then(({ default: apiClient }) => {
              resolve(apiClient(originalRequest));
            });
          }
        });
      });
    }

    tokenRefreshManager.setIsRefreshing(true);

    try {
      // Previne loop infinito de refresh
      if (!tokenRefreshManager.canRetry()) {
        console.log('❌ Máximo de tentativas de refresh atingido');
        tokenRefreshManager.resetAttempts();
        throw new Error('Token refresh falhou após múltiplas tentativas');
      }

      tokenRefreshManager.incrementAttempts();
      console.log(
        `🔄 Token expirado, reautenticando automaticamente (tentativa ${tokenRefreshManager.getAttempts})...`
      );

      // Importa authService apenas quando necessário (evita import circular)
      const { authService } = await import('../auth.service');

      // Recupera credenciais salvas
      const credentials = await authService.getSavedCredentials();
      if (!credentials) {
        console.log('❌ Credenciais não encontradas, redirecionando para login');
        throw new Error('Credenciais não salvas');
      }

      // Re-loga usando credenciais salvas
      const newToken = await authService.login(credentials);
      console.log('✅ Token renovado automaticamente!');

      // Atualiza cache de token em memória
      tokenCache.set(newToken);

      // Reset contador de tentativas após sucesso
      tokenRefreshManager.resetAttempts();

      // Atualiza Zustand store com novo token
      try {
        const { useAuthStore } = await import('@/stores/useAuthStore');
        useAuthStore.getState().updateToken(newToken);
      } catch (storeError) {
        console.log('⚠️ Não foi possível atualizar Zustand store:', storeError);
      }

      // Processa todas as requests que estavam aguardando
      tokenRefreshManager.resolveAllPending(newToken);

      // Atualiza header da request original com novo token
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

      // Marca que esta request foi feita com token recém-renovado
      originalRequest._refreshedToken = true;

      // Retenta a request original
      const { default: apiClient } = await import('../apiClient');
      return apiClient(originalRequest);
    } catch (refreshError) {
      console.log('❌ Erro ao renovar token:', refreshError);

      // Limpa cache de token
      tokenCache.clear();

      // Rejeita todas as requests que estavam aguardando
      tokenRefreshManager.rejectAllPending(refreshError);

      // Detecta se é erro de rede (offline) - NÃO desloga nesse caso
      if (axios.isAxiosError(refreshError)) {
        const isNetworkError =
          refreshError.code === 'ECONNABORTED' ||
          refreshError.code === 'ERR_NETWORK' ||
          refreshError.message.includes('Network Error') ||
          refreshError.message.includes('timeout');

        if (isNetworkError) {
          console.log('📡 Erro de rede detectado - preservando credenciais');
          throw new Error('Sem conexão com a internet. Tente novamente.');
        }
      }

      // Se não é erro de rede, é credencial inválida ou usuário deletado
      const { authService } = await import('../auth.service');

      // Reset contador antes de logout
      tokenRefreshManager.resetAttempts();

      await authService.logout();

      // Limpa cache após logout
      tokenCache.clear();

      // Redireciona para login (usuário deletado ou credenciais inválidas)
      try {
        const { router } = await import('expo-router');
        router.replace('/login');
      } catch (routerError) {
        console.log('⚠️ Não foi possível redirecionar:', routerError);
      }

      throw refreshError;
    } finally {
      tokenRefreshManager.setIsRefreshing(false);
    }
  }

  return Promise.reject(error);
};

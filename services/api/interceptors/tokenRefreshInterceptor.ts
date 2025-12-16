import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenRefreshManager } from '../token/tokenRefreshManager';
import { handleRefreshFailure } from './helpers/errorRecoveryHandler';
import { isNetworkError } from './helpers/networkErrorDetector';
import { refreshToken } from './helpers/tokenRefresher';

/**
 * Response Interceptor: Detecta 401 e faz refresh automático do token
 * Orquestra helpers para gerenciar fila de requests e prevenir loops infinitos
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
        `🔄 Token expirado, reautenticando automaticamente (tentativa ${tokenRefreshManager.getAttempts()})...`
      );

      // Faz refresh do token usando helper
      const newToken = await refreshToken();

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

      // Rejeita todas as requests que estavam aguardando
      tokenRefreshManager.rejectAllPending(refreshError);

      // Detecta se é erro de rede (offline) - NÃO desloga nesse caso
      if (isNetworkError(refreshError)) {
        console.log('📡 Erro de rede detectado - preservando credenciais');
        throw new Error('Sem conexão com a internet. Tente novamente.');
      }

      // Se não é erro de rede, faz logout e redireciona
      await handleRefreshFailure();

      throw refreshError;
    } finally {
      tokenRefreshManager.setIsRefreshing(false);
    }
  }

  return Promise.reject(error);
};

import { refreshToken } from '@/lib/auth';
import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenRefreshManager } from '../token/tokenRefreshManager';

/**
 * Response Interceptor: Detecta 401 e faz refresh automático do token
 * 
 * Factory Pattern: Recebe apiClient por injeção de dependência,
 * eliminando necessidade de import dinâmico e ciclo de dependência.
 * 
 * Responsabilidades:
 * - Detectar erro 401 (token expirado)
 * - Renovar token via auth.token.refreshToken()
 * - Retentar request (authRequestInterceptor injeta token atualizado)
 * - Gerenciar fila de requests durante refresh
 */
export const tokenRefreshSuccessHandler = (response: AxiosResponse) => {
  return response;
};

/**
 * Factory que cria o error handler com acesso ao apiClient (Dependency Injection)
 */
export const createTokenRefreshErrorHandler = (apiClient: AxiosInstance) => {
  return async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Se recebeu 401 e ainda não tentou renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Se já está renovando, adiciona à fila de espera
      if (tokenRefreshManager.getIsRefreshing()) {
        console.log('⏳ [TokenRefresh] Request aguardando renovação de token...');
        return new Promise((resolve, reject) => {
          tokenRefreshManager.addPendingRequest((error) => {
            if (error) {
              reject(error);
            } else {
              // authRequestInterceptor vai injetar token atualizado da store
              resolve(apiClient(originalRequest));
            }
          });
        });
      }

      tokenRefreshManager.setIsRefreshing(true);

      try {
        console.log('🔄 [TokenRefresh] Token expirado (401 recebido), renovando...');

        // Renova token via função externa (mantendo Single Source of Truth)
        await refreshToken();

        console.log('✅ [TokenRefresh] Token renovado, retentando request original...');

        // Processa todas as requests que estavam aguardando
        tokenRefreshManager.resolveAllPending();

        // Retenta request - authRequestInterceptor vai injetar token atualizado
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log('❌ [TokenRefresh] Erro ao renovar token:', refreshError);

        // Rejeita todas as requests que estavam aguardando
        tokenRefreshManager.rejectAllPending(refreshError);

        // Falhou? Apenas propaga o erro
        throw refreshError;
      } finally {
        tokenRefreshManager.setIsRefreshing(false);
      }
    }

    return Promise.reject(error);
  };
};

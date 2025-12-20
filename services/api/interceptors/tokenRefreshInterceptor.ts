import { useAuthStore } from '@/stores/useAuthStore';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenRefreshManager } from '../token/tokenRefreshManager';
// Import dinâmico para quebrar ciclo de dependência

/**
 * Response Interceptor: Detecta 401 e faz refresh automático do token
 * Responsabilidades:
 * - Detectar erro 401 (token expirado)
 * - Renovar token via useAuthStore.refreshToken()
 * - Retentar request (tokenInjectorInterceptor injeta token atualizado)
 * - Gerenciar fila de requests durante refresh
 */
export const tokenRefreshSuccessHandler = (response: AxiosResponse) => {
  return response;
};

export const tokenRefreshErrorHandler = async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

  // Se recebeu 401 e ainda não tentou renovar
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    // Import dinâmico para evitar ciclo de dependência
    const getApiClient = async () => {
      const { default: apiClient } = await import('../apiClient');
      return apiClient;
    };

    // Se já está renovando, adiciona à fila de espera
    if (tokenRefreshManager.getIsRefreshing()) {
      console.log('⏳ [TokenRefresh] Request aguardando renovação de token...');
      return new Promise(async (resolve, reject) => {
        tokenRefreshManager.addPendingRequest(async (error) => {
          if (error) {
            reject(error);
          } else {
            // tokenInjectorInterceptor vai injetar token atualizado da store
            const apiClient = await getApiClient();
            resolve(apiClient(originalRequest));
          }
        });
      });
    }

    tokenRefreshManager.setIsRefreshing(true);

    try {
      console.log('🔄 [TokenRefresh] Token expirado (401 recebido), renovando...');

      // Renova token via store (mantendo Single Source of Truth)
      await useAuthStore.getState().refreshToken();

      console.log('✅ [TokenRefresh] Token renovado, retentando request original...');

      // Processa todas as requests que estavam aguardando
      tokenRefreshManager.resolveAllPending();

      // Retenta request - tokenInjectorInterceptor vai injetar token atualizado
      const apiClient = await getApiClient();
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

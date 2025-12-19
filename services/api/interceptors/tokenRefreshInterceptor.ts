import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { tokenRefreshManager } from '../token/tokenRefreshManager';
import apiClient from '../apiClient';

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

    // Se já está renovando, adiciona à fila de espera
    if (tokenRefreshManager.getIsRefreshing()) {
      console.log('⏳ Request aguardando renovação de token...');
      return new Promise((resolve, reject) => {
        tokenRefreshManager.addPendingRequest((error) => {
          if (error) {
            reject(error);
          } else {
            // tokenInjectorInterceptor vai injetar token atualizado da store
            resolve(apiClient(originalRequest));
          }
        });
      });
    }

    tokenRefreshManager.setIsRefreshing(true);

    try {
      console.log('🔄 Token expirado, renovando...');

      // Renova token via store (mantendo Single Source of Truth)
      await useAuthStore.getState().refreshToken();

      // Processa todas as requests que estavam aguardando
      tokenRefreshManager.resolveAllPending();

      // Retenta request - tokenInjectorInterceptor vai injetar token atualizado
      return apiClient(originalRequest);
    } catch (refreshError) {
      console.log('❌ Erro ao renovar token:', refreshError);

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

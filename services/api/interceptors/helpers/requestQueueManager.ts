import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenRefreshManager } from '../../token/tokenRefreshManager';

/**
 * Adiciona request à fila de espera enquanto token está sendo renovado
 * - Aguarda renovação completar
 * - Atualiza header Authorization com novo token
 * - Retenta request original
 */
export const enqueueRequest = (
  originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }
): Promise<AxiosResponse> => {
  console.log('⏳ Request aguardando renovação de token...');
  
  return new Promise((resolve, reject) => {
    tokenRefreshManager.addPendingRequest((token, error) => {
      if (error) {
        reject(error);
      } else if (token) {
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        // Importa dinamicamente para evitar circular dependency
        import('../../apiClient').then(({ default: apiClient }) => {
          resolve(apiClient(originalRequest));
        });
      }
    });
  });
};

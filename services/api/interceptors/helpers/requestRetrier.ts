import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * Retenta request original com novo token
 * - Atualiza header Authorization
 * - Marca request como usando token recém-renovado
 * - Retenta usando apiClient
 */
export const retryWithNewToken = async (
  originalRequest: InternalAxiosRequestConfig & { _refreshedToken?: boolean },
  newToken: string
): Promise<AxiosResponse> => {
  // Atualiza header da request original com novo token
  originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

  // Marca que esta request foi feita com token recém-renovado
  originalRequest._refreshedToken = true;

  // Retenta a request original
  const { default: apiClient } = await import('../../apiClient');
  return apiClient(originalRequest);
};

import { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Request Interceptor: Injeta token JWT automaticamente em todas as requests
 * Usa useAuthStore como fonte única de verdade para o token
 */
export const tokenInjectorInterceptor = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  // Obtém token do useAuthStore (single source of truth)
  let token = useAuthStore.getState().token;

  // Fallback: se store não tem token, tenta SecureStore (cold start)
  if (!token) {
    const { getItemAsync } = await import('expo-secure-store');
    token = await getItemAsync('authToken');
  }

  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
};

export const tokenInjectorErrorHandler = (error: any) => {
  return Promise.reject(error);
};

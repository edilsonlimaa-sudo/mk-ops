import { InternalAxiosRequestConfig } from 'axios';
import { tokenCache } from '../token/tokenCache';

/**
 * Request Interceptor: Injeta token JWT automaticamente em todas as requests
 * Usa cache em memória para evitar leituras repetidas do SecureStore
 */
export const tokenInjectorInterceptor = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  // Usa cache se disponível, senão lê do SecureStore
  if (!tokenCache.has()) {
    const { getItemAsync } = await import('expo-secure-store');
    const token = await getItemAsync('authToken');
    tokenCache.set(token);
  }

  const token = tokenCache.get();
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
};

export const tokenInjectorErrorHandler = (error: any) => {
  return Promise.reject(error);
};

import { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Request Interceptor: Injeta token JWT automaticamente em todas as requests
 * Usa useAuthStore como fonte única de verdade para o token
 * 
 * Nota: checkAuth() sempre executa antes de qualquer componente montar,
 * garantindo que o store esteja populado quando requests forem disparadas
 */
export const tokenInjectorInterceptor = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  // Obtém token do useAuthStore (sempre populado após checkAuth)
  const token = useAuthStore.getState().token;

  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
};

export const tokenInjectorErrorHandler = (error: any) => {
  return Promise.reject(error);
};

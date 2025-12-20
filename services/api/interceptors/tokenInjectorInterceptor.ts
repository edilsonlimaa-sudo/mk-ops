import { useAuthStore } from '@/stores/useAuthStore';
import { InternalAxiosRequestConfig } from 'axios';

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
    console.log(`🔑 [TokenInjector] Token injetado (${token.substring(0, 20)}...)`);
  } else {
    console.log('⚠️ [TokenInjector] Nenhum token disponível para injetar');
  }

  return config;
};

export const tokenInjectorErrorHandler = (error: any) => {
  return Promise.reject(error);
};

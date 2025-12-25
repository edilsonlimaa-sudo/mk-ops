import { useAuthStore } from '@/stores/useAuthStore';
import { InternalAxiosRequestConfig } from 'axios';

/**
 * Request Interceptor: Configura autenticação DINAMICAMENTE em todas as requests
 * Injeta baseURL e token JWT obtidos do useAuthStore (Single Source of Truth)
 * 
 * Vantagens da abordagem dinâmica:
 * - Evita problemas de timing com subscriptions
 * - BaseURL e token sempre sincronizados com o store
 * - Sem necessidade de reconfiguração manual do apiClient
 * - Refresh transparente (próxima request usa valores atualizados automaticamente)
 */
export const authRequestInterceptor = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  const { token, ipMkAuth } = useAuthStore.getState();

  // Injeta baseURL dinamicamente
  if (ipMkAuth) {
    config.baseURL = `https://${ipMkAuth}`;
    console.log(`🌐 [AuthRequest] BaseURL injetada: ${config.baseURL}`);
  } else {
    console.log('⚠️ [AuthRequest] Nenhuma baseURL disponível (ipMkAuth não configurado)');
  }

  // Injeta token dinamicamente
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log(`🔑 [AuthRequest] Token injetado (${token.substring(0, 20)}...)`);
  } else {
    console.log('⚠️ [AuthRequest] Nenhum token disponível para injetar');
  }

  return config;
};

export const authRequestErrorHandler = (error: any) => {
  return Promise.reject(error);
};

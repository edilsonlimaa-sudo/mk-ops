import axios from 'axios';
import {
  authErrorDetectorErrorHandler,
  authErrorDetectorSuccessHandler,
} from './interceptors/authErrorDetectorInterceptor';
import {
  authRequestErrorHandler,
  authRequestInterceptor,
} from './interceptors/authRequestInterceptor';
import {
  createTokenRefreshErrorHandler,
  tokenRefreshSuccessHandler,
} from './interceptors/tokenRefreshInterceptor';
import { tokenRefreshManager } from './token/tokenRefreshManager';

/**
 * Instância Axios configurada com interceptors de autenticação
 * 
 * ARQUITETURA DINÂMICA:
 * - BaseURL e Token são injetados DINAMICAMENTE a cada request (via interceptor)
 * - useAuthStore é a única fonte de verdade (Single Source of Truth)
 * - Não há configuração estática de baseURL ou token no apiClient
 * 
 * DEPENDENCY INJECTION:
 * - tokenRefreshErrorHandler recebe apiClient via factory (elimina ciclo de dependência)
 * 
 * Vantagens:
 * - Sempre sincronizado com o store (sem timing issues)
 * - Refresh transparente (token + baseURL atualizados automaticamente)
 * - Arquitetura consistente (ambos dinâmicos)
 * - Sem imports dinâmicos (código mais limpo e previsível)
 */
const apiClient = axios.create({
  timeout: 10000,
});

// Registra interceptor de request (configura autenticação: baseURL + token)
apiClient.interceptors.request.use(authRequestInterceptor, authRequestErrorHandler);
// Registra detector de erros de autenticação (converte 200 com erro em 401)
// IMPORTANTE: Deve vir ANTES do tokenRefreshInterceptor para converter erro antes
apiClient.interceptors.response.use(authErrorDetectorSuccessHandler, authErrorDetectorErrorHandler);
// Registra interceptor de response (auto-refresh em 401)
// Usa factory pattern para injetar apiClient (elimina ciclo de dependência)
apiClient.interceptors.response.use(tokenRefreshSuccessHandler, createTokenRefreshErrorHandler(apiClient));

/**
 * Limpa estado de refresh (usado no logout)
 */
export const clearApiState = () => {
  tokenRefreshManager.reset();
  console.log('🧹 [ApiClient] Estado de refresh limpo');
};

export default apiClient;

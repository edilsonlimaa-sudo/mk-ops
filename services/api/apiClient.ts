import axios from 'axios';
import {
    tokenInjectorErrorHandler,
    tokenInjectorInterceptor,
} from './interceptors/tokenInjectorInterceptor';
import {
    tokenRefreshErrorHandler,
    tokenRefreshSuccessHandler,
} from './interceptors/tokenRefreshInterceptor';
import { tokenCache } from './token/tokenCache';
import { tokenRefreshManager } from './token/tokenRefreshManager';

/**
 * Instância Axios configurada com interceptors de autenticação
 * - Request interceptor: injeta token JWT automaticamente
 * - Response interceptor: detecta 401 e faz refresh do token
 */
const apiClient = axios.create({
  timeout: 10000,
});

// Registra interceptor de request (injeção de token)
apiClient.interceptors.request.use(tokenInjectorInterceptor, tokenInjectorErrorHandler);

// Registra interceptor de response (auto-refresh em 401)
apiClient.interceptors.response.use(tokenRefreshSuccessHandler, tokenRefreshErrorHandler);

/**
 * Limpa cache de token e reseta estado de refresh
 * Usado pelo logout para garantir limpeza completa
 */
export const clearTokenCache = () => {
  tokenCache.clear();
  tokenRefreshManager.reset();
};

/**
 * Atualiza token no cache
 * Usado pelo login e checkAuth para popular cache
 */
export const updateTokenCache = (token: string | null) => {
  tokenCache.set(token);
};

export default apiClient;

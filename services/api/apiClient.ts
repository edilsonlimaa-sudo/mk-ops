import axios from 'axios';
import {
  authErrorDetectorErrorHandler,
  authErrorDetectorSuccessHandler,
} from './interceptors/authErrorDetectorInterceptor';
import {
  tokenInjectorErrorHandler,
  tokenInjectorInterceptor,
} from './interceptors/tokenInjectorInterceptor';
import {
  tokenRefreshErrorHandler,
  tokenRefreshSuccessHandler,
} from './interceptors/tokenRefreshInterceptor';
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
// Registra detector de erros de autenticação (converte 200 com erro em 401)
// IMPORTANTE: Deve vir ANTES do tokenRefreshInterceptor para converter erro antes
apiClient.interceptors.response.use(authErrorDetectorSuccessHandler, authErrorDetectorErrorHandler);
// Registra interceptor de response (auto-refresh em 401)
apiClient.interceptors.response.use(tokenRefreshSuccessHandler, tokenRefreshErrorHandler);

/**
 * Configura baseURL do apiClient após autenticação bem-sucedida
 * Usado pelo login e checkAuth para definir o servidor MK-Auth
 */
export const setBaseURL = (ipMkAuth: string) => {
  apiClient.defaults.baseURL = `https://${ipMkAuth}`;
  console.log('🌐 BaseURL configurado:', apiClient.defaults.baseURL);
};

/**
 * Limpa baseURL do apiClient
 * Usado pelo logout para resetar configuração
 */
export const clearBaseURL = () => {
  apiClient.defaults.baseURL = undefined;
  console.log('🌐 BaseURL limpo');
};

/**
 * Limpa estado de refresh e baseURL
 * Usado pelo logout para garantir limpeza completa
 */
export const clearApiState = () => {
  tokenRefreshManager.reset();
  clearBaseURL();
};

/**
 * Auto-configura apiClient quando ipMkAuth muda no authStore
 * Usa Zustand subscription para reagir a mudanças de estado (Observer Pattern)
 */
const initializeApiClientSync = async () => {
  const { useAuthStore } = await import('@/stores/useAuthStore');
  
  // Configura baseURL com estado inicial (subscription não dispara no estado inicial)
  const initialState = useAuthStore.getState();
  if (initialState.ipMkAuth) {
    apiClient.defaults.baseURL = `https://${initialState.ipMkAuth}`;
    console.log('🌐 [ApiClient] BaseURL inicial configurado:', apiClient.defaults.baseURL);
  }
  
  // Subscreve para mudanças futuras
  useAuthStore.subscribe((state) => {
    if (state.ipMkAuth) {
      apiClient.defaults.baseURL = `https://${state.ipMkAuth}`;
      console.log('🌐 [ApiClient] BaseURL auto-configurado:', apiClient.defaults.baseURL);
    } else {
      apiClient.defaults.baseURL = undefined;
      tokenRefreshManager.reset();
      console.log('🌐 [ApiClient] BaseURL limpo');
    }
  });
};

// Inicializa sincronização automática
initializeApiClientSync();

export default apiClient;

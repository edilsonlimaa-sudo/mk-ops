import axios from 'axios';

// Cria instância do Axios com interceptor para auto-refresh
const apiClient = axios.create({
  timeout: 10000,
});

// Flag para evitar múltiplos re-logins simultâneos
let isRefreshing = false;

// Cache de token em memória para evitar ler SecureStore em toda request
let cachedToken: string | null = null;

// Contador de tentativas de refresh para prevenir loop infinito
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

// Fila de requests pendentes aguardando o refresh completar
type PendingRequestCallback = (token?: string, error?: any) => void;
let pendingRequests: PendingRequestCallback[] = [];

// Interceptor de request: injeta token automaticamente
apiClient.interceptors.request.use(
  async (config) => {
    // Usa cache se disponível, senão lê do SecureStore
    if (!cachedToken) {
      const { getItemAsync } = await import('expo-secure-store');
      cachedToken = await getItemAsync('authToken');
    }
    
    if (cachedToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${cachedToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta: detecta 401 e refaz login automaticamente
apiClient.interceptors.response.use(
  (response) => response, // Sucesso, apenas retorna
  async (error) => {
    const originalRequest = error.config;

    // Se recebeu 401 (token expirado)
    // _retry = true significa que já tentamos refresh
    // _refreshedToken = true significa que token acabou de ser renovado
    // Se ambos true, é 401 de permissão, não de token expirado
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Se request tinha token recém-renovado e ainda deu 401,
      // é erro de autorização (sem permissão), não token expirado
      if (originalRequest._refreshedToken) {
        console.log('⚠️ 401 após token refresh - possível erro de autorização');
        return Promise.reject(error);
      }

      // Se já está renovando, adiciona à fila de espera
      if (isRefreshing) {
        console.log('⏳ Request aguardando renovação de token...');
        return new Promise((resolve, reject) => {
          pendingRequests.push((token, error) => {
            if (error) {
              reject(error);
            } else if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            }
          });
        });
      }

      isRefreshing = true;

      try {
        // Previne loop infinito de refresh
        refreshAttempts++;
        if (refreshAttempts > MAX_REFRESH_ATTEMPTS) {
          console.log('❌ Máximo de tentativas de refresh atingido');
          refreshAttempts = 0;
          throw new Error('Token refresh falhou após múltiplas tentativas');
        }

        console.log(`🔄 Token expirado, reautenticando automaticamente (tentativa ${refreshAttempts})...`);

        // Importa authService apenas quando necessário (evita import circular)
        const { authService } = await import('./auth.service');
        
        // Usa método do authService ao invés de ler SecureStore direto
        const credentials = await authService.getSavedCredentials();

        if (!credentials) {
          console.log('❌ Credenciais não encontradas, redirecionando para login');
          throw new Error('Credenciais não salvas');
        }

        // Re-loga usando o authService (mantém a arquitetura em camadas)
        const newToken = await authService.login(credentials);

        console.log('✅ Token renovado automaticamente!');

        // Atualiza cache de token em memória
        cachedToken = newToken;
        
        // Reset contador de tentativas após sucesso
        refreshAttempts = 0;

        // Atualiza Zustand store com novo token
        try {
          const { useAuthStore } = await import('@/stores/useAuthStore');
          useAuthStore.getState().updateToken(newToken);
        } catch (storeError) {
          console.log('⚠️ Não foi possível atualizar Zustand store:', storeError);
        }

        // Processa todas as requests que estavam aguardando
        pendingRequests.forEach((callback) => callback(newToken));
        pendingRequests = [];

        // Atualiza header da request original com novo token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        
        // Marca que esta request foi feita com token recém-renovado
        // Se receber 401 de novo, é falta de permissão, não token expirado
        originalRequest._refreshedToken = true;

        // Retenta a request original
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log('❌ Erro ao renovar token:', refreshError);
        
        // Limpa cache de token
        cachedToken = null;
        
        // Rejeita todas as requests que estavam aguardando
        pendingRequests.forEach((callback) => callback(undefined, refreshError));
        pendingRequests = [];
        
        // Detecta se é erro de rede (offline) - NÃO desloga nesse caso
        if (axios.isAxiosError(refreshError)) {
          const isNetworkError = 
            refreshError.code === 'ECONNABORTED' ||
            refreshError.code === 'ERR_NETWORK' ||
            refreshError.message.includes('Network Error') ||
            refreshError.message.includes('timeout');
          
          if (isNetworkError) {
            console.log('📡 Erro de rede detectado - preservando credenciais');
            throw new Error('Sem conexão com a internet. Tente novamente.');
          }
        }
        
        // Se não é erro de rede, é credencial inválida ou usuário deletado
        const { authService } = await import('./auth.service');
        
        // Reset contador antes de logout
        refreshAttempts = 0;
        
        await authService.logout();
        
        // Limpa cache após logout
        cachedToken = null;
        
        // Redireciona para login (usuário deletado ou credenciais inválidas)
        try {
          const { router } = await import('expo-router');
          router.replace('/login');
        } catch (routerError) {
          console.log('⚠️ Não foi possível redirecionar:', routerError);
        }
        
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Função para limpar cache de token (usada pelo logout)
export const clearTokenCache = () => {
  cachedToken = null;
  refreshAttempts = 0;
};

// Função para atualizar cache de token (usada pelo login e checkAuth)
export const updateTokenCache = (token: string | null) => {
  cachedToken = token;
};

export default apiClient;

import axios from 'axios';

// Cria instância do Axios com interceptor para auto-refresh
const apiClient = axios.create({
  timeout: 10000,
});

// Flag para evitar múltiplos re-logins simultâneos
let isRefreshing = false;

// Fila de requests pendentes aguardando o refresh completar
type PendingRequestCallback = (token?: string, error?: any) => void;
let pendingRequests: PendingRequestCallback[] = [];

// Interceptor de request: injeta token automaticamente
apiClient.interceptors.request.use(
  async (config) => {
    // Importa getItemAsync apenas quando necessário
    const { getItemAsync } = await import('expo-secure-store');
    const token = await getItemAsync('authToken');
    
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

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
        console.log('🔄 Token expirado, reautenticando automaticamente...');

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

        // Retenta a request original
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log('❌ Erro ao renovar token:', refreshError);
        
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
        await authService.logout();
        
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

export default apiClient;

import axios from 'axios';

// Cria instância do Axios com interceptor para auto-refresh
const apiClient = axios.create({
  timeout: 10000,
});

// Flag para evitar múltiplos re-logins simultâneos
let isRefreshing = false;

// Interceptor de resposta: detecta 401 e refaz login automaticamente
apiClient.interceptors.response.use(
  (response) => response, // Sucesso, apenas retorna
  async (error) => {
    const originalRequest = error.config;

    // Se recebeu 401 (token expirado) e ainda não tentou re-logar
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
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

        // Atualiza header da request original com novo token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        // Retenta a request original
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log('❌ Erro ao renovar token:', refreshError);
        
        // Se falhou, usa authService.logout() para limpar tudo
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

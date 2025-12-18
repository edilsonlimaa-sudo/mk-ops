import axios from 'axios';

interface LoginCredentials {
  ipMkAuth: string;
  clientId: string;
  clientSecret: string;
}

interface AuthResponse {
  token: string;
}

/**
 * Auth Service - Responsável apenas por chamadas HTTP de autenticação
 * Não gerencia persistência (SecureStore) - isso é responsabilidade do useAuthStore
 */
class AuthService {
  private async encodeBase64(str: string): Promise<string> {
    // No React Native, usamos btoa (disponível globalmente)
    return btoa(str);
  }

  /**
   * Faz login na API usando Basic Auth
   * @returns Token JWT
   */
  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const { ipMkAuth, clientId, clientSecret } = credentials;
      
      // Monta a string Client_Id:Client_Secret
      const authString = `${clientId}:${clientSecret}`;
      
      // Converte para Base64
      const base64Auth = await this.encodeBase64(authString);
      
      // URL da API
      const url = `https://${ipMkAuth}/api/`;
      
      console.log('🔐 Fazendo login em:', url);
      console.log('📝 Auth header:', `Basic ${base64Auth.substring(0, 20)}...`);
      
      // Faz a requisição GET com Basic Auth
      const response = await axios.get<AuthResponse>(url, {
        headers: {
          'Authorization': `Basic ${base64Auth}`,
        },
        timeout: 10000, // 10 segundos
      });
      
      console.log('✅ Resposta:', response.status, response.data);
      
      // O token JWT vem direto na resposta (string) ou dentro de um objeto
      const token = typeof response.data === 'string' 
        ? response.data 
        : response.data.token;
      
      if (!token) {
        throw new Error('Token não encontrado na resposta');
      }
      
      return token;
    } catch (error) {
      console.log('❌ Erro completo:', error);
      
      if (axios.isAxiosError(error)) {
        console.log('📡 Erro Axios:', {
          status: error.response?.status,
          data: error.response?.data,
          code: error.code,
          message: error.message
        });
        
        if (error.response?.status === 401) {
          throw new Error('Credenciais inválidas');
        }
        if (error.code === 'ECONNABORTED') {
          throw new Error('Timeout: servidor não respondeu');
        }
        throw new Error(error.response?.data?.error?.text || error.message || 'Erro ao autenticar');
      }
      
      console.log('⚠️ Erro não é do Axios:', error);
      throw new Error(`Erro desconhecido: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const authService = new AuthService();

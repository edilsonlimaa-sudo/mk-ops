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
   * @throws AxiosError se a requisição falhar
   */
  async login(credentials: LoginCredentials): Promise<string> {
    const { ipMkAuth, clientId, clientSecret } = credentials;
    
    const authString = `${clientId}:${clientSecret}`;
    const base64Auth = await this.encodeBase64(authString);
    const url = `https://${ipMkAuth}/api/`;
    
    const response = await axios.get<AuthResponse>(url, {
      headers: { 'Authorization': `Basic ${base64Auth}` },
      timeout: 10000,
    });
    
    // O token JWT vem direto na resposta (string) ou dentro de um objeto
    const token = typeof response.data === 'string' 
      ? response.data 
      : response.data.token;
    
    if (!token) {
      throw new Error('Token não encontrado na resposta');
    }
    
    return token;
  }
}

export const authService = new AuthService();

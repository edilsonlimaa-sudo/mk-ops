import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

interface LoginCredentials {
  ipMkAuth: string;
  clientId: string;
  clientSecret: string;
}

interface AuthResponse {
  token: string;
}

class AuthService {
  private async encodeBase64(str: string): Promise<string> {
    // No React Native, usamos btoa (disponível globalmente)
    return btoa(str);
  }

  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const { ipMkAuth, clientId, clientSecret } = credentials;
      
      // Monta a string Client_Id:Client_Secret
      const authString = `${clientId}:${clientSecret}`;
      
      // Converte para Base64
      const base64Auth = await this.encodeBase64(authString);
      
      // URL da API
      const url = `https://${ipMkAuth}/api/`;
      
      // Faz a requisição GET com Basic Auth
      const response = await axios.get<AuthResponse>(url, {
        headers: {
          'Authorization': `Basic ${base64Auth}`,
        },
        timeout: 10000, // 10 segundos
      });
      
      // O token JWT vem na resposta
      const token = response.data.token;
      
      // Salva o token no SecureStore
      await SecureStore.setItemAsync('authToken', token);
      
      // Salva também o IP para usar nas próximas requisições
      await SecureStore.setItemAsync('ipMkAuth', ipMkAuth);
      
      return token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Credenciais inválidas');
        }
        if (error.code === 'ECONNABORTED') {
          throw new Error('Timeout: servidor não respondeu');
        }
        throw new Error(error.response?.data?.error?.text || 'Erro ao autenticar');
      }
      throw new Error('Erro desconhecido ao autenticar');
    }
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('ipMkAuth');
  }

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('authToken');
  }

  async getIpMkAuth(): Promise<string | null> {
    return await SecureStore.getItemAsync('ipMkAuth');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();

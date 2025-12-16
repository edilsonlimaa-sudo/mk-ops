import axios from 'axios';
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';

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
      
      console.log('💾 Salvando token e credenciais:', token.substring(0, 30) + '...');
      
      // Salva o token
      await setItemAsync('authToken', token);
      
      // Salva IP e credenciais para auto-refresh
      await setItemAsync('ipMkAuth', ipMkAuth);
      await setItemAsync('clientId', clientId);
      await setItemAsync('clientSecret', clientSecret);
      
      console.log('✅ Credenciais salvas para auto-refresh');
      
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

  async logout(): Promise<void> {
    await deleteItemAsync('authToken');
    await deleteItemAsync('ipMkAuth');
    await deleteItemAsync('clientId');
    await deleteItemAsync('clientSecret');
  }

  async getToken(): Promise<string | null> {
    return await getItemAsync('authToken');
  }

  async getIpMkAuth(): Promise<string | null> {
    return await getItemAsync('ipMkAuth');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Verifica se o token expirou (60 minutos)
   */
  async getSavedCredentials(): Promise<LoginCredentials | null> {
    const ipMkAuth = await getItemAsync('ipMkAuth');
    const clientId = await getItemAsync('clientId');
    const clientSecret = await getItemAsync('clientSecret');
    
    if (!ipMkAuth || !clientId || !clientSecret) {
      return null;
    }
    
    return { ipMkAuth, clientId, clientSecret };
  }
}

export const authService = new AuthService();

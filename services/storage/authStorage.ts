import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';

export interface LoginCredentials {
  ipMkAuth: string;
  clientId: string;
  clientSecret: string;
}

export interface SessionData {
  token: string;
  ipMkAuth: string;
}

/**
 * Auth Storage - Gerencia persistência de credenciais de autenticação no SecureStore
 * Responsável apenas por operações CRUD no SecureStore
 */
class AuthStorage {
  private readonly KEYS = {
    TOKEN: 'authToken',
    IP_MK_AUTH: 'ipMkAuth',
    CLIENT_ID: 'clientId',
    CLIENT_SECRET: 'clientSecret',
  } as const;

  /**
   * Salva credenciais completas e token no SecureStore
   */
  async saveCredentials(credentials: LoginCredentials, token: string): Promise<void> {
    await setItemAsync(this.KEYS.TOKEN, token);
    await setItemAsync(this.KEYS.IP_MK_AUTH, credentials.ipMkAuth);
    await setItemAsync(this.KEYS.CLIENT_ID, credentials.clientId);
    await setItemAsync(this.KEYS.CLIENT_SECRET, credentials.clientSecret);
  }

  /**
   * Recupera sessão (token + ipMkAuth) para restauração
   */
  async getSession(): Promise<SessionData | null> {
    const token = await getItemAsync(this.KEYS.TOKEN);
    const ipMkAuth = await getItemAsync(this.KEYS.IP_MK_AUTH);

    if (!token || !ipMkAuth) {
      return null;
    }

    return { token, ipMkAuth };
  }

  /**
   * Recupera credenciais completas para auto-refresh
   */
  async getCredentials(): Promise<LoginCredentials | null> {
    const ipMkAuth = await getItemAsync(this.KEYS.IP_MK_AUTH);
    const clientId = await getItemAsync(this.KEYS.CLIENT_ID);
    const clientSecret = await getItemAsync(this.KEYS.CLIENT_SECRET);

    if (!ipMkAuth || !clientId || !clientSecret) {
      return null;
    }

    return { ipMkAuth, clientId, clientSecret };
  }

  /**
   * Remove todas as credenciais do SecureStore
   */
  async clearAll(): Promise<void> {
    await deleteItemAsync(this.KEYS.TOKEN);
    await deleteItemAsync(this.KEYS.IP_MK_AUTH);
    await deleteItemAsync(this.KEYS.CLIENT_ID);
    await deleteItemAsync(this.KEYS.CLIENT_SECRET);
  }
}

export const authStorage = new AuthStorage();

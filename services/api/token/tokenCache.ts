/**
 * Gerencia cache de token JWT em memória
 * Evita leituras repetidas do SecureStore (I/O assíncrono)
 */
class TokenCache {
  private cachedToken: string | null = null;

  /**
   * Retorna token do cache (ou null se não houver)
   */
  get(): string | null {
    return this.cachedToken;
  }

  /**
   * Atualiza token no cache
   */
  set(token: string | null): void {
    this.cachedToken = token;
  }

  /**
   * Limpa token do cache
   */
  clear(): void {
    this.cachedToken = null;
  }

  /**
   * Verifica se há token no cache
   */
  has(): boolean {
    return this.cachedToken !== null;
  }
}

export const tokenCache = new TokenCache();

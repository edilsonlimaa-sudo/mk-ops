/**
 * Gerencia tentativas de refresh e fila de requests pendentes
 * Previne loops infinitos e gerencia concorrência
 */

type PendingRequestCallback = (token?: string, error?: any) => void;

class TokenRefreshManager {
  private refreshAttempts = 0;
  private readonly MAX_REFRESH_ATTEMPTS = 3;
  private isRefreshing = false;
  private pendingRequests: PendingRequestCallback[] = [];

  /**
   * Verifica se pode tentar refresh novamente
   */
  canRetry(): boolean {
    return this.refreshAttempts < this.MAX_REFRESH_ATTEMPTS;
  }

  /**
   * Incrementa contador de tentativas
   */
  incrementAttempts(): void {
    this.refreshAttempts++;
  }

  /**
   * Retorna número atual de tentativas
   */
  getAttempts(): number {
    return this.refreshAttempts;
  }

  /**
   * Reseta contador de tentativas (após sucesso ou logout)
   */
  resetAttempts(): void {
    this.refreshAttempts = 0;
  }

  /**
   * Verifica se refresh está em andamento
   */
  getIsRefreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * Define estado de refresh
   */
  setIsRefreshing(value: boolean): void {
    this.isRefreshing = value;
  }

  /**
   * Adiciona request à fila de espera
   */
  addPendingRequest(callback: PendingRequestCallback): void {
    this.pendingRequests.push(callback);
  }

  /**
   * Resolve todas as requests pendentes com novo token
   */
  resolveAllPending(token: string): void {
    this.pendingRequests.forEach((callback) => callback(token));
    this.pendingRequests = [];
  }

  /**
   * Rejeita todas as requests pendentes com erro
   */
  rejectAllPending(error: any): void {
    this.pendingRequests.forEach((callback) => callback(undefined, error));
    this.pendingRequests = [];
  }

  /**
   * Limpa tudo (usado no logout)
   */
  reset(): void {
    this.resetAttempts();
    this.isRefreshing = false;
    this.pendingRequests = [];
  }
}

export const tokenRefreshManager = new TokenRefreshManager();

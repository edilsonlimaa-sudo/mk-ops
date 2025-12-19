/**
 * Gerencia fila de requests pendentes durante refresh de token
 * Previne múltiplos refreshes simultâneos
 */

type PendingRequestCallback = (error?: any) => void;

class TokenRefreshManager {
  private isRefreshing = false;
  private pendingRequests: PendingRequestCallback[] = [];

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
   * Resolve todas as requests pendentes
   */
  resolveAllPending(): void {
    this.pendingRequests.forEach((callback) => callback());
    this.pendingRequests = [];
  }

  /**
   * Rejeita todas as requests pendentes com erro
   */
  rejectAllPending(error: any): void {
    this.pendingRequests.forEach((callback) => callback(error));
    this.pendingRequests = [];
  }

  /**
   * Limpa tudo (usado no logout)
   */
  reset(): void {
    this.isRefreshing = false;
    this.pendingRequests = [];
  }
}

export const tokenRefreshManager = new TokenRefreshManager();

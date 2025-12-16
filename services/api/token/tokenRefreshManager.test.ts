import { tokenRefreshManager } from './tokenRefreshManager';

describe('TokenRefreshManager', () => {
  beforeEach(() => {
    // Reseta estado antes de cada teste
    tokenRefreshManager.reset();
  });

  describe('canRetry()', () => {
    it('deve retornar true quando nenhuma tentativa foi feita', () => {
      expect(tokenRefreshManager.canRetry()).toBe(true);
    });

    it('deve retornar true enquanto attempts < 3', () => {
      tokenRefreshManager.incrementAttempts();
      expect(tokenRefreshManager.canRetry()).toBe(true);
      
      tokenRefreshManager.incrementAttempts();
      expect(tokenRefreshManager.canRetry()).toBe(true);
    });

    it('deve retornar false após 3 tentativas', () => {
      tokenRefreshManager.incrementAttempts();
      tokenRefreshManager.incrementAttempts();
      tokenRefreshManager.incrementAttempts();
      expect(tokenRefreshManager.canRetry()).toBe(false);
    });
  });

  describe('incrementAttempts() / getAttempts()', () => {
    it('deve incrementar contador de tentativas', () => {
      expect(tokenRefreshManager.getAttempts()).toBe(0);
      
      tokenRefreshManager.incrementAttempts();
      expect(tokenRefreshManager.getAttempts()).toBe(1);
      
      tokenRefreshManager.incrementAttempts();
      expect(tokenRefreshManager.getAttempts()).toBe(2);
    });
  });

  describe('resetAttempts()', () => {
    it('deve resetar contador para 0', () => {
      tokenRefreshManager.incrementAttempts();
      tokenRefreshManager.incrementAttempts();
      
      tokenRefreshManager.resetAttempts();
      expect(tokenRefreshManager.getAttempts()).toBe(0);
    });
  });

  describe('isRefreshing flag', () => {
    it('deve iniciar como false', () => {
      expect(tokenRefreshManager.getIsRefreshing()).toBe(false);
    });

    it('deve permitir setar como true', () => {
      tokenRefreshManager.setIsRefreshing(true);
      expect(tokenRefreshManager.getIsRefreshing()).toBe(true);
    });

    it('deve permitir setar como false', () => {
      tokenRefreshManager.setIsRefreshing(true);
      tokenRefreshManager.setIsRefreshing(false);
      expect(tokenRefreshManager.getIsRefreshing()).toBe(false);
    });
  });

  describe('Pending requests queue', () => {
    it('deve adicionar callback à fila', () => {
      const callback = jest.fn();
      tokenRefreshManager.addPendingRequest(callback);
      
      // Resolve fila com token
      tokenRefreshManager.resolveAllPending('new-token');
      
      expect(callback).toHaveBeenCalledWith('new-token');
    });

    it('deve processar múltiplos callbacks na fila', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();
      
      tokenRefreshManager.addPendingRequest(callback1);
      tokenRefreshManager.addPendingRequest(callback2);
      tokenRefreshManager.addPendingRequest(callback3);
      
      tokenRefreshManager.resolveAllPending('token-123');
      
      expect(callback1).toHaveBeenCalledWith('token-123');
      expect(callback2).toHaveBeenCalledWith('token-123');
      expect(callback3).toHaveBeenCalledWith('token-123');
    });

    it('deve limpar fila após resolveAllPending', () => {
      const callback = jest.fn();
      tokenRefreshManager.addPendingRequest(callback);
      
      tokenRefreshManager.resolveAllPending('token');
      
      // Adiciona novo callback e resolve novamente
      const callback2 = jest.fn();
      tokenRefreshManager.addPendingRequest(callback2);
      tokenRefreshManager.resolveAllPending('token2');
      
      // Primeiro callback não deve ser chamado novamente
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledWith('token2');
    });

    it('deve rejeitar todos callbacks com erro', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const error = new Error('Refresh failed');
      
      tokenRefreshManager.addPendingRequest(callback1);
      tokenRefreshManager.addPendingRequest(callback2);
      
      tokenRefreshManager.rejectAllPending(error);
      
      expect(callback1).toHaveBeenCalledWith(undefined, error);
      expect(callback2).toHaveBeenCalledWith(undefined, error);
    });

    it('deve limpar fila após rejectAllPending', () => {
      const callback = jest.fn();
      tokenRefreshManager.addPendingRequest(callback);
      
      tokenRefreshManager.rejectAllPending(new Error('Test'));
      
      // Tenta resolver - não deve chamar callback anterior
      const callback2 = jest.fn();
      tokenRefreshManager.addPendingRequest(callback2);
      tokenRefreshManager.resolveAllPending('new-token');
      
      expect(callback).toHaveBeenCalledTimes(1); // Apenas reject
      expect(callback2).toHaveBeenCalledWith('new-token');
    });
  });

  describe('reset()', () => {
    it('deve resetar completamente o estado', () => {
      // Configura estado
      tokenRefreshManager.incrementAttempts();
      tokenRefreshManager.incrementAttempts();
      tokenRefreshManager.setIsRefreshing(true);
      const callback = jest.fn();
      tokenRefreshManager.addPendingRequest(callback);
      
      // Reset
      tokenRefreshManager.reset();
      
      // Verifica reset completo
      expect(tokenRefreshManager.getAttempts()).toBe(0);
      expect(tokenRefreshManager.getIsRefreshing()).toBe(false);
      
      // Fila deve estar vazia (callback não será chamado)
      tokenRefreshManager.resolveAllPending('token');
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Singleton behavior', () => {
    it('deve manter estado entre múltiplas referências', () => {
      const { tokenRefreshManager: manager1 } = require('./tokenRefreshManager');
      const { tokenRefreshManager: manager2 } = require('./tokenRefreshManager');
      
      manager1.incrementAttempts();
      expect(manager2.getAttempts()).toBe(1);
      
      manager2.setIsRefreshing(true);
      expect(manager1.getIsRefreshing()).toBe(true);
    });
  });
});

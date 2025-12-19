import { tokenRefreshManager } from './tokenRefreshManager';

describe('TokenRefreshManager', () => {
  beforeEach(() => {
    // Reseta estado antes de cada teste
    tokenRefreshManager.reset();
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
      
      // Resolve fila
      tokenRefreshManager.resolveAllPending();
      
      expect(callback).toHaveBeenCalledWith();
    });

    it('deve processar múltiplos callbacks na fila', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();
      
      tokenRefreshManager.addPendingRequest(callback1);
      tokenRefreshManager.addPendingRequest(callback2);
      tokenRefreshManager.addPendingRequest(callback3);
      
      tokenRefreshManager.resolveAllPending();
      
      expect(callback1).toHaveBeenCalledWith();
      expect(callback2).toHaveBeenCalledWith();
      expect(callback3).toHaveBeenCalledWith();
    });

    it('deve limpar fila após resolveAllPending', () => {
      const callback = jest.fn();
      tokenRefreshManager.addPendingRequest(callback);
      
      tokenRefreshManager.resolveAllPending();
      
      // Adiciona novo callback e resolve novamente
      const callback2 = jest.fn();
      tokenRefreshManager.addPendingRequest(callback2);
      tokenRefreshManager.resolveAllPending();
      
      // Primeiro callback não deve ser chamado novamente
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledWith();
    });

    it('deve rejeitar todos callbacks com erro', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const error = new Error('Refresh failed');
      
      tokenRefreshManager.addPendingRequest(callback1);
      tokenRefreshManager.addPendingRequest(callback2);
      
      tokenRefreshManager.rejectAllPending(error);
      
      expect(callback1).toHaveBeenCalledWith(error);
      expect(callback2).toHaveBeenCalledWith(error);
    });

    it('deve limpar fila após rejectAllPending', () => {
      const callback = jest.fn();
      tokenRefreshManager.addPendingRequest(callback);
      
      tokenRefreshManager.rejectAllPending(new Error('Test'));
      
      // Tenta resolver - não deve chamar callback anterior
      const callback2 = jest.fn();
      tokenRefreshManager.addPendingRequest(callback2);
      tokenRefreshManager.resolveAllPending();
      
      expect(callback).toHaveBeenCalledTimes(1); // Apenas reject
      expect(callback2).toHaveBeenCalledWith();
    });
  });

  describe('reset()', () => {
    it('deve resetar completamente o estado', () => {
      // Configura estado
      tokenRefreshManager.setIsRefreshing(true);
      const callback = jest.fn();
      tokenRefreshManager.addPendingRequest(callback);
      
      // Reset
      tokenRefreshManager.reset();
      
      // Verifica reset completo
      expect(tokenRefreshManager.getIsRefreshing()).toBe(false);
      
      // Fila deve estar vazia (callback não será chamado)
      tokenRefreshManager.resolveAllPending();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Singleton behavior', () => {
    it('deve manter estado entre múltiplas referências', () => {
      const { tokenRefreshManager: manager1 } = require('./tokenRefreshManager');
      const { tokenRefreshManager: manager2 } = require('./tokenRefreshManager');
      
      manager1.setIsRefreshing(true);
      expect(manager2.getIsRefreshing()).toBe(true);
      
      manager2.setIsRefreshing(false);
      expect(manager1.getIsRefreshing()).toBe(false);
    });
  });
});

import { tokenCache } from './tokenCache';

describe('TokenCache', () => {
  beforeEach(() => {
    // Limpa cache antes de cada teste
    tokenCache.clear();
  });

  describe('get()', () => {
    it('deve retornar null quando cache está vazio', () => {
      expect(tokenCache.get()).toBeNull();
    });

    it('deve retornar token quando existe no cache', () => {
      tokenCache.set('my-token');
      expect(tokenCache.get()).toBe('my-token');
    });
  });

  describe('set()', () => {
    it('deve armazenar token no cache', () => {
      tokenCache.set('new-token');
      expect(tokenCache.get()).toBe('new-token');
    });

    it('deve sobrescrever token existente', () => {
      tokenCache.set('old-token');
      tokenCache.set('new-token');
      expect(tokenCache.get()).toBe('new-token');
    });

    it('deve permitir setar null', () => {
      tokenCache.set('some-token');
      tokenCache.set(null);
      expect(tokenCache.get()).toBeNull();
    });
  });

  describe('has()', () => {
    it('deve retornar false quando cache está vazio', () => {
      expect(tokenCache.has()).toBe(false);
    });

    it('deve retornar true quando existe token', () => {
      tokenCache.set('token');
      expect(tokenCache.has()).toBe(true);
    });

    it('deve retornar false após clear', () => {
      tokenCache.set('token');
      tokenCache.clear();
      expect(tokenCache.has()).toBe(false);
    });
  });

  describe('clear()', () => {
    it('deve limpar token do cache', () => {
      tokenCache.set('token');
      tokenCache.clear();
      expect(tokenCache.get()).toBeNull();
      expect(tokenCache.has()).toBe(false);
    });

    it('deve ser idempotente (chamar múltiplas vezes não causa erro)', () => {
      tokenCache.set('token');
      tokenCache.clear();
      tokenCache.clear();
      tokenCache.clear();
      expect(tokenCache.get()).toBeNull();
    });
  });

  describe('Singleton behavior', () => {
    it('deve manter estado entre múltiplas referências', () => {
      const { tokenCache: cache1 } = require('./tokenCache');
      const { tokenCache: cache2 } = require('./tokenCache');
      
      cache1.set('shared-token');
      expect(cache2.get()).toBe('shared-token');
    });
  });
});

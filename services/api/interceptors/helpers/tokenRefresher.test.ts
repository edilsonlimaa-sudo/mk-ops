import { tokenRefreshManager } from '../../token/tokenRefreshManager';
import { refreshToken } from './tokenRefresher';

// Mock dos módulos
jest.mock('../../auth.service', () => ({
  authService: {
    login: jest.fn(),
  },
}));

jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      updateToken: jest.fn(),
      getSavedCredentials: jest.fn(),
    })),
  },
}));

describe('tokenRefresher', () => {
  let mockAuthService: any;
  let mockUseAuthStore: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    tokenRefreshManager.reset();

    // Importa mocks
    mockAuthService = (await import('../../auth.service')).authService;
    mockUseAuthStore = (await import('@/stores/useAuthStore')).useAuthStore;
  });

  describe('refreshToken', () => {
    it('should refresh token successfully and update cache', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', clientId: 'test-client', clientSecret: 'test-secret' };
      const newToken = 'new-jwt-token-abc123';

      mockUseAuthStore.getState.mockReturnValue({
        updateToken: jest.fn(),
        getSavedCredentials: jest.fn().mockResolvedValue(credentials),
      });
      mockAuthService.login.mockResolvedValue(newToken);

      const result = await refreshToken();

      expect(result).toBe(newToken);
      expect(mockUseAuthStore.getState().getSavedCredentials).toHaveBeenCalledTimes(1);
      expect(mockAuthService.login).toHaveBeenCalledWith(credentials);
    });

    it('should reset attempts counter after successful refresh', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', clientId: 'test-client', clientSecret: 'test-secret' };
      const newToken = 'new-jwt-token-abc123';

      mockUseAuthStore.getState.mockReturnValue({
        updateToken: jest.fn(),
        getSavedCredentials: jest.fn().mockResolvedValue(credentials),
      });
      mockAuthService.login.mockResolvedValue(newToken);

      // Simula tentativas anteriores
      tokenRefreshManager.incrementAttempts();
      tokenRefreshManager.incrementAttempts();
      expect(tokenRefreshManager.getAttempts()).toBe(2);

      await refreshToken();

      expect(tokenRefreshManager.getAttempts()).toBe(0);
    });

    it('should update Zustand store with new token', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', clientId: 'test-client', clientSecret: 'test-secret' };
      const newToken = 'new-jwt-token-abc123';
      const mockUpdateToken = jest.fn();

      mockUseAuthStore.getState.mockReturnValue({ 
        updateToken: mockUpdateToken,
        getSavedCredentials: jest.fn().mockResolvedValue(credentials),
      });
      mockAuthService.login.mockResolvedValue(newToken);

      await refreshToken();

      expect(mockUpdateToken).toHaveBeenCalledWith(newToken);
    });

    it('should throw error when credentials are not found', async () => {
      mockUseAuthStore.getState.mockReturnValue({
        updateToken: jest.fn(),
        getSavedCredentials: jest.fn().mockResolvedValue(null),
      });

      await expect(refreshToken()).rejects.toThrow('Credenciais não salvas');

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should propagate login errors', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', clientId: 'test-client', clientSecret: 'wrong-secret' };

      mockUseAuthStore.getState.mockReturnValue({
        updateToken: jest.fn(),
        getSavedCredentials: jest.fn().mockResolvedValue(credentials),
      });
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(refreshToken()).rejects.toThrow('Invalid credentials');
    });

    it('should continue even if Zustand store update fails', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', clientId: 'test-client', clientSecret: 'test-secret' };
      const newToken = 'new-jwt-token-abc123';

      // Primeira chamada: retorna credenciais normalmente
      // Segunda chamada: falha ao tentar atualizar
      let callCount = 0;
      mockUseAuthStore.getState.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Primeira chamada (getSavedCredentials)
          return {
            updateToken: jest.fn(),
            getSavedCredentials: jest.fn().mockResolvedValue(credentials),
          };
        } else {
          // Segunda chamada (updateToken) - lança erro
          throw new Error('Store error');
        }
      });
      
      mockAuthService.login.mockResolvedValue(newToken);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await refreshToken();

      expect(result).toBe(newToken);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Não foi possível atualizar Zustand store'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});

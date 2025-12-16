import { tokenCache } from '../../token/tokenCache';
import { tokenRefreshManager } from '../../token/tokenRefreshManager';
import { refreshToken } from './tokenRefresher';

// Mock dos módulos
jest.mock('../../auth.service', () => ({
  authService: {
    getSavedCredentials: jest.fn(),
    login: jest.fn(),
  },
}));

jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      updateToken: jest.fn(),
    })),
  },
}));

describe('tokenRefresher', () => {
  let mockAuthService: any;
  let mockUseAuthStore: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    tokenCache.clear();
    tokenRefreshManager.reset();

    // Importa mocks
    mockAuthService = (await import('../../auth.service')).authService;
    mockUseAuthStore = (await import('@/stores/useAuthStore')).useAuthStore;
  });

  describe('refreshToken', () => {
    it('should refresh token successfully and update cache', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', user: 'testuser', password: 'pass123' };
      const newToken = 'new-jwt-token-abc123';

      mockAuthService.getSavedCredentials.mockResolvedValue(credentials);
      mockAuthService.login.mockResolvedValue(newToken);

      const result = await refreshToken();

      expect(result).toBe(newToken);
      expect(mockAuthService.getSavedCredentials).toHaveBeenCalledTimes(1);
      expect(mockAuthService.login).toHaveBeenCalledWith(credentials);
      expect(tokenCache.get()).toBe(newToken);
    });

    it('should reset attempts counter after successful refresh', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', user: 'testuser', password: 'pass123' };
      const newToken = 'new-jwt-token-abc123';

      mockAuthService.getSavedCredentials.mockResolvedValue(credentials);
      mockAuthService.login.mockResolvedValue(newToken);

      // Simula tentativas anteriores
      tokenRefreshManager.incrementAttempts();
      tokenRefreshManager.incrementAttempts();
      expect(tokenRefreshManager.getAttempts()).toBe(2);

      await refreshToken();

      expect(tokenRefreshManager.getAttempts()).toBe(0);
    });

    it('should update Zustand store with new token', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', user: 'testuser', password: 'pass123' };
      const newToken = 'new-jwt-token-abc123';
      const mockUpdateToken = jest.fn();

      mockAuthService.getSavedCredentials.mockResolvedValue(credentials);
      mockAuthService.login.mockResolvedValue(newToken);
      mockUseAuthStore.getState.mockReturnValue({ updateToken: mockUpdateToken });

      await refreshToken();

      expect(mockUpdateToken).toHaveBeenCalledWith(newToken);
    });

    it('should throw error when credentials are not found', async () => {
      mockAuthService.getSavedCredentials.mockResolvedValue(null);

      await expect(refreshToken()).rejects.toThrow('Credenciais não salvas');

      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(tokenCache.get()).toBeNull();
    });

    it('should propagate login errors', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', user: 'testuser', password: 'wrongpass' };

      mockAuthService.getSavedCredentials.mockResolvedValue(credentials);
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(refreshToken()).rejects.toThrow('Invalid credentials');

      expect(tokenCache.get()).toBeNull();
    });

    it('should continue even if Zustand store update fails', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', user: 'testuser', password: 'pass123' };
      const newToken = 'new-jwt-token-abc123';

      mockAuthService.getSavedCredentials.mockResolvedValue(credentials);
      mockAuthService.login.mockResolvedValue(newToken);
      mockUseAuthStore.getState.mockImplementation(() => {
        throw new Error('Store error');
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await refreshToken();

      expect(result).toBe(newToken);
      expect(tokenCache.get()).toBe(newToken);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Não foi possível atualizar Zustand store'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});

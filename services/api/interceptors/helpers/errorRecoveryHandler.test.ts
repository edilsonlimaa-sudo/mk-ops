import { tokenRefreshManager } from '../../token/tokenRefreshManager';
import { handleRefreshFailure } from './errorRecoveryHandler';

// Mock dos módulos
jest.mock('../../auth.service', () => ({
  authService: {
    logout: jest.fn(),
  },
}));

jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      logout: jest.fn(),
    })),
  },
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

describe('errorRecoveryHandler', () => {
  let mockUseAuthStore: any;
  let mockRouter: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    tokenRefreshManager.reset();

    // Importa mocks
    mockUseAuthStore = (await import('@/stores/useAuthStore')).useAuthStore;
    mockRouter = (await import('expo-router')).router;
  });

  describe('handleRefreshFailure', () => {
    it('should reset refresh attempts counter', async () => {
      // Simula tentativas anteriores
      tokenRefreshManager.incrementAttempts();
      tokenRefreshManager.incrementAttempts();
      expect(tokenRefreshManager.getAttempts()).toBe(2);

      mockUseAuthStore.getState.mockReturnValue({ logout: jest.fn().mockResolvedValue(undefined) });

      await handleRefreshFailure();

      expect(tokenRefreshManager.getAttempts()).toBe(0);
    });

    it('should call useAuthStore.logout', async () => {
      const mockLogout = jest.fn().mockResolvedValue(undefined);
      mockUseAuthStore.getState.mockReturnValue({ logout: mockLogout });

      await handleRefreshFailure();

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should redirect to /(auth)/login after logout', async () => {
      mockUseAuthStore.getState.mockReturnValue({ logout: jest.fn().mockResolvedValue(undefined) });

      await handleRefreshFailure();

      expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/login');
    });

    it('should handle router redirect errors gracefully', async () => {
      mockUseAuthStore.getState.mockReturnValue({ logout: jest.fn().mockResolvedValue(undefined) });
      mockRouter.replace.mockImplementation(() => {
        throw new Error('Router not available');
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handleRefreshFailure();

      expect(mockUseAuthStore.getState().logout).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Não foi possível redirecionar'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should complete cleanup even if logout fails', async () => {
      tokenRefreshManager.incrementAttempts();

      mockUseAuthStore.getState.mockReturnValue({ 
        logout: jest.fn().mockRejectedValue(new Error('Logout failed'))
      });

      await expect(handleRefreshFailure()).rejects.toThrow('Logout failed');

      // Verifica que tentativas foram resetadas mesmo com erro
      expect(tokenRefreshManager.getAttempts()).toBe(0);
    });
  });
});

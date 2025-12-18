import { tokenRefreshManager } from '../../token/tokenRefreshManager';
import { handleRefreshFailure } from './errorRecoveryHandler';

// Mock dos módulos
jest.mock('../../auth.service', () => ({
  authService: {
    logout: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

describe('errorRecoveryHandler', () => {
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    tokenRefreshManager.reset();

    // Importa mocks
    mockAuthService = (await import('../../auth.service')).authService;
    mockRouter = (await import('expo-router')).router;
  });

  describe('handleRefreshFailure', () => {
    it('should reset refresh attempts counter', async () => {
      // Simula tentativas anteriores
      tokenRefreshManager.incrementAttempts();
      tokenRefreshManager.incrementAttempts();
      expect(tokenRefreshManager.getAttempts()).toBe(2);

      mockAuthService.logout.mockResolvedValue(undefined);

      await handleRefreshFailure();

      expect(tokenRefreshManager.getAttempts()).toBe(0);
    });

    it('should call authService.logout', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await handleRefreshFailure();

      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    });

    it('should redirect to /login after logout', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await handleRefreshFailure();

      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });

    it('should handle router redirect errors gracefully', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);
      mockRouter.replace.mockImplementation(() => {
        throw new Error('Router not available');
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handleRefreshFailure();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Não foi possível redirecionar'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should complete cleanup even if logout fails', async () => {
      tokenRefreshManager.incrementAttempts();

      mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      await expect(handleRefreshFailure()).rejects.toThrow('Logout failed');

      // Verifica que tentativas foram resetadas mesmo com erro
      expect(tokenRefreshManager.getAttempts()).toBe(0);
    });
  });
});

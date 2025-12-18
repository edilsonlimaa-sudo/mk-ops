import { tokenRefreshManager } from '../../token/tokenRefreshManager';
import { refreshToken } from './tokenRefresher';

// Mock dos módulos
jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      login: jest.fn(),
      getSavedCredentials: jest.fn(),
      token: null,
    })),
  },
}));

describe('tokenRefresher', () => {
  let mockUseAuthStore: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    tokenRefreshManager.reset();

    // Importa mocks
    mockUseAuthStore = (await import('@/stores/useAuthStore')).useAuthStore;
  });

  describe('refreshToken', () => {
    it('should refresh token successfully using useAuthStore.login()', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', clientId: 'test-client', clientSecret: 'test-secret' };
      const newToken = 'new-jwt-token-abc123';
      const mockLogin = jest.fn().mockResolvedValue(undefined);

      mockUseAuthStore.getState.mockReturnValue({
        login: mockLogin,
        getSavedCredentials: jest.fn().mockResolvedValue(credentials),
        token: newToken,
      });

      const result = await refreshToken();

      expect(result).toBe(newToken);
      expect(mockUseAuthStore.getState().getSavedCredentials).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith(
        credentials.ipMkAuth,
        credentials.clientId,
        credentials.clientSecret
      );
    });

    it('should reset attempts counter after successful refresh', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', clientId: 'test-client', clientSecret: 'test-secret' };
      const newToken = 'new-jwt-token-abc123';

      mockUseAuthStore.getState.mockReturnValue({
        login: jest.fn().mockResolvedValue(undefined),
        getSavedCredentials: jest.fn().mockResolvedValue(credentials),
        token: newToken,
      });

      // Simula tentativas anteriores
      tokenRefreshManager.incrementAttempts();
      tokenRefreshManager.incrementAttempts();
      expect(tokenRefreshManager.getAttempts()).toBe(2);

      await refreshToken();

      expect(tokenRefreshManager.getAttempts()).toBe(0);
    });

    it('should call useAuthStore.login() which updates store', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', clientId: 'test-client', clientSecret: 'test-secret' };
      const newToken = 'new-jwt-token-abc123';
      const mockLogin = jest.fn().mockResolvedValue(undefined);

      mockUseAuthStore.getState.mockReturnValue({ 
        login: mockLogin,
        getSavedCredentials: jest.fn().mockResolvedValue(credentials),
        token: newToken,
      });

      await refreshToken();

      expect(mockLogin).toHaveBeenCalledWith(
        credentials.ipMkAuth,
        credentials.clientId,
        credentials.clientSecret
      );
    });

    it('should throw error when credentials are not found', async () => {
      const mockLogin = jest.fn();
      
      mockUseAuthStore.getState.mockReturnValue({
        login: mockLogin,
        getSavedCredentials: jest.fn().mockResolvedValue(null),
        token: null,
      });

      await expect(refreshToken()).rejects.toThrow('Credenciais não salvas');

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should propagate login errors', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', clientId: 'test-client', clientSecret: 'wrong-secret' };
      const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));

      mockUseAuthStore.getState.mockReturnValue({
        login: mockLogin,
        getSavedCredentials: jest.fn().mockResolvedValue(credentials),
        token: null,
      });

      await expect(refreshToken()).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if token not updated after login', async () => {
      const credentials = { ipMkAuth: 'mk.example.com', clientId: 'test-client', clientSecret: 'test-secret' };
      const mockLogin = jest.fn().mockResolvedValue(undefined);

      mockUseAuthStore.getState.mockReturnValue({
        login: mockLogin,
        getSavedCredentials: jest.fn().mockResolvedValue(credentials),
        token: null, // Login não atualizou token
      });

      await expect(refreshToken()).rejects.toThrow('Token não foi atualizado após login');
    });
  });
});

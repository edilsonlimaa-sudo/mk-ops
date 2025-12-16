import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenRefreshManager } from '../token/tokenRefreshManager';
import {
    tokenRefreshErrorHandler,
    tokenRefreshSuccessHandler,
} from './tokenRefreshInterceptor';

// Mock dos helpers
jest.mock('./helpers/errorRecoveryHandler', () => ({
  handleRefreshFailure: jest.fn(),
}));

jest.mock('./helpers/networkErrorDetector', () => ({
  isNetworkError: jest.fn(),
}));

jest.mock('./helpers/requestQueueManager', () => ({
  enqueueRequest: jest.fn(),
}));

jest.mock('./helpers/requestRetrier', () => ({
  retryWithNewToken: jest.fn(),
}));

jest.mock('./helpers/tokenRefresher', () => ({
  refreshToken: jest.fn(),
}));

describe('tokenRefreshInterceptor', () => {
  let mockHandleRefreshFailure: jest.Mock;
  let mockIsNetworkError: jest.Mock;
  let mockEnqueueRequest: jest.Mock;
  let mockRetryWithNewToken: jest.Mock;
  let mockRefreshToken: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    tokenRefreshManager.reset();

    // Importa mocks
    const errorRecoveryHandler = await import('./helpers/errorRecoveryHandler');
    const networkErrorDetector = await import('./helpers/networkErrorDetector');
    const requestQueueManager = await import('./helpers/requestQueueManager');
    const requestRetrier = await import('./helpers/requestRetrier');
    const tokenRefresher = await import('./helpers/tokenRefresher');

    mockHandleRefreshFailure = errorRecoveryHandler.handleRefreshFailure as jest.Mock;
    mockIsNetworkError = networkErrorDetector.isNetworkError as jest.Mock;
    mockEnqueueRequest = requestQueueManager.enqueueRequest as jest.Mock;
    mockRetryWithNewToken = requestRetrier.retryWithNewToken as jest.Mock;
    mockRefreshToken = tokenRefresher.refreshToken as jest.Mock;
  });

  describe('tokenRefreshSuccessHandler', () => {
    it('should return response unchanged', () => {
      const response = {
        data: { message: 'Success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      } as AxiosResponse;

      const result = tokenRefreshSuccessHandler(response);

      expect(result).toBe(response);
    });
  });

  describe('tokenRefreshErrorHandler', () => {
    it('should reject non-401 errors without processing', async () => {
      const error = {
        response: { status: 500 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      await expect(tokenRefreshErrorHandler(error)).rejects.toBe(error);

      expect(mockRefreshToken).not.toHaveBeenCalled();
      expect(mockEnqueueRequest).not.toHaveBeenCalled();
    });

    it('should reject 401 error if request already has _retry flag', async () => {
      const error = {
        response: { status: 401 },
        config: { _retry: true } as InternalAxiosRequestConfig & { _retry?: boolean },
      } as AxiosError;

      await expect(tokenRefreshErrorHandler(error)).rejects.toBe(error);

      expect(mockRefreshToken).not.toHaveBeenCalled();
    });

    it('should reject 401 if token was just refreshed (authorization error)', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const error = {
        response: { status: 401 },
        config: {
          _retry: false,
          _refreshedToken: true,
        } as InternalAxiosRequestConfig & { _retry?: boolean; _refreshedToken?: boolean },
      } as AxiosError;

      await expect(tokenRefreshErrorHandler(error)).rejects.toBe(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️ 401 após token refresh - possível erro de autorização'
      );
      expect(mockRefreshToken).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should enqueue request if refresh is already in progress', async () => {
      const mockQueuedResponse = { data: {}, status: 200 } as AxiosResponse;
      mockEnqueueRequest.mockResolvedValue(mockQueuedResponse);

      tokenRefreshManager.setIsRefreshing(true);

      const error = {
        response: { status: 401 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      const result = await tokenRefreshErrorHandler(error);

      expect(result).toBe(mockQueuedResponse);
      expect(mockEnqueueRequest).toHaveBeenCalledWith(error.config);
      expect(mockRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw error if max retry attempts reached', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Simula 3 tentativas anteriores (máximo permitido)
      tokenRefreshManager.incrementAttempts();
      tokenRefreshManager.incrementAttempts();
      tokenRefreshManager.incrementAttempts();

      const error = {
        response: { status: 401 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      await expect(tokenRefreshErrorHandler(error)).rejects.toThrow(
        'Token refresh falhou após múltiplas tentativas'
      );

      expect(consoleSpy).toHaveBeenCalledWith('❌ Máximo de tentativas de refresh atingido');
      expect(mockRefreshToken).not.toHaveBeenCalled();
      expect(tokenRefreshManager.getAttempts()).toBe(0); // Foi resetado

      consoleSpy.mockRestore();
    });

    it('should successfully refresh token and retry request', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const newToken = 'new-token-123';
      const mockResponse = { data: { success: true }, status: 200 } as AxiosResponse;

      mockRefreshToken.mockResolvedValue(newToken);
      mockRetryWithNewToken.mockResolvedValue(mockResponse);

      const error = {
        response: { status: 401 },
        config: { headers: {} } as InternalAxiosRequestConfig,
      } as AxiosError;

      const result = await tokenRefreshErrorHandler(error);

      expect(result).toBe(mockResponse);
      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockRetryWithNewToken).toHaveBeenCalledWith(error.config, newToken);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔄 Token expirado, reautenticando automaticamente')
      );

      consoleSpy.mockRestore();
    });

    it('should resolve all pending requests after successful refresh', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const newToken = 'new-token-456';
      const mockResponse = { data: {}, status: 200 } as AxiosResponse;

      mockRefreshToken.mockResolvedValue(newToken);
      mockRetryWithNewToken.mockResolvedValue(mockResponse);

      const error = {
        response: { status: 401 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      const resolveSpy = jest.spyOn(tokenRefreshManager, 'resolveAllPending');

      await tokenRefreshErrorHandler(error);

      expect(resolveSpy).toHaveBeenCalledWith(newToken);
    });

    it('should set isRefreshing flag during refresh process', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const newToken = 'token-xyz';
      mockRefreshToken.mockImplementation(async () => {
        // Verifica que flag está setada durante o refresh
        expect(tokenRefreshManager.getIsRefreshing()).toBe(true);
        return newToken;
      });
      mockRetryWithNewToken.mockResolvedValue({ data: {}, status: 200 } as AxiosResponse);

      const error = {
        response: { status: 401 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      await tokenRefreshErrorHandler(error);

      // Após finalizar, flag deve estar false
      expect(tokenRefreshManager.getIsRefreshing()).toBe(false);
    });

    it('should handle network errors without logging out', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const networkError = new Error('Network Error');
      mockRefreshToken.mockRejectedValue(networkError);
      mockIsNetworkError.mockReturnValue(true);

      const error = {
        response: { status: 401 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      await expect(tokenRefreshErrorHandler(error)).rejects.toThrow(
        'Sem conexão com a internet. Tente novamente.'
      );

      expect(mockIsNetworkError).toHaveBeenCalledWith(networkError);
      expect(mockHandleRefreshFailure).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('📡 Erro de rede detectado - preservando credenciais');

      consoleSpy.mockRestore();
    });

    it('should logout and redirect on non-network refresh errors', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const authError = new Error('Invalid credentials');
      mockRefreshToken.mockRejectedValue(authError);
      mockIsNetworkError.mockReturnValue(false);
      mockHandleRefreshFailure.mockResolvedValue(undefined);

      const error = {
        response: { status: 401 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      await expect(tokenRefreshErrorHandler(error)).rejects.toThrow('Invalid credentials');

      expect(mockIsNetworkError).toHaveBeenCalledWith(authError);
      expect(mockHandleRefreshFailure).toHaveBeenCalledTimes(1);
    });

    it('should reject all pending requests on refresh failure', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const refreshError = new Error('Refresh failed');
      mockRefreshToken.mockRejectedValue(refreshError);
      mockIsNetworkError.mockReturnValue(false);
      mockHandleRefreshFailure.mockResolvedValue(undefined);

      const error = {
        response: { status: 401 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      const rejectSpy = jest.spyOn(tokenRefreshManager, 'rejectAllPending');

      await expect(tokenRefreshErrorHandler(error)).rejects.toThrow('Refresh failed');

      expect(rejectSpy).toHaveBeenCalledWith(refreshError);
    });

    it('should reset isRefreshing flag even if refresh fails', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      mockRefreshToken.mockRejectedValue(new Error('Fail'));
      mockIsNetworkError.mockReturnValue(false);
      mockHandleRefreshFailure.mockResolvedValue(undefined);

      const error = {
        response: { status: 401 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      expect(tokenRefreshManager.getIsRefreshing()).toBe(false);

      await expect(tokenRefreshErrorHandler(error)).rejects.toThrow('Fail');

      // Flag deve ser resetada mesmo com erro
      expect(tokenRefreshManager.getIsRefreshing()).toBe(false);
    });

    it('should increment attempts counter before refresh', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      mockRefreshToken.mockResolvedValue('token');
      mockRetryWithNewToken.mockResolvedValue({ data: {}, status: 200 } as AxiosResponse);

      const error = {
        response: { status: 401 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      const incrementSpy = jest.spyOn(tokenRefreshManager, 'incrementAttempts');

      await tokenRefreshErrorHandler(error);

      // Verifica que incrementAttempts foi chamado
      expect(incrementSpy).toHaveBeenCalledTimes(1);
    });

    it('should mark original request with _retry flag', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      mockRefreshToken.mockResolvedValue('token');
      mockRetryWithNewToken.mockResolvedValue({ data: {}, status: 200 } as AxiosResponse);

      const config = {} as InternalAxiosRequestConfig & { _retry?: boolean };
      const error = {
        response: { status: 401 },
        config,
      } as AxiosError;

      expect(config._retry).toBeUndefined();

      await tokenRefreshErrorHandler(error);

      expect(config._retry).toBe(true);
    });
  });
});

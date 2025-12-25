import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenRefreshManager } from '../token/tokenRefreshManager';
import {
    tokenRefreshErrorHandler,
    tokenRefreshSuccessHandler,
} from './tokenRefreshInterceptor';

// Mock da useAuthStore
jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      refreshToken: jest.fn(),
    })),
  },
}));

// Mock do apiClient
jest.mock('../apiClient', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('tokenRefreshInterceptor', () => {
  let mockRefreshToken: jest.Mock;
  let mockApiClient: jest.Mock;
  let mockUseAuthStore: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    tokenRefreshManager.reset();

    // Importa mocks
    const { useAuthStore } = await import('@/stores/useAuthStore');
    const apiClientModule = await import('../apiClient');

    mockUseAuthStore = useAuthStore;
    mockRefreshToken = jest.fn();
    mockUseAuthStore.getState.mockReturnValue({ refreshToken: mockRefreshToken });
    mockApiClient = apiClientModule.default as unknown as jest.Mock;
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
    });

    it('should reject 401 error if request already has _retry flag', async () => {
      const error = {
        response: { status: 401 },
        config: { _retry: true } as InternalAxiosRequestConfig & { _retry?: boolean },
      } as AxiosError;

      await expect(tokenRefreshErrorHandler(error)).rejects.toBe(error);

      expect(mockRefreshToken).not.toHaveBeenCalled();
    });

    it('should add request to queue if refresh is already in progress', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockResponse = { data: {}, status: 200 } as AxiosResponse;

      tokenRefreshManager.setIsRefreshing(true);

      const error = {
        response: { status: 401 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      // Simula que outro refresh vai completar e resolver a fila
      const resultPromise = tokenRefreshErrorHandler(error);
      
      // Aguarda um pouco para garantir que foi enfileirado
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Resolve a fila (callbacks vão chamar apiClient)
      mockApiClient.mockResolvedValue(mockResponse);
      tokenRefreshManager.resolveAllPending();

      const result = await resultPromise;
      
      expect(result).toBe(mockResponse);
      expect(mockRefreshToken).not.toHaveBeenCalled();
      expect(mockApiClient).toHaveBeenCalledWith(error.config);
      expect(consoleSpy).toHaveBeenCalledWith('⏳ Request aguardando renovação de token...');
      
      consoleSpy.mockRestore();
    });

    it('should successfully refresh token and retry request', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const mockResponse = { data: { success: true }, status: 200 } as AxiosResponse;

      mockRefreshToken.mockResolvedValue('new-token-123');
      mockApiClient.mockResolvedValue(mockResponse);

      const error = {
        response: { status: 401 },
        config: { headers: {} } as InternalAxiosRequestConfig,
      } as AxiosError;

      const result = await tokenRefreshErrorHandler(error);

      expect(result).toBe(mockResponse);
      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockApiClient).toHaveBeenCalledWith(error.config);
      expect(consoleSpy).toHaveBeenCalledWith('🔄 Token expirado, renovando...');

      consoleSpy.mockRestore();
    });

    it('should resolve all pending requests after successful refresh', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const mockResponse = { data: {}, status: 200 } as AxiosResponse;

      mockRefreshToken.mockResolvedValue('new-token-456');
      mockApiClient.mockResolvedValue(mockResponse);

      const error = {
        response: { status: 401 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      const resolveSpy = jest.spyOn(tokenRefreshManager, 'resolveAllPending');

      await tokenRefreshErrorHandler(error);

      expect(resolveSpy).toHaveBeenCalledWith();
    });

    it('should set isRefreshing flag during refresh process', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      mockRefreshToken.mockImplementation(async () => {
        // Verifica que flag está setada durante o refresh
        expect(tokenRefreshManager.getIsRefreshing()).toBe(true);
        return 'token-xyz';
      });
      mockApiClient.mockResolvedValue({ data: {}, status: 200 } as AxiosResponse);

      const error = {
        response: { status: 401 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      await tokenRefreshErrorHandler(error);

      // Após finalizar, flag deve estar false
      expect(tokenRefreshManager.getIsRefreshing()).toBe(false);
    });

    it('should reject all pending requests on refresh failure', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const refreshError = new Error('Refresh failed');
      mockRefreshToken.mockRejectedValue(refreshError);

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

      const error = {
        response: { status: 401 },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      expect(tokenRefreshManager.getIsRefreshing()).toBe(false);

      await expect(tokenRefreshErrorHandler(error)).rejects.toThrow('Fail');

      // Flag deve ser resetada mesmo com erro
      expect(tokenRefreshManager.getIsRefreshing()).toBe(false);
    });

    it('should mark original request with _retry flag', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      mockRefreshToken.mockResolvedValue('token');
      mockApiClient.mockResolvedValue({ data: {}, status: 200 } as AxiosResponse);

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

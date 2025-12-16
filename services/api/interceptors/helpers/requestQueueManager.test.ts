import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenRefreshManager } from '../../token/tokenRefreshManager';
import { enqueueRequest } from './requestQueueManager';

// Mock do apiClient - precisa ser declarado antes do import
const mockApiClient = jest.fn();
jest.mock('../../apiClient', () => ({
  __esModule: true,
  default: mockApiClient,
}));

describe('requestQueueManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tokenRefreshManager.reset();
  });

  describe('enqueueRequest', () => {
    it('should enqueue request and resolve with new token', async () => {
      const originalRequest = {
        url: '/api/users',
        method: 'GET',
        headers: { Authorization: 'Bearer old-token' },
        _retry: true,
      } as InternalAxiosRequestConfig & { _retry?: boolean };

      const mockResponse = {
        data: { users: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: originalRequest,
      } as AxiosResponse;

      mockApiClient.mockResolvedValue(mockResponse);

      // Simula que token refresh completou
      const promise = enqueueRequest(originalRequest);

      // Aguarda próximo tick para garantir que callback foi registrado
      await new Promise((resolve) => setImmediate(resolve));

      // Resolve a fila com novo token
      tokenRefreshManager.resolveAllPending('new-token-123');

      const result = await promise;

      expect(result).toEqual(mockResponse);
      expect(originalRequest.headers['Authorization']).toBe('Bearer new-token-123');
      expect(mockApiClient).toHaveBeenCalledWith(originalRequest);
    });

    it('should reject request when token refresh fails', async () => {
      const originalRequest = {
        url: '/api/users',
        method: 'GET',
        headers: { Authorization: 'Bearer old-token' },
        _retry: true,
      } as InternalAxiosRequestConfig & { _retry?: boolean };

      const refreshError = new Error('Token refresh failed');

      const promise = enqueueRequest(originalRequest);

      // Aguarda próximo tick
      await new Promise((resolve) => setImmediate(resolve));

      // Rejeita a fila
      tokenRefreshManager.rejectAllPending(refreshError);

      await expect(promise).rejects.toThrow('Token refresh failed');

      expect(mockApiClient).not.toHaveBeenCalled();
    });

    it('should handle multiple enqueued requests', async () => {
      const request1 = {
        url: '/api/users',
        headers: { Authorization: 'Bearer old-token' },
      } as InternalAxiosRequestConfig;

      const request2 = {
        url: '/api/products',
        headers: { Authorization: 'Bearer old-token' },
      } as InternalAxiosRequestConfig;

      const mockResponse1 = {
        data: { users: [] },
        status: 200,
      } as AxiosResponse;

      const mockResponse2 = {
        data: { products: [] },
        status: 200,
      } as AxiosResponse;

      mockApiClient
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const promise1 = enqueueRequest(request1);
      const promise2 = enqueueRequest(request2);

      await new Promise((resolve) => setImmediate(resolve));

      tokenRefreshManager.resolveAllPending('new-token-123');

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toEqual(mockResponse1);
      expect(result2).toEqual(mockResponse2);
      expect(request1.headers['Authorization']).toBe('Bearer new-token-123');
      expect(request2.headers['Authorization']).toBe('Bearer new-token-123');
    });

    it('should log waiting message', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const originalRequest = {
        url: '/api/test',
        headers: {},
      } as InternalAxiosRequestConfig;

      const promise = enqueueRequest(originalRequest);

      expect(consoleSpy).toHaveBeenCalledWith('⏳ Request aguardando renovação de token...');

      await new Promise((resolve) => setImmediate(resolve));
      tokenRefreshManager.resolveAllPending('token');
      await promise;

      consoleSpy.mockRestore();
    });
  });
});

import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { retryWithNewToken } from './requestRetrier';

// Mock do apiClient - precisa ser declarado antes do import
const mockApiClient = jest.fn();
jest.mock('../../apiClient', () => ({
  __esModule: true,
  default: mockApiClient,
}));

describe('requestRetrier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('retryWithNewToken', () => {
    it('should update Authorization header with new token', async () => {
      const originalRequest = {
        url: '/api/users',
        method: 'GET',
        headers: { Authorization: 'Bearer old-token' },
      } as InternalAxiosRequestConfig & { _refreshedToken?: boolean };

      const mockResponse = {
        data: { users: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: originalRequest,
      } as AxiosResponse;

      mockApiClient.mockResolvedValue(mockResponse);

      await retryWithNewToken(originalRequest, 'new-token-123');

      expect(originalRequest.headers['Authorization']).toBe('Bearer new-token-123');
    });

    it('should mark request as using refreshed token', async () => {
      const originalRequest = {
        url: '/api/users',
        method: 'GET',
        headers: {},
      } as InternalAxiosRequestConfig & { _refreshedToken?: boolean };

      const mockResponse = {
        data: {},
        status: 200,
      } as AxiosResponse;

      mockApiClient.mockResolvedValue(mockResponse);

      expect(originalRequest._refreshedToken).toBeUndefined();

      await retryWithNewToken(originalRequest, 'new-token-123');

      expect(originalRequest._refreshedToken).toBe(true);
    });

    it('should retry request using apiClient', async () => {
      const originalRequest = {
        url: '/api/products',
        method: 'POST',
        headers: {},
        data: { name: 'Product 1' },
      } as InternalAxiosRequestConfig & { _refreshedToken?: boolean };

      const mockResponse = {
        data: { id: 1, name: 'Product 1' },
        status: 201,
      } as AxiosResponse;

      mockApiClient.mockResolvedValue(mockResponse);

      const result = await retryWithNewToken(originalRequest, 'new-token-456');

      expect(mockApiClient).toHaveBeenCalledWith(originalRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should return the response from apiClient', async () => {
      const originalRequest = {
        url: '/api/test',
        headers: {},
      } as InternalAxiosRequestConfig & { _refreshedToken?: boolean };

      const expectedResponse = {
        data: { message: 'Success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: originalRequest,
      } as AxiosResponse;

      mockApiClient.mockResolvedValue(expectedResponse);

      const result = await retryWithNewToken(originalRequest, 'token-xyz');

      expect(result).toBe(expectedResponse);
    });

    it('should propagate errors from apiClient', async () => {
      const originalRequest = {
        url: '/api/test',
        headers: {},
      } as InternalAxiosRequestConfig & { _refreshedToken?: boolean };

      const error = new Error('Request failed');
      mockApiClient.mockRejectedValue(error);

      await expect(retryWithNewToken(originalRequest, 'token-xyz')).rejects.toThrow(
        'Request failed'
      );
    });

    it('should handle requests without Authorization header', async () => {
      const originalRequest = {
        url: '/api/public',
        method: 'GET',
        headers: {},
      } as InternalAxiosRequestConfig & { _refreshedToken?: boolean };

      const mockResponse = {
        data: {},
        status: 200,
      } as AxiosResponse;

      mockApiClient.mockResolvedValue(mockResponse);

      await retryWithNewToken(originalRequest, 'new-token-789');

      expect(originalRequest.headers['Authorization']).toBe('Bearer new-token-789');
      expect(originalRequest._refreshedToken).toBe(true);
    });
  });
});

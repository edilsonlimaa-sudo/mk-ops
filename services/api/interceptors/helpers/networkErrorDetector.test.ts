import axios, { AxiosError } from 'axios';
import { isNetworkError } from './networkErrorDetector';

describe('networkErrorDetector', () => {
  describe('isNetworkError', () => {
    it('should return true for ECONNABORTED error code', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'Request aborted',
        name: 'AxiosError',
        toJSON: () => ({}),
      };

      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

      const result = isNetworkError(error);

      expect(result).toBe(true);
    });

    it('should return true for ERR_NETWORK error code', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        code: 'ERR_NETWORK',
        message: 'Network Error',
        name: 'AxiosError',
        toJSON: () => ({}),
      };

      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

      const result = isNetworkError(error);

      expect(result).toBe(true);
    });

    it('should return true for Network Error message', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        code: undefined,
        message: 'Network Error occurred',
        name: 'AxiosError',
        toJSON: () => ({}),
      };

      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

      const result = isNetworkError(error);

      expect(result).toBe(true);
    });

    it('should return true for timeout message', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        code: undefined,
        message: 'Request timeout of 5000ms exceeded',
        name: 'AxiosError',
        toJSON: () => ({}),
      };

      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

      const result = isNetworkError(error);

      expect(result).toBe(true);
    });

    it('should return false for non-Axios error', () => {
      const error = new Error('Regular error');

      jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);

      const result = isNetworkError(error);

      expect(result).toBe(false);
    });

    it('should return false for 401 authentication error', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        code: undefined,
        message: 'Request failed with status code 401',
        name: 'AxiosError',
        toJSON: () => ({}),
      };

      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

      const result = isNetworkError(error);

      expect(result).toBe(false);
    });

    it('should return false for 500 server error', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        code: undefined,
        message: 'Request failed with status code 500',
        name: 'AxiosError',
        toJSON: () => ({}),
      };

      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

      const result = isNetworkError(error);

      expect(result).toBe(false);
    });
  });
});

import * as SecureStore from 'expo-secure-store';
import { tokenInjectorInterceptor } from './tokenInjectorInterceptor';

// Mock expo-secure-store
jest.mock('expo-secure-store');

// Mock useAuthStore
jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

import { useAuthStore } from '@/stores/useAuthStore';

describe('tokenInjectorInterceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve injetar token do store quando disponível', async () => {
    (useAuthStore.getState as jest.Mock).mockReturnValue({ token: 'cached-token-123' });

    const config: any = {
      headers: {},
    };

    const result = await tokenInjectorInterceptor(config);

    expect(result.headers['Authorization']).toBe('Bearer cached-token-123');
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
  });

  it('deve buscar token do SecureStore quando store está vazio', async () => {
    (useAuthStore.getState as jest.Mock).mockReturnValue({ token: null });
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('securestore-token');

    const config: any = {
      headers: {},
    };

    const result = await tokenInjectorInterceptor(config);

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('authToken');
    expect(result.headers['Authorization']).toBe('Bearer securestore-token');
  });

  it('não deve adicionar header quando não existe token', async () => {
    (useAuthStore.getState as jest.Mock).mockReturnValue({ token: null });
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const config: any = {
      headers: {},
    };

    const result = await tokenInjectorInterceptor(config);

    expect(result.headers['Authorization']).toBeUndefined();
  });

  it('deve usar fallback do SecureStore quando store está vazio', async () => {
    (useAuthStore.getState as jest.Mock).mockReturnValue({ token: null });
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('token-from-storage');

    const config: any = {
      headers: {},
    };

    await tokenInjectorInterceptor(config);

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('authToken');
  });

  it('não deve sobrescrever headers existentes', async () => {
    (useAuthStore.getState as jest.Mock).mockReturnValue({ token: 'my-token' });

    const config: any = {
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'value',
      },
    };

    const result = await tokenInjectorInterceptor(config);

    expect(result.headers['Authorization']).toBe('Bearer my-token');
    expect(result.headers['Content-Type']).toBe('application/json');
    expect(result.headers['X-Custom-Header']).toBe('value');
  });
});

import { tokenInjectorInterceptor } from './tokenInjectorInterceptor';

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
  });

  it('não deve adicionar header quando não existe token', async () => {
    (useAuthStore.getState as jest.Mock).mockReturnValue({ token: null });

    const config: any = {
      headers: {},
    };

    const result = await tokenInjectorInterceptor(config);

    expect(result.headers['Authorization']).toBeUndefined();
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

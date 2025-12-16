import * as SecureStore from 'expo-secure-store';
import { tokenInjectorInterceptor } from './tokenInjectorInterceptor';

// Mock expo-secure-store
jest.mock('expo-secure-store');

// Importa tokenCache DEPOIS do mock para testar integração
import { tokenCache } from '../token/tokenCache';

describe('tokenInjectorInterceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tokenCache.clear(); // Limpa cache real
  });

  it('deve injetar token do cache quando disponível', async () => {
    tokenCache.set('cached-token-123');

    const config: any = {
      headers: {},
    };

    const result = await tokenInjectorInterceptor(config);

    expect(result.headers['Authorization']).toBe('Bearer cached-token-123');
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
  });

  it('deve buscar token do SecureStore quando cache está vazio', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('securestore-token');

    const config: any = {
      headers: {},
    };

    const result = await tokenInjectorInterceptor(config);

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('authToken');
    expect(result.headers['Authorization']).toBe('Bearer securestore-token');
    // Verifica que cache foi populado
    expect(tokenCache.get()).toBe('securestore-token');
  });

  it('não deve adicionar header quando não existe token', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const config: any = {
      headers: {},
    };

    const result = await tokenInjectorInterceptor(config);

    expect(result.headers['Authorization']).toBeUndefined();
  });

  it('deve popular cache após buscar do SecureStore', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('token-from-storage');

    const config: any = {
      headers: {},
    };

    await tokenInjectorInterceptor(config);

    expect(tokenCache.get()).toBe('token-from-storage');
  });

  it('não deve sobrescrever headers existentes', async () => {
    tokenCache.set('my-token');

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

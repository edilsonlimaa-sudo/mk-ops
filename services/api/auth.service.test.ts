import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { authService } from './auth.service';

// Mock modules
jest.mock('expo-secure-store');
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock SecureStore setItemAsync para retornar sucesso
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    // Mock getItemAsync para validação interna do authService
    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
      if (key === 'authToken') return Promise.resolve('jwt-token-response');
      return Promise.resolve(null);
    });
  });

  describe('login()', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const credentials = {
        ipMkAuth: 'api.example.com',
        clientId: 'test-client',
        clientSecret: 'test-secret',
      };

      mockedAxios.get.mockResolvedValue({
        data: 'jwt-token-response',
        status: 200,
      });

      const token = await authService.login(credentials);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.example.com/api/',
        expect.objectContaining({
          headers: {
            Authorization: expect.stringContaining('Basic '),
          },
        })
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('authToken', 'jwt-token-response');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('ipMkAuth', 'api.example.com');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('clientId', 'test-client');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('clientSecret', 'test-secret');
      expect(token).toBe('jwt-token-response');
    });

    it('deve validar que token retornado é string', async () => {
      const credentials = {
        ipMkAuth: 'api.example.com',
        clientId: 'client',
        clientSecret: 'secret',
      };

      mockedAxios.get.mockResolvedValue({
        data: { token: 'object-instead-of-string' },
        status: 200,
      });

      // Mock SecureStore para rejeitar quando receber não-string
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Invalid value provided to SecureStore')
      );

      await expect(authService.login(credentials)).rejects.toThrow(
        'Não foi possível salvar as credenciais de forma segura'
      );
    });

    it('deve propagar erro de rede', async () => {
      const credentials = {
        ipMkAuth: 'api.example.com',
        clientId: 'client',
        clientSecret: 'secret',
      };

      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(authService.login(credentials)).rejects.toThrow('Network Error');
    });

    it('deve criar Basic Auth header corretamente', async () => {
      const credentials = {
        ipMkAuth: 'test.com',
        clientId: 'my-client',
        clientSecret: 'my-secret',
      };

      mockedAxios.get.mockResolvedValue({ data: 'token', status: 200 });

      await authService.login(credentials);

      const expectedAuth = Buffer.from('my-client:my-secret').toString('base64');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test.com/api/',
        expect.objectContaining({
          headers: {
            Authorization: `Basic ${expectedAuth}`,
          },
        })
      );
    });
  });

  describe('logout()', () => {
    it('deve deletar todas as chaves do SecureStore', async () => {
      await authService.logout();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('authToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('ipMkAuth');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('clientId');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('clientSecret');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(4);
    });
  });

  describe('getSavedCredentials()', () => {
    it('deve retornar credenciais salvas quando todas existem', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('https://saved.com') // ipMkAuth
        .mockResolvedValueOnce('saved-client') // clientId
        .mockResolvedValueOnce('saved-secret'); // clientSecret

      const credentials = await authService.getSavedCredentials();

      expect(credentials).toEqual({
        ipMkAuth: 'https://saved.com',
        clientId: 'saved-client',
        clientSecret: 'saved-secret',
      });
    });

    it('deve retornar null quando falta credencial', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('https://saved.com') // ipMkAuth
        .mockResolvedValueOnce(null) // clientId - missing
        .mockResolvedValueOnce('saved-secret'); // clientSecret

      const credentials = await authService.getSavedCredentials();

      expect(credentials).toBeNull();
    });

    it('deve retornar null quando nenhuma credencial existe', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const credentials = await authService.getSavedCredentials();

      expect(credentials).toBeNull();
    });
  });

  describe('getToken()', () => {
    it('deve retornar token quando existe', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('my-jwt-token');

      const token = await authService.getToken();

      expect(token).toBe('my-jwt-token');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('authToken');
    });

    it('deve retornar null quando token não existe', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const token = await authService.getToken();

      expect(token).toBeNull();
    });
  });

  describe('getIpMkAuth()', () => {
    it('deve retornar ipMkAuth quando existe', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('https://my-server.com');

      const ip = await authService.getIpMkAuth();

      expect(ip).toBe('https://my-server.com');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('ipMkAuth');
    });

    it('deve retornar null quando ipMkAuth não existe', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const ip = await authService.getIpMkAuth();

      expect(ip).toBeNull();
    });
  });
});

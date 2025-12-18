import * as SecureStore from 'expo-secure-store';
import { authStorage } from './authStorage';

jest.mock('expo-secure-store');

describe('authStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveCredentials', () => {
    it('should save all credentials and token', async () => {
      const credentials = {
        ipMkAuth: 'api.example.com',
        clientId: 'client-123',
        clientSecret: 'secret-456',
      };
      const token = 'jwt-token-abc';

      await authStorage.saveCredentials(credentials, token);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('authToken', token);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('ipMkAuth', 'api.example.com');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('clientId', 'client-123');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('clientSecret', 'secret-456');
      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(4);
    });
  });

  describe('getSession', () => {
    it('should return session data when both token and ipMkAuth exist', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('my-token')
        .mockResolvedValueOnce('my-ip');

      const session = await authStorage.getSession();

      expect(session).toEqual({
        token: 'my-token',
        ipMkAuth: 'my-ip',
      });
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('authToken');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('ipMkAuth');
    });

    it('should return null when token is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('my-ip');

      const session = await authStorage.getSession();

      expect(session).toBeNull();
    });

    it('should return null when ipMkAuth is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('my-token')
        .mockResolvedValueOnce(null);

      const session = await authStorage.getSession();

      expect(session).toBeNull();
    });

    it('should return null when both are missing', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const session = await authStorage.getSession();

      expect(session).toBeNull();
    });
  });

  describe('getCredentials', () => {
    it('should return credentials when all fields exist', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('api.example.com')
        .mockResolvedValueOnce('client-123')
        .mockResolvedValueOnce('secret-456');

      const credentials = await authStorage.getCredentials();

      expect(credentials).toEqual({
        ipMkAuth: 'api.example.com',
        clientId: 'client-123',
        clientSecret: 'secret-456',
      });
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('ipMkAuth');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('clientId');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('clientSecret');
    });

    it('should return null when any credential is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('api.example.com')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('secret-456');

      const credentials = await authStorage.getCredentials();

      expect(credentials).toBeNull();
    });

    it('should return null when all credentials are missing', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const credentials = await authStorage.getCredentials();

      expect(credentials).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should delete all stored credentials', async () => {
      await authStorage.clearAll();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('authToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('ipMkAuth');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('clientId');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('clientSecret');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(4);
    });
  });
});

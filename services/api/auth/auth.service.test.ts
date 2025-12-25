import axios from 'axios';
import { authService } from './auth.service';

// Mock modules
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Helper para criar AxiosError corretamente
const createAxiosError = (props: any) => {
  const error: any = new Error(props.message || 'Axios error');
  error.isAxiosError = true;
  error.config = {};
  error.toJSON = () => ({});
  Object.assign(error, props);
  return error;
};

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock axios.isAxiosError para detectar nossos erros customizados
    (axios.isAxiosError as any) = jest.fn((error: any) => error?.isAxiosError === true);
  });

  describe('login()', () => {
    it('deve fazer login com credenciais válidas e retornar token', async () => {
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
      expect(token).toBe('jwt-token-response');
    });

    it('deve extrair token de objeto de resposta', async () => {
      const credentials = {
        ipMkAuth: 'api.example.com',
        clientId: 'client',
        clientSecret: 'secret',
      };

      mockedAxios.get.mockResolvedValue({
        data: { token: 'jwt-from-object' },
        status: 200,
      });

      const token = await authService.login(credentials);

      expect(token).toBe('jwt-from-object');
    });

    it('deve lançar erro quando token não está na resposta', async () => {
      const credentials = {
        ipMkAuth: 'api.example.com',
        clientId: 'client',
        clientSecret: 'secret',
      };

      mockedAxios.get.mockResolvedValue({
        data: {},
        status: 200,
      });

      await expect(authService.login(credentials)).rejects.toThrow(
        'Token não encontrado na resposta'
      );
    });

    it('deve propagar AxiosError para 401', async () => {
      const credentials = {
        ipMkAuth: 'api.example.com',
        clientId: 'client',
        clientSecret: 'wrong-secret',
      };

      const axiosError = createAxiosError({
        response: { status: 401 },
        message: 'Request failed with status code 401',
      });

      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(authService.login(credentials)).rejects.toThrow('Request failed with status code 401');
    });

    it('deve propagar AxiosError para timeout', async () => {
      const credentials = {
        ipMkAuth: 'api.example.com',
        clientId: 'client',
        clientSecret: 'secret',
      };

      const axiosError = createAxiosError({
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded',
      });

      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(authService.login(credentials)).rejects.toThrow('timeout of 10000ms exceeded');
    });

    it('deve propagar AxiosError de rede', async () => {
      const credentials = {
        ipMkAuth: 'api.example.com',
        clientId: 'client',
        clientSecret: 'secret',
      };

      const axiosError = createAxiosError({
        message: 'Network Error',
      });

      mockedAxios.get.mockRejectedValue(axiosError);

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
});

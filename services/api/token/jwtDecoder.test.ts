import { decodeJWT, getTokenExpiration, isTokenExpired, getTimeUntilExpiration } from './jwtDecoder';

// Mock de um JWT válido (gerado com payload específico)
const createMockJWT = (exp: number, iat: number): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    usuario: 'e53d6c441b90e7a24bf99f9d1c1583fb1a4b239a',
    host: 'provedor.updata.com.br',
    cliente: '185.165.240.84',
    mka_tag: '019b372a-7a1c-7e24-b795-fb05af9e3c61',
    iat,
    exp,
  }));
  const signature = 'mock-signature';
  
  return `${header}.${payload}.${signature}`;
};

describe('jwtDecoder', () => {
  describe('decodeJWT', () => {
    it('deve decodificar JWT válido corretamente', () => {
      const token = createMockJWT(1766160688, 1766157089);
      const payload = decodeJWT(token);
      
      expect(payload.usuario).toBe('e53d6c441b90e7a24bf99f9d1c1583fb1a4b239a');
      expect(payload.host).toBe('provedor.updata.com.br');
      expect(payload.exp).toBe(1766160688);
      expect(payload.iat).toBe(1766157089);
    });

    it('deve lançar erro para token malformado', () => {
      expect(() => decodeJWT('invalid-token')).toThrow('Token JWT inválido');
    });

    it('deve lançar erro para token sem exp', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256' }));
      const payload = btoa(JSON.stringify({ iat: 123456 })); // sem exp
      const token = `${header}.${payload}.signature`;
      
      expect(() => decodeJWT(token)).toThrow('faltam campos exp ou iat');
    });

    it('deve lançar erro para token sem iat', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256' }));
      const payload = btoa(JSON.stringify({ exp: 123456 })); // sem iat
      const token = `${header}.${payload}.signature`;
      
      expect(() => decodeJWT(token)).toThrow('faltam campos exp ou iat');
    });
  });

  describe('getTokenExpiration', () => {
    it('deve extrair expiração corretamente em milissegundos', () => {
      const expInSeconds = 1766160688;
      const token = createMockJWT(expInSeconds, 1766157089);
      
      const expiration = getTokenExpiration(token);
      
      expect(expiration).toBe(expInSeconds * 1000);
    });
  });

  describe('isTokenExpired', () => {
    it('deve detectar token expirado', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hora atrás
      const token = createMockJWT(pastExp, pastExp - 7200);
      
      expect(isTokenExpired(token)).toBe(true);
    });

    it('deve detectar token válido', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hora no futuro
      const token = createMockJWT(futureExp, Math.floor(Date.now() / 1000));
      
      expect(isTokenExpired(token)).toBe(false);
    });

    it('deve usar buffer de segurança', () => {
      const expInFiveMinutes = Math.floor(Date.now() / 1000) + 300; // 5 min
      const token = createMockJWT(expInFiveMinutes, Math.floor(Date.now() / 1000));
      
      // Sem buffer: não expirado
      expect(isTokenExpired(token, 0)).toBe(false);
      
      // Com buffer de 10 minutos: considera expirado
      expect(isTokenExpired(token, 600)).toBe(true);
    });

    it('deve retornar true para token inválido', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('deve calcular tempo restante corretamente', () => {
      const expInOneHour = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockJWT(expInOneHour, Math.floor(Date.now() / 1000));
      
      const timeLeft = getTimeUntilExpiration(token);
      
      // Aceita margem de erro de 1 segundo devido ao tempo de execução
      expect(timeLeft).toBeGreaterThan(3600 * 1000 - 1000);
      expect(timeLeft).toBeLessThanOrEqual(3600 * 1000);
    });

    it('deve retornar 0 para token expirado', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const token = createMockJWT(pastExp, pastExp - 7200);
      
      expect(getTimeUntilExpiration(token)).toBe(0);
    });

    it('deve retornar 0 para token inválido', () => {
      expect(getTimeUntilExpiration('invalid-token')).toBe(0);
    });
  });
});

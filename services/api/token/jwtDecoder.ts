/**
 * Decodifica JWT e extrai payload
 * Não valida assinatura - apenas extrai informações
 */

export interface JWTPayload {
  usuario: string;
  host: string;
  cliente: string;
  mka_tag: string;
  iat: number; // Issued At (timestamp em segundos)
  exp: number; // Expiration (timestamp em segundos)
}

/**
 * Decodifica token JWT e retorna payload
 * @throws Error se token for inválido
 */
export const decodeJWT = (token: string): JWTPayload => {
  try {
    // JWT tem 3 partes separadas por ponto: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Token JWT inválido: formato incorreto');
    }

    // Payload é a parte do meio (index 1)
    const base64Payload = parts[1];
    
    // Decodifica base64 para string JSON
    const jsonPayload = atob(base64Payload);
    
    // Parse JSON para objeto
    const payload = JSON.parse(jsonPayload) as JWTPayload;
    
    // Valida campos obrigatórios
    if (!payload.exp || !payload.iat) {
      throw new Error('Token JWT inválido: faltam campos exp ou iat');
    }
    
    return payload;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao decodificar token JWT');
  }
};

/**
 * Extrai apenas a data de expiração do token
 * @returns timestamp em MILISSEGUNDOS (Date.now() compatível)
 */
export const getTokenExpiration = (token: string): number => {
  const payload = decodeJWT(token);
  // JWT usa timestamp em SEGUNDOS, convertemos para MILISSEGUNDOS
  return payload.exp * 1000;
};

/**
 * Verifica se token está expirado
 * @param token Token JWT
 * @param bufferSeconds Margem de segurança em segundos (padrão: 0)
 */
export const isTokenExpired = (token: string, bufferSeconds: number = 0): boolean => {
  try {
    const expirationMs = getTokenExpiration(token);
    const bufferMs = bufferSeconds * 1000;
    const now = Date.now();
    
    return now >= (expirationMs - bufferMs);
  } catch {
    // Se falhar ao decodificar, considera expirado
    return true;
  }
};

/**
 * Retorna quanto tempo falta para o token expirar (em milissegundos)
 * @returns Tempo em ms, ou 0 se já expirado
 */
export const getTimeUntilExpiration = (token: string): number => {
  try {
    const expirationMs = getTokenExpiration(token);
    const now = Date.now();
    const timeLeft = expirationMs - now;
    
    return Math.max(0, timeLeft);
  } catch {
    return 0;
  }
};

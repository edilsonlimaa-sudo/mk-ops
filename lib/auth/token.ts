import { authService } from '@/services/api/auth';
import { getTokenExpiration } from '@/services/api/core/token/jwtDecoder';
import { authStorage } from '@/services/storage/authStorage';
import { useAuthStore } from '@/stores/auth';

/**
 * Verifica se o token está expirado.
 * 
 * @param tokenExpiration Timestamp de expiração em milissegundos
 * @returns true se expirado, false caso contrário
 */
export function isExpired(tokenExpiration: number | null): boolean {
  if (!tokenExpiration) return true;
  return Date.now() >= tokenExpiration;
}

/**
 * Renova o token de autenticação de forma silenciosa.
 * 
 * Este método:
 * - Busca credenciais do storage
 * - Faz login novamente (HTTP puro)
 * - Atualiza storage
 * - Atualiza store silenciosamente (sem loading, sem navegação)
 * 
 * É usado por:
 * - Interceptor HTTP (refresh automático em 401)
 * - Bootstrap (refresh proativo se token expirado)
 * 
 * @throws Error se credenciais não estiverem salvas
 * @returns Token renovado
 */
export async function refreshToken(): Promise<string> {
  console.log('🔄 [auth.token] Iniciando refresh de token...');
  
  // 1. Busca credenciais salvas do storage
  const credentials = await authStorage.getCredentials();
  if (!credentials) {
    console.error('❌ [auth.token] Credenciais não encontradas');
    throw new Error('Credenciais não salvas');
  }

  // 2. Faz login (HTTP call pura, sem side-effects)
  console.log('🌐 [auth.token] Chamando authService.login...');
  const token = await authService.login(credentials);

  // 3. Atualiza storage
  console.log('💾 [auth.token] Salvando novo token no storage...');
  await authStorage.saveCredentials(credentials, token);

  // 4. Extrai data de expiração do novo token
  const tokenExpiration = getTokenExpiration(token);
  console.log('⏰ [auth.token] Novo token expira em:', new Date(tokenExpiration).toLocaleString());

  // 5. Atualiza estado silenciosamente (sem isLoading, sem navegação)
  useAuthStore.setState({ 
    token, 
    tokenExpiration, 
    ipMkAuth: credentials.ipMkAuth,
  });

  console.log('✅ [auth.token] Token renovado com sucesso!');
  return token;
}

import { tokenCache } from '../../token/tokenCache';
import { tokenRefreshManager } from '../../token/tokenRefreshManager';

/**
 * Realiza refresh do token JWT
 * - Busca credenciais salvas
 * - Faz login novamente
 * - Atualiza cache e Zustand store
 * - Reseta contador de tentativas
 */
export const refreshToken = async (): Promise<string> => {
  // Importa authService dinamicamente para evitar circular dependency
  const { authService } = await import('../../auth.service');

  // Recupera credenciais salvas
  const credentials = await authService.getSavedCredentials();
  if (!credentials) {
    console.log('❌ Credenciais não encontradas, redirecionando para login');
    throw new Error('Credenciais não salvas');
  }

  // Re-loga usando credenciais salvas
  const newToken = await authService.login(credentials);
  console.log('✅ Token renovado automaticamente!');

  // Atualiza cache de token em memória
  tokenCache.set(newToken);

  // Reset contador de tentativas após sucesso
  tokenRefreshManager.resetAttempts();

  // Atualiza Zustand store com novo token
  try {
    const { useAuthStore } = await import('@/stores/useAuthStore');
    useAuthStore.getState().updateToken(newToken);
  } catch (storeError) {
    console.log('⚠️ Não foi possível atualizar Zustand store:', storeError);
  }

  return newToken;
};

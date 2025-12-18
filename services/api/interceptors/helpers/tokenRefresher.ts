import { tokenRefreshManager } from '../../token/tokenRefreshManager';

/**
 * Realiza refresh do token JWT
 * - Busca credenciais salvas do store
 * - Faz login novamente
 * - Atualiza Zustand store
 * - Reseta contador de tentativas
 */
export const refreshToken = async (): Promise<string> => {
  // Importa useAuthStore dinamicamente para evitar circular dependency
  const { useAuthStore } = await import('@/stores/useAuthStore');
  const { authService } = await import('../../auth.service');

  // Recupera credenciais salvas do store
  const credentials = await useAuthStore.getState().getSavedCredentials();
  if (!credentials) {
    console.log('❌ Credenciais não encontradas, redirecionando para login');
    throw new Error('Credenciais não salvas');
  }

  // Re-loga usando credenciais salvas (apenas chamada HTTP)
  const newToken = await authService.login(credentials);
  console.log('✅ Token renovado automaticamente!');

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

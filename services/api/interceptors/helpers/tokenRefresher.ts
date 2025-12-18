import { tokenRefreshManager } from '../../token/tokenRefreshManager';

/**
 * Realiza refresh do token JWT
 * - Busca credenciais salvas do store
 * - Faz login novamente via useAuthStore (persiste + configura apiClient)
 * - Reseta contador de tentativas
 */
export const refreshToken = async (): Promise<string> => {
  // Importa useAuthStore dinamicamente para evitar circular dependency
  const { useAuthStore } = await import('@/stores/useAuthStore');

  // Recupera credenciais salvas do store
  const credentials = await useAuthStore.getState().getSavedCredentials();
  if (!credentials) {
    console.log('❌ Credenciais não encontradas, redirecionando para login');
    throw new Error('Credenciais não salvas');
  }

  // Re-loga usando useAuthStore (reutiliza toda lógica de login)
  await useAuthStore.getState().login(
    credentials.ipMkAuth,
    credentials.clientId,
    credentials.clientSecret
  );
  
  console.log('✅ Token renovado automaticamente!');

  // Reset contador de tentativas após sucesso
  tokenRefreshManager.resetAttempts();

  // Retorna token do state (login já atualizou)
  const newToken = useAuthStore.getState().token;
  if (!newToken) {
    throw new Error('Token não foi atualizado após login');
  }

  return newToken;
};

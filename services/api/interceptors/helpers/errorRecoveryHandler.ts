import { tokenRefreshManager } from '../../token/tokenRefreshManager';

/**
 * Faz logout e redireciona para login quando refresh falha
 * - Faz logout no useAuthStore (que limpa SecureStore)
 * - Redireciona para /login
 */
export const handleRefreshFailure = async (): Promise<void> => {
  // Importa useAuthStore dinamicamente
  const { useAuthStore } = await import('@/stores/useAuthStore');

  // Reset contador antes de logout
  tokenRefreshManager.resetAttempts();

  await useAuthStore.getState().logout();

  // Redireciona para login (usuário deletado ou credenciais inválidas)
  try {
    const { router } = await import('expo-router');
    router.replace('/(auth)/login' as any);
  } catch (routerError) {
    console.log('⚠️ Não foi possível redirecionar:', routerError);
  }
};

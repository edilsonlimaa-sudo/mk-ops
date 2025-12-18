import { tokenRefreshManager } from '../../token/tokenRefreshManager';

/**
 * Faz logout e redireciona para login quando refresh falha
 * - Faz logout no authService (que limpa o store)
 * - Redireciona para /login
 */
export const handleRefreshFailure = async (): Promise<void> => {
  // Importa authService dinamicamente
  const { authService } = await import('../../auth.service');

  // Reset contador antes de logout
  tokenRefreshManager.resetAttempts();

  await authService.logout();

  // Redireciona para login (usuário deletado ou credenciais inválidas)
  try {
    const { router } = await import('expo-router');
    router.replace('/login');
  } catch (routerError) {
    console.log('⚠️ Não foi possível redirecionar:', routerError);
  }
};

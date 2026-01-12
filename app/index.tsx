import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Redirect, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

/**
 * Rota raiz - Ponto de entrada da aplicação
 * Aguarda bootstrap e decide rota inicial baseado em autenticação e identificação
 */
export default function Index() {
  const isRestored = useAuthStore((state) => state.isRestored);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isUserRestored = useUserStore((state) => state.isUserRestored);
  const isIdentified = useUserStore((state) => state.isIdentified);
  const rootNavigationState = useRootNavigationState();

  // Esconde splash quando navegação estiver pronta E bootstrap completo (auth + user)
  useEffect(() => {
    if (rootNavigationState?.key && isRestored && isUserRestored) {
      console.log('👋 [Index] Navegação pronta e bootstrap completo, escondendo splash screen...');
      SplashScreen.hideAsync();
    }
  }, [rootNavigationState?.key, isRestored, isUserRestored]);

  // Aguarda navegação estar pronta E bootstrap completo (auth + user)
  if (!rootNavigationState?.key || !isRestored || !isUserRestored) {
    console.log('⏳ [Index] Aguardando (navigation:', !!rootNavigationState?.key, ', isRestored:', isRestored, ', isUserRestored:', isUserRestored, ')');
    return null; // Mantém splash visível
  }

  console.log('🔄 [Index] Redirecionando (isAuthenticated:', isAuthenticated, ', isIdentified:', isIdentified, ')');

  // Decisão de rota baseada em autenticação e identificação
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isIdentified) {
    return <Redirect href="/(auth)/user-identification" />;
  }

  return <Redirect href="/(app)/(agenda)" />;
}

import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Redirect } from 'expo-router';

/**
 * Rota raiz - redireciona baseado em 3 estados:
 * 1. Não autenticado na API → Login
 * 2. Autenticado na API mas funcionário não identificado → Identificação
 * 3. Autenticado e identificado → App completo
 */
export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isIdentified = useUserStore((state) => state.isIdentified);

  // Estado 1: Não autenticado na API
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Estado 2: Autenticado mas funcionário não identificado
  if (!isIdentified) {
    return <Redirect href="/(app)/user-identification" />;
  }

  // Estado 3: Totalmente autenticado e identificado
  return <Redirect href="/(app)/(tabs)" />;
}

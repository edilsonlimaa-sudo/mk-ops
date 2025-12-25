import { useAuthStore } from '@/stores/useAuthStore';
import { Redirect } from 'expo-router';

/**
 * Rota raiz - redireciona para login ou app baseado em autenticação
 */
export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

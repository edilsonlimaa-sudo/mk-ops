import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Redireciona para login ou tabs baseado na autenticação
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // Não renderiza nada, apenas redireciona
  return null;
}

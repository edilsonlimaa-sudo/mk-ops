import { useAuthStore } from '@/stores/useAuthStore';
import { Redirect } from 'expo-router';

/**
 * Rota raiz - Bootstrap inicial da aplicação
 * Os route guards nos layouts cuidam da proteção de cada seção
 */
export default function Index() {
  const isRestored = useAuthStore((state) => state.isRestored);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Aguarda restauração antes de redirecionar
  if (!isRestored) {
    console.log('⏳ [Index] Aguardando restauração da sessão...');
    return null;
  }

  console.log('🔄 [Index] Sessão restaurada, isAuthenticated:', isAuthenticated);

  // Redireciona para app (guards vão interceptar se necessário)
  // Se não autenticado → AppLayout redireciona para login
  // Se autenticado mas não identificado → AppLayout redireciona para identificação
  // Se tudo ok → vai para drawer (agenda)
  console.log('➡️ [Index] Redirecionando para /(app)/(agenda) (guards decidem o resto)');
  return <Redirect href="/(app)/(agenda)" />;
}

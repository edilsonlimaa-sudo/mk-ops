import { useProactiveTokenRefresh } from '@/hooks/useProactiveTokenRefresh';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/useAuthStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';

// Mantém splash screen visível até verificar autenticação
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestored = useAuthStore((state) => state.isRestored);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [appIsReady, setAppIsReady] = useState(false);

  // CAMADA 2: Refresh proativo ao voltar do background
  useProactiveTokenRefresh();

  // Restaura sessão ao abrir o app (persistência)
  useEffect(() => {
    async function prepare() {
      try {
        console.log('🚀 [RootLayout] Iniciando bootstrap da aplicação...');
        // Verifica se tem sessão salva
        await checkAuth();
        console.log('✅ [RootLayout] Bootstrap concluído');
      } catch (error) {
        console.log('❌ [RootLayout] Erro no bootstrap:', error);
        // checkAuth já limpou estado e storage
      } finally {
        // App está pronto, esconde splash screen
        setAppIsReady(true);
        console.log('🎬 [RootLayout] App pronto para renderizar');
      }
    }

    prepare();
  }, []);

  // Esconde splash screen quando app estiver pronto E sessão restaurada
  useEffect(() => {
    if (appIsReady && isRestored) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, isRestored]);

  // Não renderiza nada até verificar autenticação E restaurar sessão
  if (!appIsReady || !isRestored) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="(app)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}

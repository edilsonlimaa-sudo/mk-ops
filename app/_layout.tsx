import { useProactiveTokenRefresh } from '@/hooks/useProactiveTokenRefresh';
import { asyncStoragePersister, queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/useAuthStore';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
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
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [appIsReady, setAppIsReady] = useState(false);

  // CAMADA 2: Refresh proativo ao voltar do background
  useProactiveTokenRefresh();

  // Restaura sessão ao abrir o app (persistência)
  useEffect(() => {
    async function prepare() {
      try {
        // Verifica se tem sessão salva
        await checkAuth();
      } catch (error) {
        // checkAuth já limpou estado e storage
      } finally {
        // App está pronto, esconde splash screen
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Esconde splash screen quando app estiver pronto
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Não renderiza nada até verificar autenticação
  if (!appIsReady) {
    return null;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="(app)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
      <StatusBar style="auto" />
    </PersistQueryClientProvider>
  );
}

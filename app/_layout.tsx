import { useAuthStore } from '@/stores/useAuthStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';

// Mantém splash screen visível até verificar autenticação
SplashScreen.preventAutoHideAsync();

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [appIsReady, setAppIsReady] = useState(false);

  // Restaura sessão ao abrir o app (persistência)
  useEffect(() => {
    async function prepare() {
      try {
        // Verifica se tem sessão salva
        await checkAuth();
      } catch (error) {
        console.log('⚠️ Não foi possível restaurar sessão:', error);
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
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}

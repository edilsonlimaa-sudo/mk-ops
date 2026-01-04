import { ThemedStatusBar } from '@/components/ui/themed-status-bar';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useProactiveTokenRefresh } from '@/hooks/auth';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import '../global.css';

// Mantém splash screen visível até verificar autenticação
SplashScreen.preventAutoHideAsync();
console.log('💦 [SplashScreen] Splash mantida visível (preventAutoHideAsync)');

export default function RootLayout() {
  const isRestored = useAuthStore((state) => state.isRestored);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const restoreUser = useUserStore((state) => state.restoreUser);
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
        // Restaura identificação do usuário (se tiver)
        await restoreUser();
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
      console.log('👋 [SplashScreen] Escondendo splash (appIsReady && isRestored)');
      SplashScreen.hideAsync();
      console.log('✨ [SplashScreen] Splash escondida com sucesso');
    } else {
      console.log(`⏳ [SplashScreen] Aguardando (appIsReady: ${appIsReady}, isRestored: ${isRestored})`);
    }
  }, [appIsReady, isRestored]);

  // Não renderiza nada até verificar autenticação E restaurar sessão
  if (!appIsReady || !isRestored) {
    return null;
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutInner />
        <ThemedStatusBar />
        <Toast />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function RootLayoutInner() {
  const { colors } = useTheme();
  
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: colors.screenBackground },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}

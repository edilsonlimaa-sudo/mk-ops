import { useProactiveTokenRefresh } from '@/hooks/auth';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/useAuthStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { router, Stack, useRootNavigationState, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import '../global.css';

// Mantém splash screen visível até verificar autenticação
SplashScreen.preventAutoHideAsync();
console.log('💦 [SplashScreen] Splash mantida visível (preventAutoHideAsync)');

export default function RootLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestored = useAuthStore((state) => state.isRestored);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [appIsReady, setAppIsReady] = useState(false);
  
  const segments = useSegments();
  const navigationState = useRootNavigationState();

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
      console.log('👋 [SplashScreen] Escondendo splash (appIsReady && isRestored)');
      SplashScreen.hideAsync();
      console.log('✨ [SplashScreen] Splash escondida com sucesso');
    } else {
      console.log(`⏳ [SplashScreen] Aguardando (appIsReady: ${appIsReady}, isRestored: ${isRestored})`);
    }
  }, [appIsReady, isRestored]);

  // Navegação imperativa baseada em autenticação (funciona melhor em production)
  useEffect(() => {
    if (!navigationState?.key || !isRestored) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Usuário não autenticado mas não está em (auth) → redireciona
      console.log('🔓 [Navigation] Redirecionando para login');
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Usuário autenticado mas está em (auth) → redireciona  
      console.log('🔐 [Navigation] Redirecionando para app');
      router.replace('/(app)');
    }
  }, [isAuthenticated, segments, navigationState, isRestored]);

  // Não renderiza nada até verificar autenticação E restaurar sessão
  if (!appIsReady || !isRestored) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
      <Toast />
    </QueryClientProvider>
  );
}

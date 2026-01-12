import { ThemedStatusBar } from '@/components/ui/themed-status-bar';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useProactiveTokenRefresh } from '@/hooks/auth';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import '../global.css';

// Mantém splash screen visível até verificar autenticação
SplashScreen.preventAutoHideAsync();
console.log('💦 [SplashScreen] Splash mantida visível (preventAutoHideAsync)');

export default function RootLayout() {
  const restoreAuth = useAuthStore((state) => state.restoreAuth);
  const restoreUser = useUserStore((state) => state.restoreUser);

  // CAMADA 2: Refresh proativo ao voltar do background
  useProactiveTokenRefresh();

  // Bootstrap: Restaura sessão ao abrir o app
  useEffect(() => {
    async function bootstrap() {
      try {
        console.log('🚀 [RootLayout] Iniciando bootstrap da aplicação...');
        // Restaura sessão salva do storage
        await restoreAuth();
        // Restaura identificação do usuário (se tiver)
        await restoreUser();
        console.log('✅ [RootLayout] Bootstrap concluído');
      } catch (error) {
        console.log('❌ [RootLayout] Erro no bootstrap:', error);
        // restoreAuth já limpou estado e storage
      }
    }

    bootstrap();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RootLayoutInner />
          <ThemedStatusBar />
          <Toast />
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
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
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}

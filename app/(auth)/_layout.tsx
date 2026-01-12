import { useTheme } from '@/contexts/ThemeContext';
import { useThemedHeader } from '@/hooks/ui';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

/**
 * Layout de autenticação - Guard: se TOTALMENTE autenticado (auth + identificado), redireciona para app
 */
export default function AuthLayout() {
  const { colors } = useTheme();
  const headerOptions = useThemedHeader();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isIdentified = useUserStore((state) => state.isIdentified);

  // Guard reativo: observa mudanças de autenticação/identificação durante sessão
  useEffect(() => {
    // Se totalmente autenticado, não deve estar em (auth)
    if (isAuthenticated && isIdentified) {
      console.log('🚫 [AuthLayout] Totalmente autenticado, redirecionando para /(app)/(agenda)');
      router.replace('/(app)/(agenda)');
      return;
    }

    // Se autenticado mas não identificado, vai para identificação
    if (isAuthenticated && !isIdentified) {
      console.log('🔄 [AuthLayout] Autenticado mas não identificado, redirecionando para /user-identification');
      router.replace('/(auth)/user-identification?flow=login');
      return;
    }

    // Se não autenticado, deve estar no login
    if (!isAuthenticated) {
      console.log('🔙 [AuthLayout] Não autenticado, redirecionando para /login');
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isIdentified]);

  console.log('✅ [AuthLayout] Renderizando área de autenticação');
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: colors.screenBackground },
    }}>
      <Stack.Screen name="login" />
      <Stack.Screen 
        name="user-identification" 
        options={{ 
          ...headerOptions,
          headerShown: true,
          headerTitle: 'Quem é você?',
          headerBackVisible: false,
          presentation: 'card',
        }} 
      />
    </Stack>
  );
}

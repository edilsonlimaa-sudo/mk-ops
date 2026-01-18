import { useTheme } from '@/contexts/ThemeContext';
import { useThemedHeader } from '@/hooks/ui';
import { useAuthStore } from '@/stores/auth';
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

    // Se não autenticado, volta para onboarding
    if (!isAuthenticated) {
      console.log('🔙 [AuthLayout] Não autenticado, redirecionando para /(onboarding)');
      router.replace('/(onboarding)');
    }
  }, [isAuthenticated, isIdentified]);

  console.log('✅ [AuthLayout] Renderizando área de autenticação');
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: colors.screenBackground },
    }}>
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

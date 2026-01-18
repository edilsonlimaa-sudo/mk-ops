import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/stores/auth';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

/**
 * Layout de onboarding - Configuração inicial do provedor
 * Guard: se autenticado, redireciona para área de auth (identificação)
 */
export default function OnboardingLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Guard reativo: se autenticado, não deve estar em onboarding
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ [OnboardingLayout] Autenticado, redirecionando para /(auth)/user-identification');
      router.replace('/(auth)/user-identification?flow=login');
    }
  }, [isAuthenticated]);

  console.log('🚀 [OnboardingLayout] Renderizando área de onboarding');
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: colors.screenBackground },
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="(setup)" />
      <Stack.Screen name="success" />
    </Stack>
  );
}

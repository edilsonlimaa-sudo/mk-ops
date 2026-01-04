import { useTheme } from '@/contexts/ThemeContext';
import { useThemedHeader } from '@/hooks/ui';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Redirect, Stack } from 'expo-router';

/**
 * Layout de autenticação - Guard: se TOTALMENTE autenticado (auth + identificado), redireciona para app
 */
export default function AuthLayout() {
  const { colors } = useTheme();
  const headerOptions = useThemedHeader();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isIdentified = useUserStore((state) => state.isIdentified);
  const isRestored = useAuthStore((state) => state.isRestored);

  // Aguarda restauração antes de avaliar
  if (!isRestored) {
    console.log('⏳ [AuthLayout] Aguardando restauração...');
    return null;
  }

  // Guard: Se TOTALMENTE autenticado (API + identificado), não deve estar aqui
  if (isAuthenticated && isIdentified) {
    console.log('🚫 [AuthLayout] Totalmente autenticado, redirecionando para /(app)/(tabs)');
    return <Redirect href="/(app)/(tabs)" />;
  }

  console.log('✅ [AuthLayout] Permitindo acesso à área de autenticação');
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

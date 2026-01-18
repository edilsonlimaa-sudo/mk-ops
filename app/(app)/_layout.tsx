import { CustomDrawerContent } from '@/components/CustomDrawerContent';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedHeader } from '@/hooks/ui';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/useUserStore';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';

/**
 * Layout de app - Guard: precisa estar TOTALMENTE autenticado (API + identificado)
 * Usa Drawer Navigation para navegação lateral
 */
export default function AppLayout() {
  const { colors } = useTheme();
  const headerOptions = useThemedHeader();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isIdentified = useUserStore((state) => state.isIdentified);

  // Guard reativo: observa mudanças de autenticação/identificação durante sessão
  useEffect(() => {
    // Se não autenticado, volta para onboarding
    if (!isAuthenticated) {
      console.log('🔙 [AppLayout] Não autenticado, redirecionando para /(onboarding)');
      router.replace('/(onboarding)');
      return;
    }

    // Se não identificado, vai para autenticação
    if (!isIdentified) {
      console.log('🔙 [AppLayout] Não identificado, redirecionando para /(auth)/user-identification');
      router.replace('/(auth)/user-identification');
    }
  }, [isAuthenticated, isIdentified]);

  console.log('✅ [AppLayout] Totalmente autenticado, renderizando app');
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: colors.tabBarActiveTint,
        drawerInactiveTintColor: colors.tabBarInactiveTint,
        drawerStyle: {
          backgroundColor: colors.cardBackground,
        },
        sceneStyle: { backgroundColor: colors.screenBackground },
        headerStyle: {
          backgroundColor: colors.headerBackground,
        },
        headerTintColor: colors.headerText,
      }}>
      <Drawer.Screen
        name="(agenda)"
        options={{
          title: 'Agenda',
          headerShown: false,
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="perfil"
        options={{
          ...headerOptions,
          title: 'Perfil',
          headerLeft: undefined,
          headerRight: undefined,
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="sobre"
        options={{
          ...headerOptions,
          title: 'Sobre',
          headerLeft: undefined,
          headerRight: undefined,
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="ajuda"
        options={{
          ...headerOptions,
          title: 'Ajuda',
          headerLeft: undefined,
          headerRight: undefined,
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="limitacoes"
        options={{
          ...headerOptions,
          title: 'Limitações da API',
          headerLeft: undefined,
          headerRight: undefined,
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );
}

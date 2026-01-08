import { CustomDrawerContent } from '@/components/CustomDrawerContent';
import { DrawerProfileButton, DrawerSearchButton } from '@/components/DrawerHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedHeader } from '@/hooks/ui';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';

/**
 * Layout de app - Guard: precisa estar TOTALMENTE autenticado (API + identificado)
 * Agora usando Drawer Navigation ao invés de Tabs
 */
export default function AppLayout() {
  const { colors } = useTheme();
  const headerOptions = useThemedHeader();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isIdentified = useUserStore((state) => state.isIdentified);
  const isRestored = useAuthStore((state) => state.isRestored);

  // Aguarda restauração antes de avaliar
  if (!isRestored) {
    console.log('⏳ [AppLayout] Aguardando restauração...');
    return null;
  }

  // Guard: Precisa estar autenticado na API
  if (!isAuthenticated) {
    console.log('🚫 [AppLayout] Não autenticado, redirecionando para /(auth)/login');
    return <Redirect href="/(auth)/login" />;
  }

  // Guard: Precisa estar identificado como funcionário
  if (!isIdentified) {
    console.log('🚫 [AppLayout] Não identificado, redirecionando para /(auth)/user-identification');
    return <Redirect href="/(auth)/user-identification?flow=login" />;
  }

  console.log('✅ [AppLayout] Totalmente autenticado, permitindo acesso');
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
        name="index" 
        options={{
          ...headerOptions,
          title: 'Agenda',
          headerTitle: '',
          headerLeft: () => <DrawerProfileButton />,
          headerRight: () => <DrawerSearchButton />,
          drawerItemStyle: { display: 'none' },
          headerShadowVisible: false,
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
      <Drawer.Screen 
        name="detalhes/cliente/[uuid]" 
        options={{ 
          ...headerOptions,
          headerShown: true,
          drawerItemStyle: { display: 'none' },
        }} 
      />
      <Drawer.Screen 
        name="detalhes/chamado/[id]" 
        options={{ 
          ...headerOptions,
          headerShown: true,
          headerTitle: 'Detalhes do Chamado',
          drawerItemStyle: { display: 'none' },
        }} 
      />
      <Drawer.Screen 
        name="detalhes/instalacao/[id]" 
        options={{ 
          ...headerOptions,
          headerShown: true,
          headerTitle: 'Detalhes da Instalação',
          drawerItemStyle: { display: 'none' },
        }} 
      />
      <Drawer.Screen 
        name="detalhes/instalacao/cliente-info" 
        options={{ 
          ...headerOptions,
          headerShown: true,
          headerTitle: 'Dados do Cliente',
          drawerItemStyle: { display: 'none' },
        }} 
      />
      <Drawer.Screen 
        name="(tabs)" 
        options={{ 
          drawerItemStyle: { display: 'none' },
        }} 
      />
    </Drawer>
  );
}

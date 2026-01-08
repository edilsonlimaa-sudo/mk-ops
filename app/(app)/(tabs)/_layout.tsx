import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedHeader } from '@/hooks/ui';
import { Tabs } from 'expo-router';

/**
 * Layout de tabs - Sem guard (já protegido pelo AppLayout)
 */
export default function TabLayout() {
  const headerOptions = useThemedHeader();
  const { colors } = useTheme();
  console.log('✅ [TabLayout] Renderizando tabs (protegido pelo AppLayout)');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabBarActiveTint,
        tabBarInactiveTintColor: colors.tabBarInactiveTint,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
        },
        sceneStyle: { backgroundColor: colors.screenBackground },
        headerShown: false, // Default false, cada tela decide
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          ...headerOptions,
          title: 'Home',
          headerShown: true,
          headerTitle: 'MK-Edge',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={24} name="house.fill" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          ...headerOptions,
          title: 'Clientes',
          headerShown: true,
          headerTitle: 'Clientes',
          headerShadowVisible: false,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={24} name="person.2.fill" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          ...headerOptions,
          title: 'Agenda',
          headerShadowVisible: false,
          headerShown: true,
          headerTitle: 'Agenda de Atendimentos',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={24} name="calendar" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda-v2"
        options={{
          ...headerOptions,
          title: 'Agenda V2',
          headerShadowVisible: false,
          headerShown: true,
          headerTitle: 'Agenda V2 (Store Silenciosa)',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={24} name="calendar" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          ...headerOptions,
          title: 'Histórico',
          headerShadowVisible: false,
          headerShown: true,
          headerTitle: 'Histórico',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={24} name="checkmark.circle.fill" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: 'Config',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={24} name="gearshape.fill" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
    </Tabs>
  );
}

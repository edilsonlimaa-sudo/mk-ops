import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme, useThemedHeader } from '@/hooks/ui';
import { Tabs } from 'expo-router';

/**
 * Layout de tabs - Sem guard (já protegido pelo AppLayout)
 */
export default function TabLayout() {
  const headerOptions = useThemedHeader();
  const colorScheme = useColorScheme();
  console.log('✅ [TabLayout] Renderizando tabs (protegido pelo AppLayout)');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6', // Azul visível
        tabBarInactiveTintColor: '#6b7280', // Cinza visível
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
            <IconSymbol size={28} name="house.fill" color={color || (focused ? '#3b82f6' : '#6b7280')} />
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
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="person.2.fill" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          ...headerOptions,
          title: 'Agenda',
          headerShown: true,
          headerTitle: 'Agenda de Atendimentos',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="calendar" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          ...headerOptions,
          title: 'Histórico',
          headerShown: true,
          headerTitle: 'Histórico',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="checkmark.circle.fill" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: 'Config',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
    </Tabs>
  );
}

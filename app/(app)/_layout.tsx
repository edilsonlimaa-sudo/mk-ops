import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
          title: 'Home',
          headerShown: true,
          headerTitle: 'MK-Auth Mobile',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="house.fill" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="person.2.fill" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
      <Tabs.Screen
        name="chamados"
        options={{
          title: 'Chamados',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="list.bullet.rectangle" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          headerShown: true,
          headerTitle: 'Agenda de Atendimentos',
          headerShadowVisible: false,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="calendar" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          headerShown: true,
          headerTitle: 'Histórico',
          headerShadowVisible: false,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="checkmark.circle.fill" color={color || (focused ? '#3b82f6' : '#6b7280')} />
          ),
        }}
      />
    </Tabs>
  );
}

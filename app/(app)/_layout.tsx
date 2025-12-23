import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="detalhes/cliente/[id]" 
        options={{ 
          headerShown: true,
          headerBackTitle: 'Voltar',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="detalhes/chamado/[id]" 
        options={{ 
          headerShown: true,
          headerBackTitle: 'Voltar',
          headerTitle: 'Detalhes do Chamado',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="detalhes/instalacao/[id]" 
        options={{ 
          headerShown: true,
          headerBackTitle: 'Voltar',
          headerTitle: 'Detalhes da Instalação',
          presentation: 'card',
        }} 
      />
    </Stack>
  );
}

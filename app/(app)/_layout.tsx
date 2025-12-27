import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

/**
 * Layout de app - Guard: precisa estar TOTALMENTE autenticado (API + identificado)
 */
export default function AppLayout() {
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
    return <Redirect href="/(auth)/user-identification" />;
  }

  console.log('✅ [AppLayout] Totalmente autenticado, permitindo acesso');
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

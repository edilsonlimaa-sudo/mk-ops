import { Stack } from 'expo-router';

/**
 * Layout para rotas de bloqueio por licença.
 * Sem guards de autenticação — deve ser acessível independente do estado de auth.
 */
export default function BlockedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="license-expired" options={{ headerShown: false }} />
    </Stack>
  );
}

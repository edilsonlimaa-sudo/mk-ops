import { DrawerProfileButton, DrawerSearchButton } from '@/components/DrawerHeader';
import { useThemedHeader } from '@/hooks/ui';
import { Stack } from 'expo-router';

/**
 * Stack navigation para Agenda e suas telas de detalhes
 */
export default function AgendaStackLayout() {
  const headerOptions = useThemedHeader();

  return (
    <Stack
      screenOptions={{
        ...headerOptions,
        headerShown: true,
      }}>
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Agenda',
          headerTitle: '',
          headerLeft: () => <DrawerProfileButton />,
          headerRight: () => <DrawerSearchButton />,
          headerShadowVisible: false,
        }} 
      />
    </Stack>
  );
}

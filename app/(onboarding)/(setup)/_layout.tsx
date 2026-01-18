import { useTheme } from '@/contexts/ThemeContext';
import { useOnboardingStore } from '@/stores/onboarding/useOnboardingStore';
import { useSetupStore } from '@/stores/onboarding/useSetupStore';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';

export default function SetupLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { colors } = useTheme();
  const { canAccessStep, setCurrentStep } = useSetupStore();
  const { exitSetup } = useOnboardingStore();

  const handleExit = () => {
    Alert.alert(
      'Sair da Configuração',
      'Tem certeza que deseja sair? Seu progresso será perdido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            const route = exitSetup();
            router.replace(route as any);
          },
        },
      ]
    );
  };

  useEffect(() => {
    // Extrai o número do step da rota (1-server.tsx -> 1, 2-credentials.tsx -> 2, etc)
    const stepMatch = pathname.match(/\/(\d+)-/);

    if (stepMatch) {
      const stepNumber = parseInt(stepMatch[1], 10);

      // Atualiza o step atual na store
      setCurrentStep(stepNumber);

      // Valida se pode acessar este step
      if (!canAccessStep(stepNumber)) {
        console.warn(`❌ Acesso negado ao step ${stepNumber}. Redirecionando para o início...`);
        router.replace('/(onboarding)/(setup)/1-server');
      }
    }
  }, [pathname]);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.headerBackground,
        },
        headerTintColor: colors.headerText,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        animation: 'slide_from_right',
        headerRight: () => (
          <TouchableOpacity
            onPress={handleExit}
            style={{ paddingRight: 16, paddingVertical: 8 }}
          >
            <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: '600' }}>
              Sair
            </Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="1-server"
        options={{
          title: 'Configuração do Servidor',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="2-credentials"
        options={{
          title: 'Credenciais de Acesso',
        }}
      />
      <Stack.Screen
        name="3-permissions"
        options={{
          title: 'Permissões do Sistema',
        }}
      />
      <Stack.Screen
        name="4-validation"
        options={{
          title: 'Validação e Teste',
        }}
      />
    </Stack>
  );
}

import { useTheme } from '@/contexts/ThemeContext';
import { useOnboardingStore } from '@/stores/onboarding/useOnboardingStore';
import { useSetupStore } from '@/stores/onboarding/useSetupStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, BackHandler, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FormData = {
  url: string;
};

export default function ServerSetup() {
  const { colors } = useTheme();
  const router = useRouter();
  const { setServerUrl, completeStep, data } = useSetupStore();
  const { exitSetup } = useOnboardingStore();
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      url: data.serverUrl || '',
    },
  });

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
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
        return true;
      });

      return () => backHandler.remove();
    }, [])
  );

  const onSubmit = (data: FormData) => {
    const cleanUrl = data.url.replace(/^https?:\/\//, '').trim();
    setServerUrl(cleanUrl);
    completeStep(1);
    router.push('/(onboarding)/(setup)/2-credentials');
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.screenBackground }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        paddingBottom: insets.bottom || 24,
      }}
      keyboardShouldPersistTaps="always"
      enableOnAndroid={true}
      extraScrollHeight={20}
      showsVerticalScrollIndicator={false}
    >
      <View
        className="border rounded-2xl p-6 w-full max-w-md"
        style={{
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        }}
        >
        <View className="items-center mb-4">
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
            style={{ backgroundColor: '#2563eb15' }}
          >
            <Text className="text-4xl">🔗</Text>
          </View>

          <View className="rounded-full px-3 py-1" style={{ backgroundColor: '#2563eb15' }}>
            <Text className="text-xs font-medium" style={{ color: '#2563eb' }}>
              Passo 1 de 4 • Conexão
            </Text>
          </View>
        </View>

        <Text className="text-xl font-bold mb-2 text-center" style={{ color: colors.cardTextPrimary }}>
          URL do Servidor
        </Text>

        <Text className="text-sm mb-6 text-center" style={{ color: colors.cardTextSecondary }}>
          Informe o endereço onde seu MK-Auth está hospedado
        </Text>

        <View className="mb-4">
          <Text className="text-xs font-semibold mb-2 ml-1" style={{ color: colors.cardTextSecondary }}>
            URL DO SERVIDOR
          </Text>

          <Controller
            control={control}
            name="url"
            rules={{
              required: 'Por favor, informe a URL do seu MK-Auth',
              pattern: {
                value: /^[a-zA-Z0-9][a-zA-Z0-9-_.:]+(:\d+)?$/,
                message: 'URL inválida. Use formato: dominio.com.br ou 192.168.1.1:8080'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className="border-2 rounded-xl flex-row items-center"
                style={{
                  backgroundColor: colors.screenBackground,
                  borderColor: errors.url ? '#ef4444' : colors.cardBorder,
                }}
              >
                <View
                  className="px-4 py-4 border-r"
                  style={{
                    backgroundColor: colors.cardTextSecondary + '10',
                    borderRightColor: colors.cardBorder,
                  }}
                >
                  <Text className="text-sm font-medium" style={{ color: colors.cardTextSecondary }}>
                    https://
                  </Text>
                </View>
                <TextInput
                  className="flex-1 text-sm px-4 py-4"
                  style={{ color: colors.cardTextPrimary }}
                  placeholder="meu.provedor.com.br"
                  placeholderTextColor={colors.cardTextSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleSubmit(onSubmit)}
                  returnKeyType="next"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>
            )}
          />

          {errors.url && (
            <Text className="text-xs mt-2 ml-1" style={{ color: '#ef4444' }}>
              {errors.url.message}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="py-3 rounded-xl items-center mt-3"
          style={{ backgroundColor: '#2563eb' }}
          activeOpacity={0.8}
        >
          <Text className="text-base font-semibold" style={{ color: '#ffffff' }}>
            Avançar
          </Text>
        </TouchableOpacity>
        </View>
    </KeyboardAwareScrollView>
  );
}
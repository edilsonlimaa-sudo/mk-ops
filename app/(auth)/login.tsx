import { useAuthStore } from '@/stores/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

const loginSchema = z.object({
  ipMkAuth: z.string().min(1, 'IP do MK-Auth é obrigatório'),
  clientId: z.string().min(1, 'Client ID é obrigatório'),
  clientSecret: z.string().min(1, 'Client Secret é obrigatório'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoadingState = 'idle' | 'connecting' | 'success' | 'error';

export default function Login() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));

  console.log('🔐 [Login] Componente renderizado. isAuthenticated:', isAuthenticated);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      ipMkAuth: 'provedor.updata.com.br',
      clientId: 'Client_Id_4d1e692d668f91461077c08a16c5456b',
      clientSecret: 'Client_Secret_137ae744f2ee12fef3a7eea070edbca3d0bb449e',
    },
  });

  // Redireciona para tabs se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🚀 [Login] Redirecionando para user-identification');
      router.replace('/(auth)/user-identification?flow=login');
    }
  }, [isAuthenticated]);

  // Animação de entrada do loading screen
  useEffect(() => {
    if (loadingState === 'connecting') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [loadingState]);

  // Animação de erro (X vermelho)
  useEffect(() => {
    if (loadingState === 'error') {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Após 1.8s, volta para idle
      setTimeout(() => {
        setLoadingState('idle');
      }, 1800);
    }
  }, [loadingState]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('📝 [Login] Iniciando processo de login...');
      setLoadingState('connecting');
      
      await login(data.ipMkAuth, data.clientId, data.clientSecret);
      console.log('✅ [Login] Login concluído! Redirecionando...');
      // useEffect vai redirecionar automaticamente quando isAuthenticated mudar
    } catch (error) {
      console.error('❌ [Login] Erro no login:', error);
      setLoadingState('error'); // Mostra X vermelho
      // Após animação (1.8s), o Toast será mostrado quando voltar para idle
    }
  };

  return (
    <>
      <View className="flex-1 bg-gray-50 justify-center px-6">
        {/* Header */}
        <View className="mb-8">
        <Text className="text-sm font-semibold text-blue-600 mb-2">
          ETAPA 1 DE 2
        </Text>
        <Text className="text-4xl font-bold text-gray-900 mb-2">
          Conecte-se ao Sistema
        </Text>
        <Text className="text-lg text-gray-600">
          Informe as credenciais do provedor
        </Text>
      </View>

      {/* Formulário */}
      <View className="bg-white rounded-2xl p-6 shadow-lg">
        {/* IP MK-Auth */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            IP do MK-Auth
          </Text>
          <Controller
            control={control}
            name="ipMkAuth"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="provedor.updata.com.br"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />
          {errors.ipMkAuth && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.ipMkAuth.message}
            </Text>
          )}
        </View>

        {/* Client ID */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Client ID
          </Text>
          <Controller
            control={control}
            name="clientId"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="Client_Id_..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />
          {errors.clientId && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.clientId.message}
            </Text>
          )}
        </View>

        {/* Client Secret */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Client Secret
          </Text>
          <Controller
            control={control}
            name="clientSecret"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="Client_Secret_..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            )}
          />
          {errors.clientSecret && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.clientSecret.message}
            </Text>
          )}
        </View>

        {/* Botão de Login */}
        <TouchableOpacity
          className={`bg-blue-500 rounded-lg py-4 items-center ${
            isLoading ? 'opacity-50' : ''
          }`}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#fff" />
              <Text className="text-white font-semibold text-base ml-2">
                Conectando ao provedor...
              </Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-lg">
              Conectar ao Sistema
            </Text>
          )}
        </TouchableOpacity>
      </View>

        {/* Footer */}
        <View className="mt-6 items-center">
          <Text className="text-gray-500 text-sm">
            Credenciais pré-preenchidas para teste
          </Text>
        </View>
      </View>

      {/* Loading Screen Fullscreen */}
      {(loadingState === 'connecting' || loadingState === 'error') && (
        <Animated.View 
          style={{ opacity: fadeAnim }}
          className="absolute inset-0 bg-white justify-center items-center z-50"
        >
          {loadingState === 'connecting' && (
            <View className="items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-xl font-semibold text-gray-900 mt-6">
                Conectando ao MK-Auth
              </Text>
              <Text className="text-sm text-gray-500 mt-2">
                Aguarde um momento...
              </Text>
            </View>
          )}

          {loadingState === 'error' && (
            <Animated.View 
              style={{ transform: [{ scale: scaleAnim }] }}
              className="items-center"
            >
              {/* X Icon Vermelho */}
              <View className="w-20 h-20 bg-red-500 rounded-full items-center justify-center mb-6">
                <Text className="text-white text-4xl font-bold">✕</Text>
              </View>
              <Text className="text-xl font-semibold text-gray-900">
                Erro ao conectar!
              </Text>
              <Text className="text-sm text-gray-500 mt-2">
                Verifique as credenciais...
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </>
  );
}

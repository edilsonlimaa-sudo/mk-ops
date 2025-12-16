import { useAuthStore } from '@/stores/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

const loginSchema = z.object({
  ipMkAuth: z.string().min(1, 'IP do MK-Auth é obrigatório'),
  clientId: z.string().min(1, 'Client ID é obrigatório'),
  clientSecret: z.string().min(1, 'Client Secret é obrigatório'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuthStore();

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

  // Redireciona para home se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.ipMkAuth, data.clientId, data.clientSecret);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      router.replace('/');
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao fazer login');
    }
  };

  return (
    <View className="flex-1 bg-gray-50 justify-center px-6">
      {/* Header */}
      <View className="mb-8">
        <Text className="text-4xl font-bold text-gray-900 mb-2">
          MK-Auth Mobile
        </Text>
        <Text className="text-lg text-gray-600">
          Faça login para continuar
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
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-lg">
              Entrar
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
  );
}

import type { ChamadoDetalhesParams } from '@/types/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChamadoDetalhesScreen() {
  const { id } = useLocalSearchParams<ChamadoDetalhesParams>();
  const router = useRouter();

  // Fase 1: apenas skeleton, sem dados reais
  const isLoading = false;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-600 mt-4">Carregando...</Text>
          </View>
        ) : (
          <View className="p-4">
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-2">
                Chamado ID: {id}
              </Text>
              <Text className="text-gray-600">
                🚧 Tela em construção - Fase 1 (Skeleton)
              </Text>
              <Text className="text-gray-500 text-sm mt-2">
                Esta tela será preenchida na Fase 2 com dados reais da API
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-blue-500 rounded-lg p-4 items-center"
            >
              <Text className="text-white font-semibold">Voltar</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
  );
}

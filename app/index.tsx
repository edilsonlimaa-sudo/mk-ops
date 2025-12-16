import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, logout, ipMkAuth } = useAuthStore();

  // Redireciona para login se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // Se não autenticado, não renderiza nada (já redirecionou)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Header */}
        <View className="mb-8 mt-12">
          <Text className="text-4xl font-bold text-gray-900 mb-2">MK-Auth Mobile</Text>
          <Text className="text-lg text-gray-600">Com NativeWind/Tailwind ✅</Text>
        </View>

        {/* Auth Status Card */}
        <View className="rounded-2xl p-6 mb-4 shadow-lg bg-green-500">
          <Text className="text-white text-2xl font-bold mb-2">
            🔓 Autenticado
          </Text>
          <Text className="text-white text-opacity-90 mb-4">
            Conectado em: {ipMkAuth}
          </Text>
          
          <TouchableOpacity
            onPress={logout}
            className="bg-white bg-opacity-20 rounded-lg px-4 py-3 active:opacity-70"
          >
            <Text className="text-white text-center font-semibold">Fazer Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Card Branco com Pills */}
        <View className="bg-white rounded-xl p-6 mb-4 shadow-md">
          <Text className="text-xl font-semibold text-gray-800 mb-4">Bibliotecas instaladas</Text>
          <View className="flex-row justify-between items-center">
            <View className="bg-green-100 px-3 py-2 rounded-lg">
              <Text className="text-green-700 text-xs font-medium">Zustand</Text>
            </View>
            <View className="bg-yellow-100 px-3 py-2 rounded-lg">
              <Text className="text-yellow-700 text-xs font-medium">React Query</Text>
            </View>
            <View className="bg-red-100 px-3 py-2 rounded-lg">
              <Text className="text-red-700 text-xs font-medium">Axios</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-8 mb-12 items-center">
          <Text className="text-gray-500 text-sm">Sistema de autenticação implementado ✅</Text>
        </View>
      </View>
    </ScrollView>
  );
}

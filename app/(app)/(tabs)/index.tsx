import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { logout, ipMkAuth } = useAuthStore();
  const { clearIdentification, currentUser } = useUserStore();

  const handleSwitchUser = async () => {
    await clearIdentification();
    router.replace('/(app)/user-identification');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Welcome Card */}
        {currentUser && (
          <View className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 mb-4 shadow-lg">
            <Text className="text-white text-3xl font-bold mb-1">
              Olá, {currentUser.nome}! 👋
            </Text>
            <Text className="text-white text-opacity-90 text-base">
              @{currentUser.login} • {currentUser.email}
            </Text>
          </View>
        )}

        {/* Auth Status Card */}
        <View className="rounded-2xl p-6 mb-4 shadow-lg bg-green-500">
          <Text className="text-white text-2xl font-bold mb-2">
            🔓 Autenticado
          </Text>
          <Text className="text-white text-opacity-90 mb-4">
            Conectado em: {ipMkAuth}
          </Text>
          
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleSwitchUser}
              className="flex-1 bg-white bg-opacity-20 rounded-lg px-4 py-3 active:opacity-70 flex-row items-center justify-center"
            >
              <Ionicons name="swap-horizontal" size={18} color="white" />
              <Text className="text-white text-center font-semibold ml-2">Trocar Usuário</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={logout}
              className="flex-1 bg-white bg-opacity-20 rounded-lg px-4 py-3 active:opacity-70 flex-row items-center justify-center"
            >
              <Ionicons name="log-out-outline" size={18} color="white" />
              <Text className="text-white text-center font-semibold ml-2">Logout</Text>
            </TouchableOpacity>
          </View>
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

import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { logout, ipMkAuth } = useAuthStore();
  const { clearIdentification, currentUser } = useUserStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Determina a saudação baseada na hora do dia
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const handleSwitchUser = async () => {
    setShowProfileMenu(false);
    await clearIdentification();
    router.replace('/(app)/user-identification');
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await clearIdentification(); // Limpa identificação do usuário
    logout(); // Desconecta da API
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowProfileMenu(true)}
              className="mr-2"
            >
              <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
                <Text className="text-white text-lg font-bold">
                  {currentUser?.nome.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-6">
          {/* Greeting Card */}
          {currentUser && (
            <View className="bg-blue-600 rounded-2xl p-6 mb-4 shadow-lg">
              <Text className="text-white text-3xl font-bold mb-2">
                {greeting}! 👋
              </Text>
              <Text className="text-white text-base">
                {currentUser.nome.split(' ')[0]}, pronto para começar?
              </Text>
            </View>
          )}

          {/* Connection Badge */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
              <Text className="text-gray-600 text-sm font-medium">Conectado</Text>
            </View>
            <Text className="text-gray-900 font-semibold text-sm">{ipMkAuth}</Text>
          </View>

          {/* Navigation Cards */}
          <View className="gap-4 mb-6">
            {/* Agenda Card */}
            <TouchableOpacity
              onPress={() => router.push('/(app)/(tabs)/agenda')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 active:bg-gray-50"
            >
              <View className="flex-row items-center">
                <View className="bg-blue-100 w-14 h-14 rounded-full items-center justify-center mr-4">
                  <Ionicons name="calendar" size={28} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-xl font-bold mb-1">Minha Agenda</Text>
                  <Text className="text-gray-500 text-sm">Veja seus agendamentos</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
              </View>
            </TouchableOpacity>

            {/* Clientes Card */}
            <TouchableOpacity
              onPress={() => router.push('/(app)/(tabs)/clientes')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 active:bg-gray-50"
            >
              <View className="flex-row items-center">
                <View className="bg-green-100 w-14 h-14 rounded-full items-center justify-center mr-4">
                  <Ionicons name="people" size={28} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-xl font-bold mb-1">Clientes</Text>
                  <Text className="text-gray-500 text-sm">Buscar e gerenciar</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
              </View>
            </TouchableOpacity>

            {/* Histórico Card */}
            <TouchableOpacity
              onPress={() => router.push('/(app)/(tabs)/historico')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 active:bg-gray-50"
            >
              <View className="flex-row items-center">
                <View className="bg-purple-100 w-14 h-14 rounded-full items-center justify-center mr-4">
                  <Ionicons name="time" size={28} color="#8b5cf6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-xl font-bold mb-1">Histórico</Text>
                  <Text className="text-gray-500 text-sm">Chamados finalizados</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Profile Menu Modal */}
      <Modal
        visible={showProfileMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowProfileMenu(false)}
          className="flex-1 bg-black/50 justify-start items-end pt-16 pr-4"
        >
          <View className="bg-white rounded-2xl shadow-2xl w-80">
            {/* Profile Header */}
            {currentUser && (
              <View className="p-6 border-b border-gray-100">
                <View className="flex-row items-center mb-3">
                  <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mr-4">
                    <Text className="text-white text-2xl font-bold">
                      {currentUser.nome.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 text-lg font-bold">
                      {currentUser.nome}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      @{currentUser.login}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-400 text-xs">
                  {currentUser.email}
                </Text>
              </View>
            )}

            {/* Menu Items */}
            <View className="py-2">
              <TouchableOpacity
                onPress={handleSwitchUser}
                className="flex-row items-center px-6 py-4 active:bg-gray-50"
              >
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
                  <Ionicons name="swap-horizontal" size={20} color="#374151" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold">Trocar Usuário</Text>
                  <Text className="text-gray-500 text-xs">Fazer login com outro usuário</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center px-6 py-4 active:bg-gray-50"
              >
                <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mr-4">
                  <Ionicons name="log-out-outline" size={20} color="#dc2626" />
                </View>
                <View className="flex-1">
                  <Text className="text-red-600 font-semibold">Sair</Text>
                  <Text className="text-gray-500 text-xs">Desconectar da API</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-2xl">
              <View className="flex-row items-center justify-center mb-1">
                <Ionicons name="construct" size={14} color="#9ca3af" />
                <Text className="text-gray-600 text-xs font-semibold ml-2">MK-Edge</Text>
              </View>
              <Text className="text-gray-400 text-xs text-center">
                v1.0.0 • {ipMkAuth}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const { ipMkAuth } = useAuthStore();
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
    console.log('🔄 [Home] Trocando de usuário...');
    setShowProfileMenu(false);
    
    // Limpa identificação
    await clearIdentification();
    console.log('✅ [Home] Identificação limpa');
    
    // Vai para /(auth)/user-identification (trocar usuário)
    console.log('➡️ [Home] Redirecionando para /(auth)/user-identification');
    router.replace('/(auth)/user-identification?flow=switchUser');
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

      {/* Content */}
      <ThemedView variant="screen" className="flex-1">
        <ScrollView className="flex-1">
          <View className="p-6">
          {/* Greeting Card */}
          {currentUser && (
            <View className="bg-blue-600 rounded-xl p-4 mb-4 shadow-lg">
              <Text className="text-white text-xl font-bold mb-1">
                {greeting}! 👋
              </Text>
              <Text className="text-white text-sm">
                {currentUser.nome.split(' ')[0]}, pronto para começar?
              </Text>
            </View>
          )}

          {/* Connection Badge */}
          <View style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} className="rounded-lg p-3 mb-4 shadow-sm border flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-medium">Conectado</Text>
            </View>
            <Text style={{ color: colors.cardTextPrimary }} className="font-medium text-xs">{ipMkAuth}</Text>
          </View>

          {/* Navigation Cards */}
          <View className="gap-3 mb-4">
            {/* Agenda Card */}
            <TouchableOpacity
              onPress={() => router.push('/(app)/(tabs)/agenda')}
              style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }}
              className="rounded-xl p-4 shadow-sm border"
            >
              <View className="flex-row items-center">
                <View style={{ backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="calendar" size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold">Minha Agenda</Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs">Veja seus agendamentos</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.cardTextSecondary} />
              </View>
            </TouchableOpacity>

            {/* Clientes Card */}
            <TouchableOpacity
              onPress={() => router.push('/(app)/(tabs)/clientes')}
              style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }}
              className="rounded-xl p-4 shadow-sm border"
            >
              <View className="flex-row items-center">
                <View style={{ backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5' }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="people" size={20} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold">Clientes</Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs">Buscar e gerenciar</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.cardTextSecondary} />
              </View>
            </TouchableOpacity>

            {/* Histórico Card */}
            <TouchableOpacity
              onPress={() => router.push('/(app)/(tabs)/historico')}
              style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }}
              className="rounded-xl p-4 shadow-sm border"
            >
              <View className="flex-row items-center">
                <View style={{ backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe' }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="time" size={20} color="#8b5cf6" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold">Histórico</Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs">Chamados finalizados</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.cardTextSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </ThemedView>

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
          <View style={{ backgroundColor: colors.cardBackground }} className="rounded-2xl shadow-2xl w-80">
            {/* Profile Header */}
            {currentUser && (
              <View style={{ borderBottomColor: colors.cardBorder }} className="p-6 border-b">
                <View className="flex-row items-center mb-3">
                  <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mr-4">
                    <Text className="text-white text-2xl font-bold">
                      {currentUser.nome.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold">
                      {currentUser.nome}
                    </Text>
                    <Text style={{ color: colors.cardTextSecondary }} className="text-sm">
                      @{currentUser.login}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: theme === 'dark' ? '#64748b' : '#9ca3af' }} className="text-xs">
                  {currentUser.email}
                </Text>
              </View>
            )}

            {/* Menu Items */}
            <View className="py-2">
              <TouchableOpacity
                onPress={handleSwitchUser}
                className="flex-row items-center px-6 py-4"
              >
                <View style={{ backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' }} className="w-10 h-10 rounded-full items-center justify-center mr-4">
                  <Ionicons name="swap-horizontal" size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.cardTextPrimary }} className="font-semibold">Trocar Usuário</Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs">Fazer login com outro usuário</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.cardTextSecondary} />
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={{ borderTopColor: colors.cardBorder, backgroundColor: theme === 'dark' ? colors.screenBackground : '#f9fafb' }} className="border-t p-4 rounded-b-2xl">
              <View className="flex-row items-center justify-center mb-1">
                <Ionicons name="construct" size={14} color={colors.cardTextSecondary} />
                <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold ml-2">MK-Edge</Text>
              </View>
              <Text style={{ color: theme === 'dark' ? '#64748b' : '#9ca3af' }} className="text-xs text-center">
                v1.0.0 • {ipMkAuth}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

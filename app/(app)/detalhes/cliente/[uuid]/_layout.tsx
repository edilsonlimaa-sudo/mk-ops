import { useClientDetail } from '@/hooks/cliente';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Stack, useLocalSearchParams, withLayoutContext } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClienteContext } from './ClienteContext';

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

export default function ClienteDetalhesLayout() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const { data: cliente, isLoading, error } = useClientDetail(uuid);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Cliente' }} />
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-600 mt-4">Carregando cliente...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: 'Erro' }} />
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
          <View className="flex-1 justify-center items-center p-6">
            <Text className="text-red-500 text-lg font-semibold mb-2">
              Erro ao carregar cliente
            </Text>
            <Text className="text-gray-600 text-center mb-4">
              {error.message}
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!cliente) {
    return (
      <>
        <Stack.Screen options={{ title: 'Cliente' }} />
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
          <View className="flex-1 justify-center items-center p-6">
            <Text className="text-gray-500 text-lg">Cliente não encontrado</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: cliente.nome,
          headerBackTitle: 'Voltar',
          headerStyle: {
            backgroundColor: '#0284c7',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <ClienteContext.Provider value={{ cliente }}>
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
          <MaterialTopTabs
            screenOptions={{
              tabBarScrollEnabled: false,
              tabBarActiveTintColor: '#3b82f6',
              tabBarInactiveTintColor: '#6b7280',
              tabBarIndicatorStyle: {
                backgroundColor: '#3b82f6',
                height: 3,
              },
              tabBarStyle: {
                backgroundColor: '#ffffff',
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 1,
                borderBottomColor: '#e5e7eb',
              },
              tabBarLabelStyle: {
                fontSize: 13,
                fontWeight: '600',
                textTransform: 'none',
              },
              tabBarShowIcon: true,
            }}
          >
            <MaterialTopTabs.Screen
              name="index"
              options={{ 
                title: 'Geral',
                tabBarIcon: ({ color }: { color: string }) => (
                  <Ionicons name="information-circle-outline" size={20} color={color} />
                ),
              }}
            />
            <MaterialTopTabs.Screen
              name="tecnico"
              options={{ 
                title: 'Técnico',
                tabBarIcon: ({ color }: { color: string }) => (
                  <Ionicons name="settings-outline" size={20} color={color} />
                ),
              }}
            />
            <MaterialTopTabs.Screen
              name="observacoes"
              options={{ 
                title: 'Observações',
                tabBarIcon: ({ color }: { color: string }) => (
                  <Ionicons name="document-text-outline" size={20} color={color} />
                ),
              }}
            />
          </MaterialTopTabs>
        </SafeAreaView>
      </ClienteContext.Provider>
    </>
  );
}

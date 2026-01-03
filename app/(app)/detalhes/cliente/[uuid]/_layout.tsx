import { EditModal } from '@/components/instalacao/EditModal';
import { useClientDetail, useUpdateClient } from '@/hooks/cliente';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ClienteContext } from './ClienteContext';
import EnderecosTab from './enderecos';
import { ErrorBoundary } from './ErrorBoundary';
import GeralTab from './index';
import ObservacoesTab from './observacoes';

const Tab = createMaterialTopTabNavigator();

export default function ClienteDetalhesLayout() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const { data: cliente, isLoading, error } = useClientDetail(uuid);
  const updateClientMutation = useUpdateClient();

  // Estados para edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editMultiline, setEditMultiline] = useState(false);

  const openEditModal = (field: string, value: string, label: string, multiline = false) => {
    setEditField(field);
    setEditValue(value);
    setEditLabel(label);
    setEditMultiline(multiline);
    setEditModalVisible(true);
  };

  const salvarEdicao = () => {
    if (!editField || !cliente) return;

    const payload = {
      uuid: cliente.uuid_cliente,
      [editField]: editValue,
    };

    updateClientMutation.mutate(payload, {
      onSuccess: () => {
        setEditModalVisible(false);
        Toast.show({
          type: 'success',
          text1: 'Alteração salva! ✅',
          position: 'top',
          visibilityTime: 2000,
          topOffset: 60,
        });
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar',
          text2: error instanceof Error ? error.message : 'Tente novamente',
          position: 'top',
          topOffset: 60,
        });
      },
    });
  };

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
      <ClienteContext.Provider value={{ cliente, openEditModal }}>
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
          <ErrorBoundary>
            <Tab.Navigator
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
              <Tab.Screen
                name="Geral"
                component={GeralTab}
                options={{ 
                  tabBarIcon: ({ color }: { color: string }) => (
                    <Ionicons name="information-circle-outline" size={20} color={color} />
                  ),
                }}
              />
              <Tab.Screen
                name="Endereços"
                component={EnderecosTab}
                options={{ 
                  tabBarIcon: ({ color }: { color: string }) => (
                    <Ionicons name="location-outline" size={20} color={color} />
                  ),
                }}
              />
              <Tab.Screen
                name="Observações"
                component={ObservacoesTab}
                options={{ 
                  tabBarIcon: ({ color }: { color: string }) => (
                    <Ionicons name="document-text-outline" size={20} color={color} />
                  ),
                }}
              />
            </Tab.Navigator>
          </ErrorBoundary>

          {/* Modal de Edição Global */}
          <EditModal
            visible={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            onSave={salvarEdicao}
            title={`Editar ${editLabel}`}
            value={editValue}
            onChange={setEditValue}
            placeholder={`Digite o ${editLabel.toLowerCase()}`}
            isPending={updateClientMutation.isPending}
            multiline={editMultiline}
          />
        </SafeAreaView>
      </ClienteContext.Provider>
    </>
  );
}

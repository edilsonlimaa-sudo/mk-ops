import { EditModal } from '@/components/instalacao/EditModal';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useClientDetail, useUpdateClient } from '@/hooks/cliente';
import { ClienteContext } from '@/lib/cliente/ClienteContext';
import { ErrorBoundary } from '@/lib/cliente/ErrorBoundary';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import EnderecosTab from './enderecos';
import GeralTab from './index';
import ObservacoesTab from './observacoes';

const Tab = createMaterialTopTabNavigator();

export default function ClienteDetalhesLayout() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const { data: cliente, isLoading, error, refetch, isFetching } = useClientDetail(uuid);
  const updateClientMutation = useUpdateClient();
  const { colors, mode } = useTheme();

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
          title: '',
          headerBackTitle: 'Voltar',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
          headerTintColor: colors.headerText,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <ClienteContext.Provider value={{ cliente, openEditModal, refetch, isFetching }}>
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.screenBackground }} edges={['bottom']}>
          <ErrorBoundary>
            {/* HERO */}
            <View className="px-4 pt-4 pb-4" style={{ backgroundColor: colors.headerBackground }}>
              <View className="flex-row items-center mb-3">
                <View className="w-16 h-16 rounded-full items-center justify-center mr-4" style={{ backgroundColor: colors.searchInputBackground }}>
                  <Ionicons name="person" size={32} color={colors.tabBarActiveTint} />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold mb-1" style={{ color: colors.headerText }}>{cliente.nome}</Text>
                  <View className="flex-row items-center gap-2">
                    <Badge
                      label={cliente.cli_ativado === 's' ? 'Ativo' : 'Inativo'}
                      color={cliente.cli_ativado === 's' ? 'green' : 'gray'}
                      variant="outline"
                      bold={false}
                    />
                    <Badge
                      label={cliente.bloqueado === 'sim' ? 'Bloqueado' : 'Desbloqueado'}
                      color={cliente.bloqueado === 'sim' ? 'red' : 'blue'}
                      variant="outline"
                      bold={false}
                    />
                  </View>
                </View>
              </View>
            </View>

            <Tab.Navigator
              screenOptions={{
                tabBarScrollEnabled: false,
                tabBarActiveTintColor: colors.tabBarActiveTint,
                tabBarInactiveTintColor: colors.tabBarInactiveTint,
                tabBarIndicatorStyle: {
                  backgroundColor: colors.tabBarActiveTint,
                  height: 3,
                },
                tabBarStyle: {
                  backgroundColor: colors.tabBarBackground,
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.tabBarBorder,
                  height: 48,
                },
                tabBarLabelStyle: {
                  fontSize: 13,
                  fontWeight: '600',
                  textTransform: 'none',
                  marginBottom: 8,
                },
                tabBarShowIcon: false,
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

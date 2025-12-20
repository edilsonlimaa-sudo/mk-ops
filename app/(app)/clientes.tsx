import { useClients, useInvalidateClients } from '@/hooks/useClients';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClientesScreen() {
  const { data: clients, isLoading, isFetching, error } = useClients();
  const { invalidate } = useInvalidateClients();

  // Debug: log do erro
  if (error) {
    console.error('❌ Erro ao buscar clientes:', error);
  }

  const handleRefresh = async () => {
    console.log('🔄 [ClientesScreen] Pull-to-refresh acionado pelo usuário');
    console.log('⚡ [ClientesScreen] Invalidando cache, query será re-executada...');
    await invalidate();
    console.log('✅ [ClientesScreen] Dados atualizados com sucesso!');
  };

  if (isLoading && !clients) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Carregando clientes...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
        <Text className="text-red-500 text-lg font-semibold mb-2">
          Erro ao carregar clientes
        </Text>
        <Text className="text-gray-600 text-center mb-4">
          {error.message}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-2xl font-bold text-gray-900">Clientes</Text>
            <Text className="text-gray-500 mt-1">
              {clients?.length || 0} clientes cadastrados
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="justify-center items-center py-12">
            <Text className="text-gray-500 text-center">
              Nenhum cliente encontrado
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900">
              {item.nome}
            </Text>
            
            {item.cpf_cnpj && (
              <Text className="text-sm text-gray-600 mt-1">
                CPF/CNPJ: {item.cpf_cnpj}
              </Text>
            )}
            
            <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <View>
                <Text className="text-xs text-gray-500">Plano</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {item.plano}
                </Text>
              </View>
              
              <View>
                <Text className="text-xs text-gray-500">Status</Text>
                <View
                  className={`px-2 py-1 rounded ${
                    item.bloqueado === 'sim'
                      ? 'bg-red-100'
                      : 'bg-green-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      item.bloqueado === 'sim'
                        ? 'text-red-700'
                        : 'text-green-700'
                    }`}
                  >
                    {item.bloqueado === 'sim' ? 'Bloqueado' : 'Ativo'}
                  </Text>
                </View>
              </View>
              
              {item.celular && (
                <View>
                  <Text className="text-xs text-gray-500">Contato</Text>
                  <Text className="text-sm text-gray-900">{item.celular}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

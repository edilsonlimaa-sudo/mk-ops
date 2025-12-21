import { useClients, useInvalidateClients } from '@/hooks/useClients';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FiltroCliente = 'todos' | 'ativos' | 'bloqueados' | 'com_comodato' | 'turbo';

export default function ClientesScreen() {
  const { data: clients, isLoading, isFetching, error } = useClients();
  const { invalidate } = useInvalidateClients();
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroCliente>('todos');

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

  // Filtra clientes com base no filtro ativo
  const clientesFiltrados = clients?.filter(c => {
    if (filtroAtivo === 'todos') return true;
    if (filtroAtivo === 'ativos') return c.bloqueado !== 'sim';
    if (filtroAtivo === 'bloqueados') return c.bloqueado === 'sim';
    if (filtroAtivo === 'com_comodato') return c.comodato === 'sim';
    if (filtroAtivo === 'turbo') return c.turbo === 'sim';
    return true;
  }) || [];

  // Define filtros disponíveis
  const filtros = [
    { key: 'todos' as const, label: 'Todos', emoji: '📋', count: clients?.length || 0 },
    { 
      key: 'ativos' as const, 
      label: 'Ativos', 
      emoji: '✅', 
      count: clients?.filter(c => c.bloqueado !== 'sim').length || 0 
    },
    { 
      key: 'bloqueados' as const, 
      label: 'Bloqueados', 
      emoji: '🚫', 
      count: clients?.filter(c => c.bloqueado === 'sim').length || 0 
    },
    { 
      key: 'com_comodato' as const, 
      label: 'Comodato', 
      emoji: '📦', 
      count: clients?.filter(c => c.comodato === 'sim').length || 0 
    },
    { 
      key: 'turbo' as const, 
      label: 'Turbo', 
      emoji: '⚡', 
      count: clients?.filter(c => c.turbo === 'sim').length || 0 
    },
  ];

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
      {/* Header e Filter Pills */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Clientes</Text>
        <Text className="text-gray-500 text-sm mb-3">
          {clientesFiltrados.length} de {clients?.length || 0} clientes
        </Text>

        {/* Filter Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {filtros.map((filtro) => (
            <TouchableOpacity
              key={filtro.key}
              onPress={() => setFiltroAtivo(filtro.key)}
              className={`flex-row items-center px-3 py-2 rounded-full ${
                filtroAtivo === filtro.key
                  ? filtro.key === 'bloqueados'
                    ? 'bg-red-600'
                    : filtro.key === 'ativos'
                    ? 'bg-green-600'
                    : filtro.key === 'turbo'
                    ? 'bg-purple-600'
                    : 'bg-blue-600'
                  : 'bg-gray-100'
              }`}
            >
              <Text className="text-sm mr-1">{filtro.emoji}</Text>
              <Text
                className={`text-sm font-semibold ${
                  filtroAtivo === filtro.key ? 'text-white' : 'text-gray-700'
                }`}
              >
                {filtro.label}
              </Text>
              {filtro.count > 0 && (
                <View
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full ${
                    filtroAtivo === filtro.key ? 'bg-white/30' : 'bg-gray-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      filtroAtivo === filtro.key ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {filtro.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Clientes */}
      <FlatList
        data={clientesFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View className="justify-center items-center py-12">
            <Text className="text-gray-500 text-center">
              Nenhum cliente encontrado
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border-l-4 border-blue-500">
            {/* Header com badges de status */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold text-gray-900 flex-1">
                {item.nome}
              </Text>
              <View className="flex-row gap-1">
                {item.turbo === 'sim' && (
                  <View className="bg-purple-100 px-2 py-0.5 rounded">
                    <Text className="text-xs font-bold text-purple-700">⚡</Text>
                  </View>
                )}
                {item.comodato === 'sim' && (
                  <View className="bg-blue-100 px-2 py-0.5 rounded">
                    <Text className="text-xs font-bold text-blue-700">📦</Text>
                  </View>
                )}
              </View>
            </View>
            
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

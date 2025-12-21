import { useClients, useInvalidateClients } from '@/hooks/useClients';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FiltroCliente = 'todos' | 'ativos' | 'bloqueados';

export default function ClientesScreen() {
  const { data: clients, isLoading, isFetching, error } = useClients();
  const { invalidate } = useInvalidateClients();
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroCliente>('todos');
  const [buscaTexto, setBuscaTexto] = useState('');

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

  // Filtra clientes por pill primeiro
  const clientesPorPill = clients?.filter(c => {
    if (filtroAtivo === 'todos') return true;
    if (filtroAtivo === 'ativos') return c.bloqueado !== 'sim';
    if (filtroAtivo === 'bloqueados') return c.bloqueado === 'sim';
    return true;
  }) || [];

  // Depois aplica busca textual (nome, celular, cpf_cnpj)
  const clientesFiltrados = clientesPorPill.filter(c => {
    if (!buscaTexto.trim()) return true;
    
    const busca = buscaTexto.toLowerCase().trim();
    const nome = (c.nome || '').toLowerCase();
    const celular = (c.celular || '').toLowerCase();
    const cpf = (c.cpf_cnpj || '').toLowerCase();
    
    return nome.includes(busca) || celular.includes(busca) || cpf.includes(busca);
  });

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
    <View className="flex-1 bg-gray-50">
      {/* Filter Pills e Busca - fixas abaixo do header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-gray-500 text-sm mb-3">
          {buscaTexto.trim() 
            ? `${clientesFiltrados.length} encontrados de ${clientesPorPill.length} ${filtroAtivo === 'todos' ? 'clientes' : filtroAtivo}`
            : `${clientesFiltrados.length} ${filtroAtivo === 'todos' ? 'clientes' : filtroAtivo}`
          }
        </Text>

        {/* Filter Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          className="mb-3"
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

        {/* Campo de Busca */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mt-3">
          <Text className="text-gray-400 text-lg mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-gray-900"
            placeholder="Buscar por nome, celular, CPF..."
            placeholderTextColor="#9ca3af"
            value={buscaTexto}
            onChangeText={setBuscaTexto}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {buscaTexto.length > 0 && (
            <TouchableOpacity onPress={() => setBuscaTexto('')} className="ml-2">
              <Text className="text-gray-400 text-lg">⊗</Text>
            </TouchableOpacity>
          )}
        </View>
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
            {/* Header */}
            <View className="mb-2">
              <Text className="text-lg font-semibold text-gray-900">
                {item.nome}
              </Text>
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
    </View>
  );
}

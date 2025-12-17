import { useClientes } from '@/hooks/useClientes';
import { Cliente } from '@/services/api/cliente.service';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ClientesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    allClientes,
    totalClientes,
    loadedClientes,
    isLoadingAll,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useClientes();

  // Filtra clientes baseado na busca
  const filteredClientes = useMemo(() => {
    if (!searchQuery.trim()) return allClientes;
    
    const query = searchQuery.toLowerCase();
    return allClientes.filter((cliente) => {
      if (!cliente) return false;
      return (
        cliente.nome?.toLowerCase().includes(query) ||
        cliente.cpf_cnpj?.toLowerCase().includes(query) ||
        cliente.email?.toLowerCase().includes(query) ||
        cliente.login?.toLowerCase().includes(query) ||
        cliente.endereco?.toLowerCase().includes(query) ||
        cliente.cidade?.toLowerCase().includes(query)
      );
    });
  }, [allClientes, searchQuery]);

  // Renderiza item da lista
  const renderClienteItem = ({ item }: { item: Cliente }) => {
    if (!item) {
      return null;
    }
    
    return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 shadow-sm active:opacity-70"
      onPress={() => {
        // TODO: Navegar para detalhes do cliente
        console.log('Cliente selecionado:', item.uuid);
      }}>
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-900 flex-1" numberOfLines={1}>
          {item.nome}
        </Text>
        <View className="px-2 py-1 rounded-full bg-blue-100">
          <Text className="text-xs font-medium text-blue-700">
            {item.tipo}
          </Text>
        </View>
      </View>
      
      {item.login && (
        <Text className="text-sm text-gray-600 mb-1">
          👤 Login: {item.login}
        </Text>
      )}
      
      {item.cpf_cnpj && (
        <Text className="text-sm text-gray-600 mb-1">
          📄 {item.cpf_cnpj}
        </Text>
      )}
      
      {item.email && (
        <Text className="text-sm text-gray-600 mb-1" numberOfLines={1}>
          ✉️ {item.email}
        </Text>
      )}
      
      {item.endereco && (
        <Text className="text-sm text-gray-500" numberOfLines={1}>
          📍 {item.endereco}, {item.numero} - {item.bairro}, {item.cidade}/{item.estado}
        </Text>
      )}
    </TouchableOpacity>
    );
  };

  // Loading inicial
  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Carregando clientes...</Text>
      </View>
    );
  }

  // Estado de erro
  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center p-6">
        <Text className="text-red-500 text-xl font-bold mb-2">❌ Erro</Text>
        <Text className="text-gray-600 text-center mb-4">
          {error instanceof Error ? error.message : 'Erro ao carregar clientes'}
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={() => refetch()}>
          <Text className="text-white font-semibold">Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header fixo */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-3xl font-bold text-gray-900">Clientes</Text>
            <Text className="text-sm text-gray-500 mt-1">
              {isLoadingAll 
                ? `Carregando... ${loadedClientes} de ${totalClientes}` 
                : `${totalClientes.toLocaleString('pt-BR')} registros`}
            </Text>
          </View>
        </View>

        {/* Campo de busca */}
        <TextInput
          className="bg-gray-100 rounded-lg px-4 py-3 text-gray-900"
          placeholder="Buscar por nome, CPF/CNPJ, email, login..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoadingAll}
        />
        
        {/* Aviso de carregamento */}
        {isLoadingAll && (
          <View className="flex-row items-center mt-2">
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text className="text-xs text-blue-600 ml-2">
              Carregando todos os clientes para busca completa...
            </Text>
          </View>
        )}
      </View>

      {/* Lista de clientes */}
      <FlatList
        data={filteredClientes}
        renderItem={renderClienteItem}
        keyExtractor={(item) => item.uuid}
        contentContainerStyle={{ padding: 16 }}
        // Pull to refresh
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#3b82f6"
          />
        }
        // Infinite scroll - desabilitado, carregamento é automático agora
        onEndReachedThreshold={0.5}
        // Footer com loading
        ListFooterComponent={() => {
          if (isLoadingAll) {
            return (
              <View className="py-4">
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text className="text-center text-gray-500 text-xs mt-2">
                  Carregando mais clientes...
                </Text>
              </View>
            );
          }
          if (!isLoadingAll && filteredClientes.length > 0) {
            return (
              <Text className="text-center text-gray-500 py-4">
                ✓ Todos os {totalClientes} clientes carregados
              </Text>
            );
          }
          return null;
        }}
        // Lista vazia
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500 text-lg mb-2">
              {searchQuery ? '🔍 Nenhum resultado' : '📋 Nenhum cliente'}
            </Text>
            <Text className="text-gray-400 text-sm">
              {searchQuery ? 'Tente outro termo de busca' : 'Adicione clientes para vê-los aqui'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

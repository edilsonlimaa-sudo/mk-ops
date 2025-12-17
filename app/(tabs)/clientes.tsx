import { useClientes } from '@/hooks/useClientes';
import { Cliente } from '@/services/api/cliente.service';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type FilterType = 'todos' | 'ativos' | 'bloqueados' | 'pppoe' | 'hotspot';

export default function ClientesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('todos');
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

  // Calcula estatísticas
  const stats = useMemo(() => {
    const ativos = allClientes.filter((c) => c.bloqueado === 'nao').length;
    const bloqueados = allClientes.filter((c) => c.bloqueado === 'sim').length;
    const pppoe = allClientes.filter((c) => c.tipo === 'pppoe').length;
    const hotspot = allClientes.filter((c) => c.tipo === 'hotspot').length;

    return { ativos, bloqueados, pppoe, hotspot };
  }, [allClientes]);

  // Filtra clientes (apenas quando terminar de carregar)
  const filteredClientes = useMemo(() => {
    // Durante o carregamento, retorna array vazio para não processar
    if (isLoading || isLoadingAll) {
      return [];
    }

    let filtered = allClientes;

    // Aplica filtro rápido
    switch (activeFilter) {
      case 'ativos':
        filtered = filtered.filter((c) => c.bloqueado === 'nao');
        break;
      case 'bloqueados':
        filtered = filtered.filter((c) => c.bloqueado === 'sim');
        break;
      case 'pppoe':
        filtered = filtered.filter((c) => c.tipo === 'pppoe');
        break;
      case 'hotspot':
        filtered = filtered.filter((c) => c.tipo === 'hotspot');
        break;
      default:
        break;
    }

    // Aplica busca textual
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((cliente) => {
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
    }

    return filtered;
  }, [allClientes, searchQuery, activeFilter, isLoading, isLoadingAll]);

  // Skeleton loader
  const renderSkeletonItem = () => (
    <View className="bg-white rounded-xl p-4 mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <View className="h-5 bg-gray-200 rounded w-3/4" />
        <View className="h-5 bg-gray-200 rounded w-16" />
      </View>
      <View className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <View className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
      <View className="h-4 bg-gray-200 rounded w-full" />
    </View>
  );

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

  // Estado de erro (exceto quando não há registros)
  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar clientes';
    const isEmptyState = errorMessage.toLowerCase().includes('registros nao encontrados') || 
                         errorMessage.toLowerCase().includes('nenhum registro');
    
    if (!isEmptyState) {
      return (
        <View className="flex-1 bg-gray-50 justify-center items-center p-6">
          <Text className="text-red-500 text-xl font-bold mb-2">❌ Erro</Text>
          <Text className="text-gray-600 text-center mb-4">
            {errorMessage}
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={() => refetch()}>
            <Text className="text-white font-semibold">Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // Se for "sem registros", continua para renderizar lista vazia
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header fixo */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <View className="mb-4">
          <Text className="text-3xl font-bold text-gray-900">Clientes</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {isLoadingAll 
              ? `Carregando... ${loadedClientes} de ${totalClientes}` 
              : `${filteredClientes.length} de ${totalClientes}`}
          </Text>
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
        {/* Filtros rápidos */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 -mx-6"
          contentContainerStyle={{ paddingHorizontal: 24 }}>
          <TouchableOpacity
            className={`mr-2 px-4 py-2 rounded-full ${
              activeFilter === 'todos'
                ? 'bg-blue-500'
                : 'bg-gray-200'
            }`}
            onPress={() => setActiveFilter('todos')}>
            <Text
              className={`text-sm font-medium ${
                activeFilter === 'todos'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}>
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`mr-2 px-4 py-2 rounded-full ${
              activeFilter === 'ativos'
                ? 'bg-green-500'
                : 'bg-gray-200'
            }`}
            onPress={() => setActiveFilter('ativos')}>
            <Text
              className={`text-sm font-medium ${
                activeFilter === 'ativos'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}>
              Ativos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`mr-2 px-4 py-2 rounded-full ${
              activeFilter === 'bloqueados'
                ? 'bg-red-500'
                : 'bg-gray-200'
            }`}
            onPress={() => setActiveFilter('bloqueados')}>
            <Text
              className={`text-sm font-medium ${
                activeFilter === 'bloqueados'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}>
              Bloqueados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`mr-2 px-4 py-2 rounded-full ${
              activeFilter === 'pppoe'
                ? 'bg-purple-500'
                : 'bg-gray-200'
            }`}
            onPress={() => setActiveFilter('pppoe')}>
            <Text
              className={`text-sm font-medium ${
                activeFilter === 'pppoe'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}>
              PPPoE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${
              activeFilter === 'hotspot'
                ? 'bg-orange-500'
                : 'bg-gray-200'
            }`}
            onPress={() => setActiveFilter('hotspot')}>
            <Text
              className={`text-sm font-medium ${
                activeFilter === 'hotspot'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}>
              Hotspot
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Stats Overview - discreto */}
        {(isLoading || isLoadingAll) ? (
          <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
            <View className="h-3 bg-gray-200 rounded w-16" />
            <View className="h-3 bg-gray-200 rounded w-20" />
            <View className="h-3 bg-gray-200 rounded w-16" />
            <View className="h-3 bg-gray-200 rounded w-16" />
          </View>
        ) : allClientes.length > 0 ? (
          <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
            <Text className="text-xs text-gray-500">
              ✓ {stats.ativos} ativos
            </Text>
            <Text className="text-xs text-gray-500">
              ✕ {stats.bloqueados} bloqueados
            </Text>
            <Text className="text-xs text-gray-500">
              🔐 {stats.pppoe} PPPoE
            </Text>
            <Text className="text-xs text-gray-500">
              🌐 {stats.hotspot} Hotspot
            </Text>
          </View>
        ) : null}
      </View>

      {/* Lista de clientes */}
      {(isLoading || isLoadingAll) ? (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <View key={index}>{renderSkeletonItem()}</View>
          ))}
        </ScrollView>
      ) : (
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
      )}
    </View>
  );
}

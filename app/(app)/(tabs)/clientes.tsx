import { ClienteCard } from '@/components/cliente/ClienteCard';
import { FilterPill, FilterPillOption } from '@/components/ui/filter-pill';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useClients, useInvalidateClients } from '@/hooks/cliente';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FiltroCliente = 'todos' | 'ativos' | 'inativos' | 'bloqueados';

export default function ClientesScreen() {
  const { data: clients, isLoading, isFetching, error } = useClients();
  const { invalidate } = useInvalidateClients();
  const { colors } = useTheme();
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroCliente>('todos');
  const [buscaTexto, setBuscaTexto] = useState('');
  const router = useRouter();

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
    if (filtroAtivo === 'ativos') return c.cli_ativado === 's';
    if (filtroAtivo === 'inativos') return c.cli_ativado === 'n';
    if (filtroAtivo === 'bloqueados') return c.cli_ativado === 's' && c.bloqueado === 'sim';
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
  const filtros: FilterPillOption<FiltroCliente>[] = [
    { key: 'todos', label: 'Todos', emoji: '📋', count: clients?.length || 0 },
    { 
      key: 'ativos', 
      label: 'Ativos', 
      emoji: '✅', 
      count: clients?.filter(c => c.cli_ativado === 's').length || 0
    },
    { 
      key: 'bloqueados', 
      label: 'Bloqueados', 
      emoji: '🚫', 
      count: clients?.filter(c => c.cli_ativado === 's' && c.bloqueado === 'sim').length || 0
    },
    { 
      key: 'inativos', 
      label: 'Inativos', 
      emoji: '😴', 
      count: clients?.filter(c => c.cli_ativado === 'n').length || 0
    },
  ];

  if (isLoading && !clients) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: colors.cardTextSecondary, marginTop: 16 }}>Carregando clientes...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text className="text-red-500 text-lg font-semibold mb-2">
          Erro ao carregar clientes
        </Text>
        <Text style={{ color: colors.cardTextSecondary }} className="text-center mb-4">
          {error.message}
        </Text>
        <TouchableOpacity
          onPress={invalidate}
          className="bg-blue-600 px-6 py-3 rounded-lg mt-2"
          activeOpacity={0.7}
        >
          <Text className="text-white font-semibold">Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ThemedView variant="screen" className="flex-1">
      {/* Filter Pills e Busca - fixas abaixo do header */}
      <ThemedView variant="header" className="px-4 py-3">
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
            <FilterPill
              key={filtro.key}
              option={filtro}
              isActive={filtroAtivo === filtro.key}
              onPress={setFiltroAtivo}
            />
          ))}
        </ScrollView>

        {/* Campo de Busca */}
        <View 
          className="flex-row items-center rounded-lg px-3 py-1.5 mt-3"
          style={{ backgroundColor: colors.searchInputBackground }}
        >
          <Text className="text-base mr-2" style={{ color: colors.searchInputIcon }}>🔍</Text>
          <TextInput
            className="flex-1 text-sm"
            style={{ color: colors.searchInputText }}
            placeholder="Buscar por nome, celular, CPF..."
            placeholderTextColor={colors.searchInputPlaceholder}
            value={buscaTexto}
            onChangeText={setBuscaTexto}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {buscaTexto.length > 0 && (
            <TouchableOpacity onPress={() => setBuscaTexto('')} className="ml-2">
              <Text className="text-base" style={{ color: colors.searchInputIcon }}>⊝</Text>
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>

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
          <ClienteCard
            cliente={item}
            onPress={() => router.push(`/detalhes/cliente/${item.uuid_cliente}/`)}
          />
        )}
      />
    </ThemedView>
  );
}

import { ChamadoCard } from '@/components/chamado/ChamadoCard';
import { InstalacaoCard } from '@/components/instalacao/InstalacaoCard';
import { FilterPill, FilterPillOption } from '@/components/ui/filter-pill';
import { ThemedView } from '@/components/ui/themed-view';
import { useHistorico, useInvalidateHistorico } from '@/hooks/historico';
import { isChamado, isInstalacao } from '@/services/api/agenda';
import { Chamado } from '@/types/chamado';
import { Instalacao } from '@/types/instalacao';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FiltroFechado = 'hoje' | 'ontem' | 'ultimos_7_dias';

export default function HistoricoScreen() {
  const { data: historico, isLoading, isFetching, error } = useHistorico();
  const { invalidate } = useInvalidateHistorico();
  const [filtroFechado, setFiltroFechado] = useState<FiltroFechado>('hoje');
  const router = useRouter();

  const handleRefresh = async () => {
    await invalidate();
  };

  // Função para categorizar item fechado/concluído por data
  const categorizarFechamento = (item: Chamado | Instalacao) => {
    const dataStr = isChamado(item) ? item.fechamento : item.datainst;
    if (!dataStr) return null;

    try {
      const dataFechamento = new Date(dataStr.replace(' ', 'T'));
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);

      const seteDiasAtras = new Date(hoje);
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

      const fechamentoData = new Date(dataFechamento);
      fechamentoData.setHours(0, 0, 0, 0);

      if (fechamentoData.getTime() === hoje.getTime()) return 'hoje';
      if (fechamentoData.getTime() === ontem.getTime()) return 'ontem';
      if (fechamentoData >= seteDiasAtras) return 'ultimos_7_dias';
      return null;
    } catch {
      return null;
    }
  };

  // Filtra itens com base no filtro ativo
  const historicoFiltrado = historico?.filter(item => {
    const categoria = categorizarFechamento(item);
    return categoria === filtroFechado;
  }) || [];

  const filtros: FilterPillOption<FiltroFechado>[] = [
    { key: 'hoje', label: 'Hoje', emoji: '📅', count: historico?.filter(item => categorizarFechamento(item) === 'hoje').length || 0 },
    { key: 'ontem', label: 'Ontem', emoji: '🕐', count: historico?.filter(item => categorizarFechamento(item) === 'ontem').length || 0 },
    { key: 'ultimos_7_dias', label: 'Últimos 7 dias', emoji: '📆', count: historico?.filter(item => categorizarFechamento(item) === 'ultimos_7_dias').length || 0 },
  ];

  if (isLoading && !historico) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-gray-600 mt-4">Carregando histórico...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
        <Text className="text-red-500 text-lg font-semibold mb-2">
          Erro ao carregar histórico
        </Text>
        <Text className="text-gray-600 text-center mb-4">
          {error.message}
        </Text>
        <TouchableOpacity
          onPress={invalidate}
          className="bg-green-600 px-6 py-3 rounded-lg mt-2"
          activeOpacity={0.7}
        >
          <Text className="text-white font-semibold">Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ThemedView variant="screen" className="flex-1">
      {/* Filter Pills - fixas abaixo do header */}
      <ThemedView variant="header" className="px-4 py-3">
        <Text className="text-gray-500 text-sm mb-3">
          {historicoFiltrado.length} de {historico?.length || 0} itens concluídos
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {filtros.map((filtro) => (
            <FilterPill
              key={filtro.key}
              option={filtro}
              isActive={filtroFechado === filtro.key}
              onPress={setFiltroFechado}
            />
          ))}
        </ScrollView>
      </ThemedView>

      {/* Lista */}
      <FlatList
        data={historicoFiltrado}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View className="justify-center items-center py-12">
            <Text className="text-gray-500 text-center">
              Nenhum item concluído encontrado
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          // Renderiza card de Chamado
          if (isChamado(item)) {
            return (
              <ChamadoCard
                chamado={item as Chamado}
                variant="historico"
                onPress={() => router.push(`/detalhes/chamado/${item.uuid_suporte}`)}
              />
            );
          }

          // Renderiza card de Instalação
          if (isInstalacao(item)) {
            return (
              <InstalacaoCard
                instalacao={item as Instalacao}
                variant="historico"
                onPress={() => router.push(`/detalhes/instalacao/${item.uuid_solic}`)}
              />
            );
          }

          return null;
        }}
      />
    </ThemedView>
  );
}

import { useChamadosFechados, useInvalidateChamadosFechados } from '@/hooks/useChamadosFechados';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FiltroFechado = 'hoje' | 'ontem' | 'ultimos_7_dias';

export default function HistoricoScreen() {
  const { data: chamados, isLoading, isFetching, error } = useChamadosFechados();
  const { invalidate } = useInvalidateChamadosFechados();
  const [filtroFechado, setFiltroFechado] = useState<FiltroFechado>('hoje');
  const router = useRouter();

  const handleRefresh = async () => {
    await invalidate();
  };

  // Função para categorizar chamado fechado por data
  const categorizarFechamento = (dataStr: string | null) => {
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

  // Filtra chamados com base no filtro ativo
  const chamadosFiltrados = chamados?.filter(c => {
    const categoria = categorizarFechamento(c.fechamento);
    return categoria === filtroFechado;
  }) || [];

  const filtros = [
    { key: 'hoje' as const, label: 'Hoje', emoji: '📅', count: chamados?.filter(c => categorizarFechamento(c.fechamento) === 'hoje').length || 0 },
    { key: 'ontem' as const, label: 'Ontem', emoji: '🕐', count: chamados?.filter(c => categorizarFechamento(c.fechamento) === 'ontem').length || 0 },
    { key: 'ultimos_7_dias' as const, label: 'Últimos 7 dias', emoji: '📆', count: chamados?.filter(c => categorizarFechamento(c.fechamento) === 'ultimos_7_dias').length || 0 },
  ];

  const formatarDataHora = (dataStr: string | null) => {
    if (!dataStr) return null;

    try {
      const data = new Date(dataStr.replace(' ', 'T'));
      if (isNaN(data.getTime())) return null;

      const dataFormatada = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
      const horaFormatada = data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return { data: dataFormatada, hora: horaFormatada, completo: `${dataFormatada} às ${horaFormatada}` };
    } catch {
      return null;
    }
  };

  if (isLoading && !chamados) {
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
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Filter Pills - fixas abaixo do header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-gray-500 text-sm mb-3">
          {chamadosFiltrados.length} de {chamados?.length || 0} chamados
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {filtros.map((filtro) => (
            <TouchableOpacity
              key={filtro.key}
              onPress={() => setFiltroFechado(filtro.key)}
              className={`flex-row items-center px-3 py-2 rounded-full ${filtroFechado === filtro.key ? 'bg-green-600' : 'bg-gray-100'
                }`}
            >
              <Text className="text-sm mr-1">{filtro.emoji}</Text>
              <Text
                className={`text-sm font-semibold ${filtroFechado === filtro.key ? 'text-white' : 'text-gray-700'
                  }`}
              >
                {filtro.label}
              </Text>
              {filtro.count > 0 && (
                <View
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full ${filtroFechado === filtro.key ? 'bg-white/30' : 'bg-gray-200'
                    }`}
                >
                  <Text
                    className={`text-xs font-bold ${filtroFechado === filtro.key ? 'text-white' : 'text-gray-700'
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

      {/* Lista */}
      <FlatList
        data={chamadosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View className="justify-center items-center py-12">
            <Text className="text-gray-500 text-center">
              Nenhum chamado concluído encontrado
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const dataFechamento = item.fechamento ? formatarDataHora(item.fechamento) : null;

          return (
            <TouchableOpacity
              onPress={() => router.push(`/detalhes/chamado/${item.id}` as any)}
              activeOpacity={0.7}
            >
              <View className="bg-white rounded-lg p-3 mb-2 shadow-sm border-l-4 border-green-500">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-2">
                <View
                  className={`px-2 py-0.5 rounded ${item.prioridade === 'alta'
                      ? 'bg-red-500'
                      : item.prioridade === 'media'
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                >
                  <Text className="text-xs font-bold text-white">
                    {item.prioridade?.toUpperCase() || 'NORMAL'}
                  </Text>
                </View>
                <Text className="text-xs font-mono text-gray-500">
                  #{item.chamado}
                </Text>
              </View>

              {/* Cliente */}
              <View className="mb-2">
                <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                  {item.nome || 'Cliente não identificado'}
                </Text>
                {item.ramal && (
                  <Text className="text-xs text-gray-500" numberOfLines={1}>
                    {item.ramal}
                  </Text>
                )}
              </View>

              {/* Assunto */}
              <Text className="text-sm text-gray-700 mb-2" numberOfLines={2}>
                {item.assunto || 'Sem assunto'}
              </Text>

              {/* Motivo fechamento */}
              {item.motivo_fechar && (
                <View className="bg-green-50 px-2 py-1 rounded mb-2">
                  <Text className="text-xs text-green-700">
                    ✓ {item.motivo_fechar}
                  </Text>
                </View>
              )}

              {/* Footer */}
              <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                <Text className="text-xs text-gray-500">
                  Fechado: {dataFechamento?.completo || 'Data não disponível'}
                </Text>
                <Text className="text-xs text-gray-600" numberOfLines={1}>
                  {item.atendente || 'Não atribuído'}
                </Text>
              </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

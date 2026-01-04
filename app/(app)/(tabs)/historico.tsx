import { FilterPill, FilterPillOption } from '@/components/ui/filter-pill';
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
    <View className="flex-1 bg-gray-50">
      {/* Filter Pills - fixas abaixo do header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
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
      </View>

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
          const ehChamado = isChamado(item);
          const ehInstalacao = isInstalacao(item);
          const dataFechamento = ehChamado 
            ? (item.fechamento ? formatarDataHora(item.fechamento) : null)
            : (item.datainst ? formatarDataHora(item.datainst) : null);

          // Navegação condicional
          const handlePress = () => {
            if (ehChamado) {
              router.push(`/detalhes/chamado/${item.uuid_suporte}`);
            } else if (ehInstalacao) {
              router.push(`/detalhes/instalacao/${item.uuid_solic}`);
            }
          };

          return (
            <TouchableOpacity
              onPress={handlePress}
              activeOpacity={0.7}
            >
              <View className={`bg-white rounded-lg p-3 mb-2 shadow-sm border-l-4 ${ehChamado ? 'border-green-500' : 'border-blue-500'}`}>
                {/* Header */}
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`px-2 py-0.5 rounded ${
                        ehChamado
                          ? (item.prioridade === 'alta' || item.prioridade === 'Alta')
                            ? 'bg-red-500'
                            : (item.prioridade === 'media' || item.prioridade === 'Média')
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          : 'bg-blue-500'
                      }`}
                    >
                      <Text className="text-xs font-bold text-white">
                        {ehChamado ? (item.prioridade?.toUpperCase() || 'NORMAL') : 'INSTALAÇÃO'}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs font-mono text-gray-500">
                    {ehChamado ? `#${item.chamado}` : `#${item.id}`}
                  </Text>
                </View>

                {/* Cliente/Nome */}
                <View className="mb-2">
                  <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                    {item.nome || 'Cliente não identificado'}
                  </Text>
                  {ehChamado && item.ramal && (
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {item.ramal}
                    </Text>
                  )}
                  {ehInstalacao && (
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {item.plano}
                    </Text>
                  )}
                </View>

                {/* Assunto/Descrição */}
                <Text className="text-sm text-gray-700 mb-2" numberOfLines={2}>
                  {ehChamado 
                    ? (item.assunto || 'Sem assunto')
                    : `${item.endereco}, ${item.numero} - ${item.bairro}`
                  }
                </Text>

                {/* Motivo fechamento / Status instalação */}
                {ehChamado && item.motivo_fechar && (
                  <View className="bg-green-50 px-2 py-1 rounded mb-2">
                    <Text className="text-xs text-green-700">
                      ✓ {item.motivo_fechar}
                    </Text>
                  </View>
                )}
                {ehInstalacao && item.instalado === 'sim' && (
                  <View className="bg-blue-50 px-2 py-1 rounded mb-2">
                    <Text className="text-xs text-blue-700">
                      ✓ Instalação concluída
                    </Text>
                  </View>
                )}

                {/* Footer */}
                <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                  <Text className="text-xs text-gray-500">
                    {ehChamado ? 'Fechado: ' : 'Instalado: '}
                    {dataFechamento?.completo || 'Data não disponível'}
                  </Text>
                  <Text className="text-xs text-gray-600" numberOfLines={1}>
                    {ehChamado ? (item.atendente || 'Não atribuído') : (item.tecnico || 'Não atribuído')}
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

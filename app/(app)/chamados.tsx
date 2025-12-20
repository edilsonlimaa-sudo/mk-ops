import { useChamados, useInvalidateChamados } from '@/hooks/useChamados';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FiltroCategoria = 'todos' | 'atrasado' | 'hoje' | 'amanha' | 'proximo' | 'sem_agendamento';

export default function ChamadosScreen() {
  const { data: chamados, isLoading, isFetching, error } = useChamados('aberto');
  const { invalidate } = useInvalidateChamados();
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroCategoria>('todos');

  const handleRefresh = async () => {
    await invalidate('aberto');
  };

  // Função para categorizar visita
  const categorizarVisita = (dataStr: string | null) => {
    if (!dataStr) return 'sem_agendamento';
    
    try {
      const dataVisita = new Date(dataStr.replace(' ', 'T'));
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      
      const visitaData = new Date(dataVisita);
      visitaData.setHours(0, 0, 0, 0);
      
      if (visitaData < hoje) return 'atrasado';
      if (visitaData.getTime() === hoje.getTime()) return 'hoje';
      if (visitaData.getTime() === amanha.getTime()) return 'amanha';
      return 'proximo';
    } catch {
      return 'sem_agendamento';
    }
  };

  // Ordena e categoriza chamados por data de visita
  const chamadosOrganizados = chamados ? [...chamados].sort((a, b) => {
    if (!a.visita && !b.visita) return 0;
    if (!a.visita) return 1;
    if (!b.visita) return -1;
    
    const dataA = new Date(a.visita.replace(' ', 'T'));
    const dataB = new Date(b.visita.replace(' ', 'T'));
    return dataA.getTime() - dataB.getTime();
  }) : [];

  // Define filtros disponíveis
  const filtros = [
    { key: 'todos' as const, label: 'Todos', emoji: '📋', count: chamadosOrganizados.length },
    { 
      key: 'atrasado' as const, 
      label: 'Atrasados', 
      emoji: '🚨', 
      count: chamadosOrganizados.filter(c => categorizarVisita(c.visita) === 'atrasado').length 
    },
    { 
      key: 'hoje' as const, 
      label: 'Hoje', 
      emoji: '⚡', 
      count: chamadosOrganizados.filter(c => categorizarVisita(c.visita) === 'hoje').length 
    },
    { 
      key: 'amanha' as const, 
      label: 'Amanhã', 
      emoji: '📅', 
      count: chamadosOrganizados.filter(c => categorizarVisita(c.visita) === 'amanha').length 
    },
    { 
      key: 'proximo' as const, 
      label: 'Próximos', 
      emoji: '🗓️', 
      count: chamadosOrganizados.filter(c => categorizarVisita(c.visita) === 'proximo').length 
    },
    { 
      key: 'sem_agendamento' as const, 
      label: 'Sem data', 
      emoji: '❓', 
      count: chamadosOrganizados.filter(c => categorizarVisita(c.visita) === 'sem_agendamento').length 
    },
  ];

  // Filtra chamados com base no filtro ativo
  const chamadosFiltrados = filtroAtivo === 'todos' 
    ? chamadosOrganizados 
    : chamadosOrganizados.filter(c => categorizarVisita(c.visita) === filtroAtivo);

  // Define cor da borda com base na categoria
  const getBorderColor = (categoria: string) => {
    if (categoria === 'atrasado') return 'border-red-500';
    if (categoria === 'hoje') return 'border-orange-500';
    if (categoria === 'amanha') return 'border-yellow-500';
    if (categoria === 'proximo') return 'border-blue-500';
    return 'border-gray-400';
  };

  if (isLoading && !chamados) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Carregando chamados...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
        <Text className="text-red-500 text-lg font-semibold mb-2">
          Erro ao carregar chamados
        </Text>
        <Text className="text-gray-600 text-center mb-4">
          {error.message}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header fixo */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Agenda de Atendimentos</Text>
        <Text className="text-gray-500 text-sm mb-3">
          {chamados?.length || 0} chamados em aberto
        </Text>

        {/* Filtros em Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {filtros.map((filtro) => (
            <TouchableOpacity
              key={filtro.key}
              onPress={() => setFiltroAtivo(filtro.key)}
              className={`flex-row items-center px-3 py-2 rounded-full ${
                filtroAtivo === filtro.key
                  ? filtro.key === 'atrasado'
                    ? 'bg-red-500'
                    : filtro.key === 'hoje'
                    ? 'bg-orange-500'
                    : filtro.key === 'amanha'
                    ? 'bg-yellow-500'
                    : filtro.key === 'proximo'
                    ? 'bg-blue-500'
                    : 'bg-gray-700'
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

      {/* Lista de chamados */}
      <FlatList
        data={chamadosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View className="justify-center items-center py-12">
            <Text className="text-gray-500 text-center">
              Nenhum chamado encontrado
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          // Formata data com hora
          const formatarDataHora = (dataStr: string) => {
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

          const dataAbertura = formatarDataHora(item.abertura);
          const dataVisita = item.visita ? formatarDataHora(item.visita) : null;
          const categoria = categorizarVisita(item.visita);

          return (
            <View className={`bg-white rounded-lg p-3 mb-2 shadow-sm border-l-4 ${getBorderColor(categoria)}`}>
              {/* Header: Prioridade e Número */}
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center gap-2">
                  <View
                    className={`px-2 py-0.5 rounded ${
                      item.prioridade === 'alta'
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
                </View>
                <Text className="text-xs font-mono text-gray-500">
                  #{item.chamado}
                </Text>
              </View>

              {/* CLIENTE e VISITA */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                    {item.nome || 'Cliente não identificado'}
                  </Text>
                  {item.ramal && (
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {item.ramal}
                    </Text>
                  )}
                </View>
                
                {dataVisita && (
                  <View className="bg-gray-100 px-2 py-1 rounded ml-2">
                    <Text className="text-xs font-bold text-gray-700">
                      {dataVisita.data} {dataVisita.hora}
                    </Text>
                  </View>
                )}
              </View>

              {/* PROBLEMA */}
              <Text className="text-sm text-gray-700 mb-2" numberOfLines={2}>
                {item.assunto || 'Sem assunto'}
              </Text>

              {/* Footer */}
              <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                <Text className="text-xs text-gray-500">
                  Aberto: {dataAbertura?.data}
                </Text>
                <Text className="text-xs text-gray-600" numberOfLines={1}>
                  {item.atendente || '🔴 Livre'}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

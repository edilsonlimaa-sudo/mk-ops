import { useAgenda, useInvalidateAgenda } from '@/hooks/agenda';
import { isChamado, isInstalacao } from '@/services/api/agenda';
import { Chamado } from '@/types/chamado';
import { Instalacao } from '@/types/instalacao';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FiltroCategoria = 'todos' | 'atrasado' | 'hoje' | 'amanha' | 'proximo' | 'sem_agendamento';

export default function AgendaScreen() {
  const { data: servicos, isLoading, isFetching, error } = useAgenda();
  const { invalidate } = useInvalidateAgenda();
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroCategoria>('todos');
  const router = useRouter();

  const handleRefresh = async () => {
    await invalidate();
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

  // Servicos já vêm ordenados do service
  const servicosOrganizados = servicos || [];

  // Define filtros disponíveis
  const filtros = [
    { key: 'todos' as const, label: 'Todos', emoji: '📋', count: servicosOrganizados.length },
    { 
      key: 'atrasado' as const, 
      label: 'Atrasados', 
      emoji: '🚨', 
      count: servicosOrganizados.filter(s => categorizarVisita(s.visita) === 'atrasado').length 
    },
    { 
      key: 'hoje' as const, 
      label: 'Hoje', 
      emoji: '⚡', 
      count: servicosOrganizados.filter(s => categorizarVisita(s.visita) === 'hoje').length 
    },
    { 
      key: 'amanha' as const, 
      label: 'Amanhã', 
      emoji: '📅', 
      count: servicosOrganizados.filter(s => categorizarVisita(s.visita) === 'amanha').length 
    },
    { 
      key: 'proximo' as const, 
      label: 'Próximos', 
      emoji: '🗓️', 
      count: servicosOrganizados.filter(s => categorizarVisita(s.visita) === 'proximo').length 
    },
    { 
      key: 'sem_agendamento' as const, 
      label: 'Sem data', 
      emoji: '❓', 
      count: servicosOrganizados.filter(s => categorizarVisita(s.visita) === 'sem_agendamento').length 
    },
  ];

  // Filtra servicos com base no filtro ativo
  const servicosFiltrados = filtroAtivo === 'todos' 
    ? servicosOrganizados 
    : servicosOrganizados.filter(s => categorizarVisita(s.visita) === filtroAtivo);

  // Define cor da borda com base na categoria
  const getBorderColor = (categoria: string) => {
    if (categoria === 'atrasado') return 'border-red-500';
    if (categoria === 'hoje') return 'border-orange-500';
    if (categoria === 'amanha') return 'border-yellow-500';
    if (categoria === 'proximo') return 'border-blue-500';
    return 'border-gray-400';
  };

  // Formata data com hora
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

  if (isLoading && !servicos) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Carregando agenda...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
        <Text className="text-red-500 text-lg font-semibold mb-2">
          Erro ao carregar agenda
        </Text>
        <Text className="text-gray-600 text-center mb-4">
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
    <View className="flex-1 bg-gray-50">
      {/* Filter Pills - fixas abaixo do header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-gray-500 text-sm mb-3">
          {servicos?.length || 0} serviços em aberto
        </Text>
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

      {/* Lista de serviços */}
      <FlatList
        data={servicosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View className="justify-center items-center py-12">
            <Text className="text-gray-500 text-center">
              Nenhum serviço encontrado
            </Text>
          </View>
        }
        renderItem={({ item }) => {
            const categoria = categorizarVisita(item.visita);
            const borderColor = getBorderColor(categoria);

            // Renderiza card de CHAMADO
            if (isChamado(item)) {
              const chamado = item as Chamado;
              const dataAbertura = formatarDataHora(chamado.abertura);
              const dataVisita = chamado.visita ? formatarDataHora(chamado.visita) : null;

              return (
                <TouchableOpacity
                  onPress={() => router.push(`/detalhes/chamado/${item.uuid_suporte}`)}
                  activeOpacity={0.7}
                >
                  <View className={`bg-white rounded-lg p-3 mb-2 shadow-sm border-l-4 ${borderColor}`}>
                  {/* Badge CHAMADO */}
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center gap-2">
                      <View className="bg-blue-100 px-2 py-0.5 rounded">
                        <Text className="text-xs font-bold text-blue-700">CHAMADO</Text>
                      </View>
                      <View
                        className={`px-2 py-0.5 rounded ${
                          chamado.prioridade === 'alta'
                            ? 'bg-red-500'
                            : chamado.prioridade === 'media'
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                      >
                        <Text className="text-xs font-bold text-white">
                          {chamado.prioridade?.toUpperCase() || 'NORMAL'}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs font-mono text-gray-500">
                      #{chamado.chamado}
                    </Text>
                  </View>

                  {/* Cliente e Visita */}
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                        {chamado.nome || 'Cliente não identificado'}
                      </Text>
                      {chamado.ramal && (
                        <Text className="text-xs text-gray-500" numberOfLines={1}>
                          {chamado.ramal}
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

                  {/* Assunto */}
                  <Text className="text-sm text-gray-700 mb-2" numberOfLines={2}>
                    {chamado.assunto || 'Sem assunto'}
                  </Text>

                  {/* Footer */}
                  <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                    <Text className="text-xs text-gray-500">
                      Aberto: {dataAbertura?.data}
                    </Text>
                    <Text className="text-xs text-gray-600" numberOfLines={1}>
                      {chamado.atendente || '🔴 Livre'}
                    </Text>
                  </View>
                  </View>
                </TouchableOpacity>
              );
            }

            // Renderiza card de INSTALAÇÃO
            if (isInstalacao(item)) {
              const instalacao = item as Instalacao;
              const dataProcessamento = formatarDataHora(instalacao.processamento);
              const dataVisita = instalacao.visita ? formatarDataHora(instalacao.visita) : null;

              return (
                <TouchableOpacity
                  onPress={() => router.push(`/detalhes/instalacao/${item.uuid_solic}`)}
                  activeOpacity={0.7}
                >
                  <View className={`bg-white rounded-lg p-3 mb-2 shadow-sm border-l-4 ${borderColor}`}>
                  {/* Badge INSTALAÇÃO */}
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center gap-2">
                      <View className="bg-purple-100 px-2 py-0.5 rounded">
                        <Text className="text-xs font-bold text-purple-700">INSTALAÇÃO</Text>
                      </View>
                      <View className="bg-purple-500 px-2 py-0.5 rounded">
                        <Text className="text-xs font-bold text-white">
                          {instalacao.plano?.toUpperCase() || 'PLANO'}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs font-mono text-gray-500">
                      #{instalacao.termo}
                    </Text>
                  </View>

                  {/* Cliente e Visita */}
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                        {instalacao.nome || 'Cliente não identificado'}
                      </Text>
                      <Text className="text-xs text-gray-500" numberOfLines={1}>
                        {instalacao.celular || 'Sem telefone'}
                      </Text>
                    </View>
                    
                    {dataVisita && (
                      <View className="bg-gray-100 px-2 py-1 rounded ml-2">
                        <Text className="text-xs font-bold text-gray-700">
                          {dataVisita.data} {dataVisita.hora}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Endereço */}
                  <View className="bg-purple-50 px-2 py-1 rounded mb-2">
                    <Text className="text-xs text-purple-700" numberOfLines={2}>
                      📍 {instalacao.endereco}, {instalacao.numero} - {instalacao.bairro}
                      {instalacao.complemento ? ` (${instalacao.complemento})` : ''}
                    </Text>
                  </View>

                  {/* Footer */}
                  <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                    <Text className="text-xs text-gray-500">
                      Solicitado: {dataProcessamento?.data}
                    </Text>
                    <Text className="text-xs text-gray-600" numberOfLines={1}>
                      {instalacao.login_atend || '🔴 Livre'}
                    </Text>
                  </View>
                  </View>
                </TouchableOpacity>
              );
            }

            return null;
          }}
      />
    </View>
  );
}

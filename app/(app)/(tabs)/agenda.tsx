import { ChamadoCard } from '@/components/chamado/ChamadoCard';
import { InstalacaoCard } from '@/components/instalacao/InstalacaoCard';
import { FilterPill, FilterPillOption } from '@/components/ui/filter-pill';
import { ThemedView } from '@/components/ui/themed-view';
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
  const filtros: FilterPillOption<FiltroCategoria>[] = [
    { key: 'todos', label: 'Todos', emoji: '📋', count: servicosOrganizados.length },
    { 
      key: 'atrasado', 
      label: 'Atrasados', 
      emoji: '🚨', 
      count: servicosOrganizados.filter(s => categorizarVisita(s.visita) === 'atrasado').length
    },
    { 
      key: 'hoje', 
      label: 'Hoje', 
      emoji: '⚡', 
      count: servicosOrganizados.filter(s => categorizarVisita(s.visita) === 'hoje').length
    },
    { 
      key: 'amanha', 
      label: 'Amanhã', 
      emoji: '📅', 
      count: servicosOrganizados.filter(s => categorizarVisita(s.visita) === 'amanha').length
    },
    { 
      key: 'proximo', 
      label: 'Próximos', 
      emoji: '🗓️', 
      count: servicosOrganizados.filter(s => categorizarVisita(s.visita) === 'proximo').length
    },
    { 
      key: 'sem_agendamento', 
      label: 'Sem data', 
      emoji: '❓', 
      count: servicosOrganizados.filter(s => categorizarVisita(s.visita) === 'sem_agendamento').length
    },
  ];

  // Filtra servicos com base no filtro ativo
  const servicosFiltrados = filtroAtivo === 'todos' 
    ? servicosOrganizados 
    : servicosOrganizados.filter(s => categorizarVisita(s.visita) === filtroAtivo);

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
    <ThemedView variant="screen" className="flex-1">
      {/* Filter Pills - fixas abaixo do header */}
      <ThemedView variant="header" className="px-4 py-3">
        <Text className="text-gray-500 text-sm mb-3">
          {servicos?.length || 0} serviços em aberto
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
              isActive={filtroAtivo === filtro.key}
              onPress={setFiltroAtivo}
            />
          ))}
        </ScrollView>
      </ThemedView>

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
            // Renderiza card de Chamado
            if (isChamado(item)) {
              return (
                <ChamadoCard
                  chamado={item as Chamado}
                  onPress={() => router.push(`/detalhes/chamado/${item.uuid_suporte}`)}
                />
              );
            }

            // Renderiza card de Instalação
            if (isInstalacao(item)) {
              return (
                <InstalacaoCard
                  instalacao={item as Instalacao}
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
